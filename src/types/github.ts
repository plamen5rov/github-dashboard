export interface GitHubOwner {
  login: string
  avatar_url: string
  html_url: string
}

export interface GitHubLicense {
  spdx_id: string
  name: string
  url: string | null
}

export interface GitHubLanguage {
  name: string
  color: string | null
}

export interface GitHubRepositoryREST {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  owner: GitHubOwner
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  updated_at: string
  created_at: string
  language: string | null
  license: GitHubLicense | null
  topics: string[]
  archived: boolean
  fork: boolean
  default_branch: string
}

export interface GraphQLRepository {
  name: string
  owner: {
    login: string
    avatarUrl: string
  }
  description: string | null
  stargazerCount: number
  forkCount: number
  primaryLanguage: {
    name: string
    color: string | null
  } | null
  licenseInfo: {
    spdxId: string
    name: string
  } | null
  pullRequests: {
    totalCount: number
  }
  issues: {
    totalCount: number
  }
  pushedAt: string
  url: string
}

export interface GraphQLSearchResponse {
  search: {
    nodes: GraphQLRepository[]
    issueCount: number
  }
}

export interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  owner: {
    login: string
    avatarUrl: string
  }
  stars: number
  forks: number
  openIssues: number
  openPRs: number
  pushedAt: string
  updatedAt: string
  language: string | null
  languageColor: string | null
  license: {
    spdxId: string
    name: string
  } | null
  topics: string[]
  archived: boolean
  isFork: boolean
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export interface GitHubAPIError {
  message: string
  status: number
  documentation_url?: string
}
