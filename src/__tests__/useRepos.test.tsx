import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../__mocks__/handlers'
import { GITHUB_API_BASE } from '../lib/constants'
import { useRepos } from '../hooks/useRepos'

function makeRestRepo(id: number, topics: string[] = []) {
  return {
    id,
    name: `repo-${id}`,
    full_name: `owner/repo-${id}`,
    description: null,
    html_url: `https://github.com/owner/repo-${id}`,
    owner: { login: 'owner', avatar_url: 'https://example.com/a.png' },
    stargazers_count: 100,
    forks_count: 10,
    open_issues_count: 1,
    pushed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    language: 'TypeScript',
    license: { spdx_id: 'MIT', name: 'MIT License', url: null },
    topics,
    archived: false,
    fork: false,
    default_branch: 'main',
  }
}

let searchCount = 0

function mockPagedSearch(pages: ReturnType<typeof makeRestRepo>[][]) {
  server.use(
    http.get(`${GITHUB_API_BASE}/search/repositories`, ({ request }) => {
      searchCount += 1
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const items = pages[page - 1] ?? []
      return HttpResponse.json({
        total_count: pages.flat().length,
        incomplete_results: false,
        items,
      })
    }),
  )
}

function mockSearchStatus(status: number) {
  server.use(
    http.get(`${GITHUB_API_BASE}/search/repositories`, () => {
      searchCount += 1
      return HttpResponse.json({ message: 'failed' }, { status })
    }),
  )
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const baseOptions = {
  timeRange: 'week' as const,
  sort: 'stars' as const,
  order: 'desc' as const,
  authRevision: 0,
}

beforeEach(() => {
  searchCount = 0
})

describe('useRepos pagination', () => {
  it('deduplicates repositories repeated across pages', async () => {
    mockPagedSearch([
      [makeRestRepo(1), makeRestRepo(2)],
      [makeRestRepo(2), makeRestRepo(3)],
    ])
    const { result } = renderHook(() => useRepos(baseOptions), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await result.current.fetchNextPage()
    await waitFor(() => expect(result.current.repos.map((r) => r.id)).toEqual([1, 2, 3]))
  })

  it('reports an empty page streak while the server has more pages', async () => {
    mockPagedSearch([
      [makeRestRepo(1, ['ai']), makeRestRepo(2, ['ai'])],
      [makeRestRepo(3, ['cli'])],
    ])
    const { result } = renderHook(
      () => useRepos({ ...baseOptions, ignoredTopics: ['ai'] }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.repos).toHaveLength(0)
    expect(result.current.emptyPageStreak).toBe(1)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('stops paginating when the server returns an empty page', async () => {
    mockPagedSearch([[makeRestRepo(1)], []])
    const { result } = renderHook(() => useRepos(baseOptions), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await result.current.fetchNextPage()
    await waitFor(() => expect(result.current.hasNextPage).toBe(false))
  })
})

describe('useRepos retry policy', () => {
  it('does not retry 403 responses', async () => {
    mockSearchStatus(403)
    const { result } = renderHook(() => useRepos(baseOptions), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(searchCount).toBe(1)
  })

  it('retries a 500 response once', async () => {
    mockSearchStatus(500)
    const { result } = renderHook(() => useRepos(baseOptions), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })
    expect(searchCount).toBe(2)
  })
})

describe('useRepos cache keys', () => {
  it('refetches when the auth revision changes', async () => {
    mockPagedSearch([[makeRestRepo(1)]])
    const { result, rerender } = renderHook(
      ({ authRevision }: { authRevision: number }) => useRepos({ ...baseOptions, authRevision }),
      { wrapper: createWrapper(), initialProps: { authRevision: 0 } },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchCount).toBe(1)

    rerender({ authRevision: 1 })
    await waitFor(() => expect(searchCount).toBe(2))
  })

  it('refetches when ignored topics change', async () => {
    mockPagedSearch([[makeRestRepo(1, ['ai'])]])
    const { result, rerender } = renderHook(
      ({ ignoredTopics }: { ignoredTopics: string[] }) => useRepos({ ...baseOptions, ignoredTopics }),
      { wrapper: createWrapper(), initialProps: { ignoredTopics: [] as string[] } },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.repos).toHaveLength(1)

    rerender({ ignoredTopics: ['ai'] })
    await waitFor(() => expect(result.current.repos).toHaveLength(0))
  })
})
