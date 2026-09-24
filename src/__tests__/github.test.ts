import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../__mocks__/handlers'
import { GITHUB_API_BASE, GITHUB_GRAPHQL_URL } from '../lib/constants'
import { setGitHubToken, clearGitHubToken } from '../lib/authStore'
import { fetchReposWithIntelligence, validateToken } from '../lib/github'
import type { BuildQueryOptions } from '../lib/utils'

interface RestRepoOverrides {
  id?: number
  full_name?: string
  topics?: string[]
  stargazers_count?: number
  open_issues_count?: number
  license?: { spdx_id: string; name: string; url: null } | null
}

function makeRestRepo(overrides: RestRepoOverrides = {}) {
  const id = overrides.id ?? 1
  const fullName = overrides.full_name ?? `owner/repo-${id}`
  return {
    id,
    name: fullName.split('/')[1],
    full_name: fullName,
    description: 'A test repository',
    html_url: `https://github.com/${fullName}`,
    owner: { login: 'owner', avatar_url: 'https://example.com/avatar.png' },
    stargazers_count: overrides.stargazers_count ?? 1000,
    forks_count: 100,
    open_issues_count: overrides.open_issues_count ?? 10,
    pushed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    language: 'TypeScript',
    license: overrides.license === undefined ? { spdx_id: 'MIT', name: 'MIT License', url: null } : overrides.license,
    topics: overrides.topics ?? [],
    archived: false,
    fork: false,
    default_branch: 'main',
  }
}

const baseOptions: BuildQueryOptions = { timeRange: 'week' }

let graphqlQueries: string[] = []
let searchQueries: string[] = []

function mockSearch(items: ReturnType<typeof makeRestRepo>[]) {
  server.use(
    http.get(`${GITHUB_API_BASE}/search/repositories`, ({ request }) => {
      const url = new URL(request.url)
      searchQueries.push(url.searchParams.get('q') || '')
      return HttpResponse.json({
        total_count: items.length,
        incomplete_results: false,
        items,
      })
    }),
  )
}

function mockGraphQL(handler?: (query: string) => Record<string, unknown>) {
  server.use(
    http.post(GITHUB_GRAPHQL_URL, async ({ request }) => {
      const body = (await request.json()) as { query: string }
      graphqlQueries.push(body.query)
      if (handler) {
        return HttpResponse.json(handler(body.query))
      }
      return HttpResponse.json({ data: {} })
    }),
  )
}

beforeEach(() => {
  graphqlQueries = []
  searchQueries = []
  localStorage.setItem('github_dashboard_preferences', JSON.stringify({}))
})

afterEach(() => {
  clearGitHubToken()
})

describe('fetchReposWithIntelligence enrichment selection', () => {
  it('omits readme text from enrichment when the README filter is off', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    mockGraphQL(() => ({
      data: { repo_0: { pullRequests: { totalCount: 7 }, primaryLanguage: { color: '#3178c6' } } },
    }))

    const result = await fetchReposWithIntelligence(baseOptions, 'stars', 'desc', 1)

    expect(graphqlQueries).toHaveLength(1)
    expect(graphqlQueries[0]).not.toContain('HEAD:README.md')
    expect(result.repos[0].openPRs).toBe(7)
    expect(result.repos[0].languageColor).toBe('#3178c6')
  })

  it('requests readme text only when english filtering is active', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    mockGraphQL(() => ({
      data: {
        repo_0: {
          pullRequests: { totalCount: 2 },
          primaryLanguage: { color: '#3178c6' },
          readme: { text: '# Project\nThis readme is written entirely in english words and sentences.' },
        },
      },
    }))

    const result = await fetchReposWithIntelligence(
      { ...baseOptions, readmeLanguage: 'english' },
      'stars',
      'desc',
      1,
    )

    expect(graphqlQueries[0]).toContain('HEAD:README.md')
    expect(result.repos).toHaveLength(1)
  })

  it('requests only the fields required by the active developer filters', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    mockGraphQL(() => ({
      data: { repo_0: { pullRequests: { totalCount: 1 }, primaryLanguage: { color: null }, mentionableUsers: { totalCount: 2 } } },
    }))

    await fetchReposWithIntelligence(
      { ...baseOptions, developerFilters: ['solo_maintained'] },
      'stars',
      'desc',
      1,
    )

    expect(graphqlQueries[0]).toContain('mentionableUsers')
    expect(graphqlQueries[0]).not.toContain('releases')
    expect(graphqlQueries[0]).not.toContain('goodFirstIssues')
    expect(graphqlQueries[0]).not.toContain('HEAD:README.md')
  })

  it('applies REST-only developer filters without a token', async () => {
    mockSearch([
      makeRestRepo({ id: 1, full_name: 'owner/beginner', topics: ['beginner-friendly'], stargazers_count: 100, open_issues_count: 5 }),
      makeRestRepo({ id: 2, full_name: 'owner/huge', topics: [], stargazers_count: 90000, open_issues_count: 0 }),
    ])
    mockGraphQL()

    const result = await fetchReposWithIntelligence(
      { ...baseOptions, developerFilters: ['beginner_friendly'] },
      'stars',
      'desc',
      1,
    )

    expect(result.repos.map((r) => r.fullName)).toEqual(['owner/beginner'])
    expect(graphqlQueries).toHaveLength(0)
  })
})

describe('fetchReposWithIntelligence failure handling', () => {
  it('degrades to REST data when the GraphQL enrichment request fails', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () => HttpResponse.json({ message: 'boom' }, { status: 500 })),
    )

    const result = await fetchReposWithIntelligence(baseOptions, 'stars', 'desc', 1)

    expect(result.repos).toHaveLength(1)
    expect(result.repos[0].openPRs).toBe(0)
  })

  it('degrades to REST data when GraphQL returns a 200 with errors', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    server.use(
      http.post(GITHUB_GRAPHQL_URL, () =>
        HttpResponse.json({ data: null, errors: [{ message: 'Something went wrong' }] }),
      ),
    )

    const result = await fetchReposWithIntelligence(baseOptions, 'stars', 'desc', 1)

    expect(result.repos).toHaveLength(1)
    expect(result.repos[0].openPRs).toBe(0)
  })

  it('rejects when the abort signal is already aborted', async () => {
    setGitHubToken('test-token')
    mockSearch([makeRestRepo({ id: 1 })])
    mockGraphQL()
    const controller = new AbortController()
    controller.abort()

    await expect(
      fetchReposWithIntelligence(baseOptions, 'stars', 'desc', 1, controller.signal),
    ).rejects.toThrow()
    expect(searchQueries).toHaveLength(0)
  })

  it('does not start enrichment when the signal aborts during the search', async () => {
    setGitHubToken('test-token')
    const controller = new AbortController()
    server.use(
      http.get(`${GITHUB_API_BASE}/search/repositories`, () => {
        controller.abort()
        return HttpResponse.json({ total_count: 1, incomplete_results: false, items: [makeRestRepo({ id: 1 })] })
      }),
    )
    mockGraphQL()

    await expect(
      fetchReposWithIntelligence(baseOptions, 'stars', 'desc', 1, controller.signal),
    ).rejects.toThrow()
    expect(graphqlQueries).toHaveLength(0)
  })
})

describe('fetchReposWithIntelligence preference inputs', () => {
  it('appends ignored languages as negative qualifiers to the search query', async () => {
    mockSearch([makeRestRepo({ id: 1 })])

    await fetchReposWithIntelligence(
      { ...baseOptions, ignoredLanguages: ['Ruby', 'Go'] },
      'stars',
      'desc',
      1,
    )

    expect(searchQueries[0]).toContain('-language:ruby')
    expect(searchQueries[0]).toContain('-language:go')
  })

  it('filters ignored topics client-side and keeps the server count', async () => {
    mockSearch([
      makeRestRepo({ id: 1, full_name: 'owner/ai-repo', topics: ['ai'] }),
      makeRestRepo({ id: 2, full_name: 'owner/plain', topics: ['cli'] }),
    ])

    const result = await fetchReposWithIntelligence(
      { ...baseOptions, ignoredTopics: ['AI'] },
      'stars',
      'desc',
      1,
    )

    expect(result.repos.map((r) => r.fullName)).toEqual(['owner/plain'])
    expect(result.serverReposCount).toBe(2)
  })
})

describe('validateToken', () => {
  it('reports ok for a valid token', async () => {
    server.use(
      http.get(`${GITHUB_API_BASE}/rate_limit`, () =>
        HttpResponse.json({ resources: { core: { limit: 5000, remaining: 4999, reset: 0 } } }),
      ),
    )
    expect(await validateToken('good-token')).toEqual({ ok: true })
  })

  it('reports the status for an invalid token', async () => {
    server.use(
      http.get(`${GITHUB_API_BASE}/rate_limit`, () =>
        HttpResponse.json({ message: 'Bad credentials' }, { status: 401 }),
      ),
    )
    expect(await validateToken('bad-token')).toEqual({ ok: false, status: 401 })
  })
})
