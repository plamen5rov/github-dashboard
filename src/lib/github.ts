import type {
  GitHubRepositoryREST,
  Repository,
  RateLimitInfo,
  GitHubAPIError,
  GraphQLRepositoryEnrichment,
  EnrichmentFields,
} from '../types/github'
import { GITHUB_API_BASE, GITHUB_GRAPHQL_URL, DEFAULT_PER_PAGE } from './constants'
import type { BuildQueryOptions, SortField, SortOrder } from './utils'
import { buildGitHubQuery, getAPISortField } from './utils'
import { evaluateDeveloperFilter, requiredEnrichmentFields } from './developerFilters'
import type { DeveloperFilter } from '../hooks/useFilters'
import { detectReadmeLanguage } from './readmeLanguage'
import { getToken } from './authStore'

export { getToken }

function escapeGraphQL(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
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

export async function validateToken(token: string): Promise<{ ok: boolean; status?: number }> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
      },
    })
    if (response.ok) {
      return { ok: true }
    }
    return { ok: false, status: response.status }
  } catch {
    return { ok: false }
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

async function searchRepositories(
  options: BuildQueryOptions,
  sort: SortField,
  order: SortOrder,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE,
  signal?: AbortSignal,
): Promise<{ repos: Repository[]; rateLimit: RateLimitInfo }> {
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
  const response = await fetch(url, { headers: getHeaders(), signal })

  await checkResponse(response)

  const rateLimit = extractRateLimit(response.headers)
  const data = await response.json()

  const repos: Repository[] = (data.items || []).map((item: GitHubRepositoryREST) =>
    normalizeRepo(item),
  )

  return { repos, rateLimit }
}

function buildEnrichmentSelections(fields: EnrichmentFields): string[] {
  const selections = [
    'pullRequests(states: OPEN) { totalCount }',
    'primaryLanguage { color }',
  ]
  if (fields.goodFirstIssues) {
    selections.push('goodFirstIssues: issues(labels: ["good first issue"], states: OPEN) { totalCount }')
  }
  if (fields.contributors) {
    selections.push('mentionableUsers { totalCount }')
  }
  if (fields.recentCommits) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    selections.push(`defaultBranchRef { target { ... on Commit { history(since: "${since}") { totalCount } } } }`)
  }
  if (fields.releases) {
    selections.push('releases(first: 1) { totalCount }')
  }
  if (fields.readme) {
    selections.push('readme: object(expression: "HEAD:README.md") { ... on Blob { text } }')
  }
  return selections
}

async function enrichRepositories(
  repoNames: string[],
  fields: EnrichmentFields,
  signal?: AbortSignal,
): Promise<Map<string, GraphQLRepositoryEnrichment>> {
  if (repoNames.length === 0) return new Map()

  const token = getToken()
  if (!token) {
    return new Map()
  }

  const selections = buildEnrichmentSelections(fields)

  const repoQueries = repoNames
    .map((fullName, i) => {
      const [owner, name] = fullName.split('/')
      return `repo_${i}: repository(owner: "${escapeGraphQL(owner)}", name: "${escapeGraphQL(name)}") { ${selections.join(' ')} }`
    })
    .join('\n')

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query: `query { ${repoQueries} }` }),
    signal,
  })

  await checkResponse(response)

  const data = await response.json()
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const error: GitHubAPIError = {
      message: data.errors[0]?.message || 'GraphQL error',
      status: response.status,
    }
    throw error
  }

  const result = new Map<string, GraphQLRepositoryEnrichment>()

  repoNames.forEach((fullName, i) => {
    const repo = data.data?.[`repo_${i}`]
    if (!repo) return
    const entry: GraphQLRepositoryEnrichment = {
      openPRs: repo.pullRequests?.totalCount || 0,
      languageColor: repo.primaryLanguage?.color || null,
    }
    if (fields.goodFirstIssues) {
      entry.goodFirstIssueCount = repo.goodFirstIssues?.totalCount || 0
    }
    if (fields.contributors) {
      entry.contributorCount = repo.mentionableUsers?.totalCount || 0
    }
    if (fields.recentCommits) {
      entry.recentCommitCount = repo.defaultBranchRef?.target?.history?.totalCount || 0
    }
    if (fields.releases) {
      entry.releaseCount = repo.releases?.totalCount || 0
    }
    if (fields.readme && repo.readme?.text) {
      entry.readmeText = repo.readme.text
    }
    result.set(fullName, entry)
  })

  return result
}

export async function fetchRepoByFullName(fullName: string, signal?: AbortSignal): Promise<Repository | null> {
  const [owner, name] = fullName.split('/')
  const url = `${GITHUB_API_BASE}/repos/${owner}/${name}`
  const response = await fetch(url, { headers: getHeaders(), signal })

  if (!response.ok) return null

  const data = await response.json()
  const repo = normalizeRepo(data)

  if (getToken()) {
    try {
      const enriched = await enrichRepositories([fullName], {}, signal)
      const extra = enriched.get(fullName)
      if (extra) {
        repo.openPRs = extra.openPRs
        repo.languageColor = extra.languageColor
      }
    } catch (err) {
      if (signal?.aborted) throw err
    }
  }

  return repo
}

export async function fetchCoreRateLimit(): Promise<RateLimitInfo | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers: getHeaders() })
    if (!response.ok) return null
    const data = await response.json()
    return {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: data.resources.core.reset,
    }
  } catch {
    return null
  }
}

export async function fetchReposWithIntelligence(
  options: BuildQueryOptions,
  sort: SortField,
  order: SortOrder,
  page: number = 1,
  signal?: AbortSignal,
): Promise<{ repos: Repository[]; rateLimit: RateLimitInfo; serverReposCount: number }> {
  const queryOptions = { ...options }

  if (queryOptions.ignoredLanguages && queryOptions.ignoredLanguages.length > 0) {
    const ignoredLangs = queryOptions.ignoredLanguages.map((l) => `-language:${l.toLowerCase()}`).join(' ')
    if (queryOptions.keyword) {
      queryOptions.keyword = `${queryOptions.keyword} ${ignoredLangs}`
    } else {
      queryOptions.keyword = ignoredLangs
    }
  }

  const { repos, rateLimit } = await searchRepositories(queryOptions, sort, order, page, DEFAULT_PER_PAGE, signal)
  const serverReposCount = repos.length

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const ignoredTopics = (options.ignoredTopics || []).map((t) => t.toLowerCase())

  const filteredRepos = repos.filter((repo) => {
    if (ignoredTopics.length > 0) {
      const hasIgnoredTopic = repo.topics.some((t) => ignoredTopics.includes(t.toLowerCase()))
      if (hasIgnoredTopic) return false
    }
    if (options.licenseType === 'no_license') {
      if (repo.license !== null) return false
    }
    if (options.licenseType === 'open_source') {
      if (repo.license === null) return false
    }
    return true
  })

  const fullNames = Array.from(new Map(filteredRepos.map((r) => [r.fullName, r])).keys())

  let enrichmentMap = new Map<string, GraphQLRepositoryEnrichment>()
  const token = getToken()

  if (token && fullNames.length > 0) {
    const fields = requiredEnrichmentFields(
      options.developerFilters as DeveloperFilter[] | undefined,
      options.readmeLanguage,
    )
    try {
      enrichmentMap = await enrichRepositories(fullNames, fields, signal)
    } catch (err) {
      if (signal?.aborted) throw err
    }
    filteredRepos.forEach((repo) => {
      const extra = enrichmentMap.get(repo.fullName)
      if (extra) {
        repo.openPRs = extra.openPRs
        repo.languageColor = extra.languageColor
      }
    })
  }

  let finalRepos = filteredRepos

  if (options.developerFilters && options.developerFilters.length > 0) {
    const developerFilters = options.developerFilters as DeveloperFilter[]
    finalRepos = finalRepos.filter((repo) => {
      const enrichment = enrichmentMap.get(repo.fullName)
      return developerFilters.some((filter) => {
        const result = evaluateDeveloperFilter(filter, repo, enrichment)
        return result.matches
      })
    })
  }

  if (options.readmeLanguage === 'english' && token) {
    finalRepos = finalRepos.filter((repo) => {
      const readmeText = enrichmentMap.get(repo.fullName)?.readmeText
      if (!readmeText) return false
      return detectReadmeLanguage(readmeText) === 'english'
    })
  }

  return { repos: finalRepos, rateLimit, serverReposCount }
}
