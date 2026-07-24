import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { GITHUB_API_BASE, GITHUB_GRAPHQL_URL } from '../lib/constants'

const mockRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'owner/test-repo',
  description: 'A test repository',
  html_url: 'https://github.com/owner/test-repo',
  owner: { login: 'owner', avatar_url: 'https://example.com/avatar.png' },
  stargazers_count: 1000,
  forks_count: 100,
  open_issues_count: 10,
  pushed_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  language: 'TypeScript',
  license: { spdx_id: 'MIT', name: 'MIT License', url: null },
  topics: ['test', 'demo'],
  archived: false,
  fork: false,
  default_branch: 'main',
}

export const handlers = [
  http.get(`${GITHUB_API_BASE}/search/repositories`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''

    if (query.includes('error')) {
      return HttpResponse.json({ message: 'Validation Failed' }, { status: 422 })
    }

    if (query.includes('403test')) {
      return new HttpResponse(null, {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '1700000000',
        },
      })
    }

    return HttpResponse.json(
      {
        total_count: 1,
        incomplete_results: false,
        items: [mockRepo],
      },
      {
        headers: {
          'X-RateLimit-Limit': '5000',
          'X-RateLimit-Remaining': '4999',
          'X-RateLimit-Reset': '1700000000',
        },
      },
    )
  }),

  http.get(`${GITHUB_API_BASE}/rate_limit`, () => {
    return HttpResponse.json({
      resources: {
        core: { limit: 5000, remaining: 4999, reset: 1700000000 },
        search: { limit: 30, remaining: 29, reset: 1700000000 },
      },
    })
  }),

  http.get(`${GITHUB_API_BASE}/repos/:owner/:name`, () => {
    return HttpResponse.json(mockRepo)
  }),

  http.post(GITHUB_GRAPHQL_URL, async ({ request }) => {
    const body = await request.json() as { query: string }
    const query = body.query || ''

    if (query.includes('goodFirstIssues')) {
      return HttpResponse.json({
        data: {
          repo_0: {
            pullRequests: { totalCount: 5 },
            allIssues: { totalCount: 10 },
            goodFirstIssues: { totalCount: 3 },
            primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
            mentionableUsers: { totalCount: 42 },
            defaultBranchRef: { target: { history: { totalCount: 100 } } },
            releases: { totalCount: 5 },
            repositoryTopics: { nodes: [{ topic: { name: 'react' } }, { topic: { name: 'typescript' } }] },
            licenseInfo: { spdxId: 'MIT' },
            isArchived: false,
            stargazerCount: 1500,
            forkCount: 150,
          },
        },
      })
    }

    if (query.includes('readme')) {
      return HttpResponse.json({
        data: {
          repo_0: {
            readme: {
              isTruncated: false,
              text: '# Test Repository\nThis is a test project.\n\n## Installation\nnpm install test',
            },
          },
        },
      })
    }

    return HttpResponse.json({
      data: {
        repo_0: {
          pullRequests: { totalCount: 5 },
          issues: { totalCount: 3 },
          primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
        },
      },
    })
  }),
]

export const server = setupServer(...handlers)
