import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchReposWithIntelligence } from '../lib/github'
import type { RepositoryWithIntelligence, RateLimitInfo } from '../types/github'
import type { BuildQueryOptions } from '../lib/utils'
import type { SortField, SortOrder } from '../lib/utils'
import type { TimeRange } from '../lib/constants'

interface UseReposOptions {
  keyword?: string
  timeRange: TimeRange
  language?: string[]
  licenseType?: string
  minStars?: number
  topics?: string[]
  includeArchived?: boolean
  includeForks?: boolean
  readmeLanguage?: 'all' | 'english'
  developerFilters?: string[]
  sort: SortField
  order: SortOrder
}

interface ReposPage {
  repos: RepositoryWithIntelligence[]
  totalCount: number
  rateLimit: RateLimitInfo
}

export function useRepos(options: UseReposOptions) {
  const queryOptions: BuildQueryOptions = {
    keyword: options.keyword,
    timeRange: options.timeRange,
    language: options.language,
    licenseType: options.licenseType,
    minStars: options.minStars,
    topics: options.topics,
    includeArchived: options.includeArchived,
    includeForks: options.includeForks,
    readmeLanguage: options.readmeLanguage,
    developerFilters: options.developerFilters,
  }

  const queryKey = ['repos', queryOptions, options.sort, options.order]

  const result = useInfiniteQuery<ReposPage>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchReposWithIntelligence(queryOptions, options.sort, options.order, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.repos.length, 0)
      if (loadedCount >= lastPage.totalCount) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
  })

  const allRepos = result.data?.pages.flatMap((page) => page.repos) || []
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
