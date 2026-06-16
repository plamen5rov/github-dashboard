import { useEffect, useRef } from 'react'
import type { Repository } from '../types/github'
import type { DeveloperFilter } from '../hooks/useFilters'
import RepoCard from './RepoCard'

interface RepoGridProps {
  repos: Repository[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  fetchNextPage: () => void
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
}

function RepoGrid({
  repos,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  fetchNextPage,
  onTopicClick,
  activeDeveloperFilters = [],
}: RepoGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto w-16 h-16 text-github-muted mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-github-text mb-2">No repositories found</h3>
        <p className="text-github-muted">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} onTopicClick={onTopicClick} activeDeveloperFilters={activeDeveloperFilters} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4 mt-4" aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={`more-${i}`} />
          ))}
        </div>
      )}
    </>
  )
}

function SkeletonCard() {
  return (
    <div className="p-5 bg-github-darker border border-github-border rounded-xl animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-github-border flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-github-border rounded w-3/4" />
          <div className="h-4 bg-github-border rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-github-border rounded-full w-20" />
        <div className="h-5 bg-github-border rounded-full w-24" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-4 bg-github-border rounded w-12" />
        <div className="h-4 bg-github-border rounded w-12" />
        <div className="h-4 bg-github-border rounded w-12" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-github-border">
        <div className="h-5 bg-github-border rounded-full w-16" />
        <div className="h-5 bg-github-border rounded-full w-16" />
        <div className="h-5 bg-github-border rounded-full w-16" />
      </div>
    </div>
  )
}

export default RepoGrid
