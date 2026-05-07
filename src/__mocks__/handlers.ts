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

  http.post(GITHUB_GRAPHQL_URL, () => {
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
