import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchReposWithIntelligence } from '../lib/github'
import type { Repository, RateLimitInfo } from '../types/github'
import type { BuildQueryOptions, SortField, SortOrder } from '../lib/utils'

interface UseReposOptions extends BuildQueryOptions {
  sort: SortField
  order: SortOrder
}

interface ReposPage {
  repos: Repository[]
  totalCount: number
  rateLimit: RateLimitInfo
  rawCount: number
  serverReposCount: number
}

export function useRepos({ sort, order, ...queryOptions }: UseReposOptions) {
  const queryKey = ['repos', queryOptions, sort, order]

  const result = useInfiniteQuery<ReposPage>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchReposWithIntelligence(queryOptions, sort, order, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.serverReposCount === 0) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
  })

  const allRepos = useMemo(
    () => result.data?.pages.flatMap((page) => page.repos) || [],
    [result.data],
  )
  const totalCount = result.data?.pages[0]?.totalCount || 0
  const rateLimit = result.data?.pages[0]?.rateLimit

  return {
    ...result,
    repos: allRepos,
    totalCount,
    rateLimit,
    hasNextPage: result.hasNextPage,
    fetchNextPage: result.fetchNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  }
}
