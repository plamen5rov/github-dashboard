import type {
  GitHubRepositoryREST,
  Repository,
  RateLimitInfo,
  GitHubAPIError,
  StarTimelineEntry,
  RepositoryWithIntelligence,
  GrowthMetrics,
} from '../types/github'
import { GITHUB_API_BASE, GITHUB_GRAPHQL_URL, DEFAULT_PER_PAGE } from './constants'
import type { BuildQueryOptions, SortField, SortOrder } from './utils'
import { buildGitHubQuery, getAPISortField } from './utils'
import { calculateGrowthMetrics } from './growth'

function getToken(): string | null {
  return localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || null
}

function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    ...extra,
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function extractRateLimit(headers: Headers): RateLimitInfo {
  return {
    limit: parseInt(headers.get('X-RateLimit-Limit') || '60', 10),
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0', 10),
    reset: parseInt(headers.get('X-RateLimit-Reset') || '0', 10),
  }
}

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const data: GitHubAPIError = await response.json().catch(() => ({
      message: response.statusText,
      status: response.status,
    }))
    const error: GitHubAPIError = {
      message: data.message || 'Unknown error',
      status: response.status,
      documentation_url: data.documentation_url,
    }
    throw error
  }
}

function normalizeRepo(rest: GitHubRepositoryREST): Repository {
  return {
    id: rest.id,
    name: rest.name,
    fullName: rest.full_name,
    description: rest.description,
    htmlUrl: rest.html_url,
    owner: {
      login: rest.owner.login,
      avatarUrl: rest.owner.avatar_url,
    },
    stars: rest.stargazers_count,
    forks: rest.forks_count,
    openIssues: rest.open_issues_count,
    openPRs: 0,
    pushedAt: rest.pushed_at,
    updatedAt: rest.updated_at,
    createdAt: rest.created_at,
    language: rest.language,
    languageColor: null,
    license: rest.license
      ? { spdxId: rest.license.spdx_id, name: rest.license.name }
      : null,
    topics: rest.topics,
    archived: rest.archived,
    isFork: rest.fork,
  }
}

export async function searchRepositories(
  options: BuildQueryOptions,
  sort: SortField,
  order: SortOrder,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE,
): Promise<{ repos: Repository[]; totalCount: number; rateLimit: RateLimitInfo }> {
  const query = buildGitHubQuery(options)
  const apiSort = getAPISortField(sort)

  const params = new URLSearchParams({
    q: query,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
  })

  if (apiSort) {
    params.set('sort', apiSort)
  }

  const url = `${GITHUB_API_BASE}/search/repositories?${params.toString()}`
  const response = await fetch(url, { headers: getHeaders() })

  await checkResponse(response)

  const rateLimit = extractRateLimit(response.headers)
  const data = await response.json()

  const repos: Repository[] = (data.items || []).map((item: GitHubRepositoryREST) =>
    normalizeRepo(item),
  )

  return { repos, totalCount: data.total_count || 0, rateLimit }
}

export async function enrichWithGraphQL(
  repoNames: string[],
): Promise<Map<string, { openPRs: number; openIssues: number; languageColor: string | null }>> {
  if (repoNames.length === 0) return new Map()

  const token = getToken()
  if (!token) {
    return new Map()
  }

  const repoQueries = repoNames
    .map((fullName, i) => {
      const [owner, name] = fullName.split('/')
      return `
        repo_${i}: repository(owner: "${owner}", name: "${name}") {
          pullRequests(states: OPEN) { totalCount }
          issues(states: OPEN) { totalCount }
          primaryLanguage { name color }
        }
      `
    })
    .join('\n')

  const query = `query { ${repoQueries} }`

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  })

  await checkResponse(response)

  const data = await response.json()
  const result = new Map<string, { openPRs: number; openIssues: number; languageColor: string | null }>()

  repoNames.forEach((fullName, i) => {
    const repo = data.data?.[`repo_${i}`]
    if (repo) {
      result.set(fullName, {
        openPRs: repo.pullRequests?.totalCount || 0,
        openIssues: repo.issues?.totalCount || 0,
        languageColor: repo.primaryLanguage?.color || null,
      })
    }
  })

  return result
}

export async function fetchRepos(
  options: BuildQueryOptions,
  sort: SortField,
  order: SortOrder,
  page: number = 1,
): Promise<{ repos: Repository[]; totalCount: number; rateLimit: RateLimitInfo }> {
  const { repos, totalCount, rateLimit } = await searchRepositories(options, sort, order, page)

  const token = getToken()
  if (token && repos.length > 0) {
    const fullNameMap = new Map(repos.map((r) => [r.fullName, r]))
    const fullNames = Array.from(fullNameMap.keys())

    try {
      const enriched = await enrichWithGraphQL(fullNames)
      repos.forEach((repo) => {
        const extra = enriched.get(repo.fullName)
        if (extra) {
          repo.openPRs = extra.openPRs
          repo.languageColor = extra.languageColor
        }
      })
    } catch {
      // GraphQL enrichment failed, continue with REST data
    }
  }

  return { repos, totalCount, rateLimit }
}

export { extractRateLimit }

const starTimelineCache = new Map<string, StarTimelineEntry[]>()

async function fetchStarTimeline(fullName: string): Promise<StarTimelineEntry[]> {
  if (starTimelineCache.has(fullName)) {
    return starTimelineCache.get(fullName)!
  }

  const token = getToken()
  if (!token) return []

  const [owner, name] = fullName.split('/')
  const query = `
    query {
      repository(owner: "${owner}", name: "${name}") {
        stargazers(first: 100, orderBy: { field: STARRED_AT, direction: DESC }) {
          edges {
            starredAt
          }
        }
      }
    }
  `

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    starTimelineCache.set(fullName, [])
    return []
  }

  const data = await response.json()
  const edges = data.data?.repository?.stargazers?.edges || []
  const timeline: StarTimelineEntry[] = edges.map((edge: { starredAt: string }) => ({
    starred_at: edge.starredAt,
  }))

  starTimelineCache.set(fullName, timeline)
  return timeline
}

export async function enrichWithIntelligence(
  repos: Repository[],
): Promise<Map<string, GrowthMetrics>> {
  const result = new Map<string, GrowthMetrics>()

  const token = getToken()
  if (!token) return result

  const intelligencePromises = repos.map(async (repo) => {
    try {
      const starTimeline = await fetchStarTimeline(repo.fullName)

      const metrics = calculateGrowthMetrics(
        starTimeline,
        repo.stars,
        repo.createdAt,
        repo.pushedAt,
      )

      result.set(repo.fullName, metrics)
    } catch {
      // Skip this repo if intelligence fetching fails
    }
  })

  await Promise.allSettled(intelligencePromises)
  return result
}

export async function fetchReposWithIntelligence(
  options: BuildQueryOptions,
  sort: SortField,
  order: SortOrder,
  page: number = 1,
): Promise<{ repos: RepositoryWithIntelligence[]; totalCount: number; rateLimit: RateLimitInfo }> {
  const { repos, totalCount, rateLimit } = await searchRepositories(options, sort, order, page)

  const token = getToken()
  if (token && repos.length > 0) {
    const fullNameMap = new Map(repos.map((r) => [r.fullName, r]))
    const fullNames = Array.from(fullNameMap.keys())

    try {
      const enriched = await enrichWithGraphQL(fullNames)
      repos.forEach((repo) => {
        const extra = enriched.get(repo.fullName)
        if (extra) {
          repo.openPRs = extra.openPRs
          repo.languageColor = extra.languageColor
        }
      })
    } catch {
      // GraphQL enrichment failed, continue with REST data
    }

    try {
      const intelligence = await enrichWithIntelligence(repos)
      const reposWithIntelligence: RepositoryWithIntelligence[] = repos.map((repo) => ({
        ...repo,
        growth: intelligence.get(repo.fullName),
      }))
      return { repos: reposWithIntelligence, totalCount, rateLimit }
    } catch {
      // Intelligence enrichment failed, return without growth data
    }
  }

  return { repos, totalCount, rateLimit }
}
