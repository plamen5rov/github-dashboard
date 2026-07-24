import { useEffect, useRef, memo } from 'react'
import type { Repository } from '../types/github'
import type { DeveloperFilter } from '../hooks/useFilters'
import RepoCard from './RepoCard'
import EmptyState from './EmptyState'
import { SadFaceIcon } from './Icons'

interface RepoGridProps {
  repos: Repository[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  fetchNextPage: () => void
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
}

const RepoGrid = memo(function RepoGrid({
  repos,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  fetchNextPage,
  onTopicClick,
  activeDeveloperFilters = [],
}: RepoGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const fetchNextPageRef = useRef(fetchNextPage)
  fetchNextPageRef.current = fetchNextPage

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPageRef.current()
        }
      },
      { rootMargin: '200px' },
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage])

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
    return <EmptyState icon={<SadFaceIcon />} title="No repositories found" description="Try adjusting your filters or search terms" />
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
})

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
