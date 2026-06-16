import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useFilters } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'
import { useRepos } from '../hooks/useRepos'
import { useTheme } from '../hooks/useTheme'
import { usePersonalization } from '../hooks/usePersonalization'
import { SORT_OPTIONS } from '../lib/constants'
import { fetchCoreRateLimit } from '../lib/github'
import type { SortState } from '../hooks/useSort'
import RepoGrid from '../components/RepoGrid'
import { formatNumber } from '../lib/utils'
import { BookmarkIcon, FolderIcon, ChevronUpIcon, ChevronDownIcon, SunIcon, MoonIcon } from '../components/Icons'
import CollectionsPanel from '../components/CollectionsPanel'
import FollowedTopicsManager from '../components/FollowedTopicsManager'
import IgnoreListManager from '../components/IgnoreListManager'
import BookmarksPanel from '../components/BookmarksPanel'
import FilterSidebar from '../components/FilterSidebar'

function Home() {
  const { filters, updateFilters, resetFilters, activeFilterCount } = useFilters()
  const { sort, setSort, toggleOrder } = useSort()
  const { theme, toggleTheme } = useTheme()
  const { prefs } = usePersonalization()
  const [showCollections, setShowCollections] = useState(false)
  const [showFollowedTopics, setShowFollowedTopics] = useState(false)
  const [showIgnoreList, setShowIgnoreList] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const {
    repos,
    rateLimit,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useRepos({
    keyword: filters.keyword,
    timeRange: filters.timeRange,
    language: filters.language,
    licenseType: filters.licenseType,
    minStars: filters.minStars,
    topics: filters.topics,
    includeArchived: filters.includeArchived,
    includeForks: filters.includeForks,
    developerFilters: filters.developerFilters,
    readmeLanguage: filters.readmeLanguage,
    sort: sort.field,
    order: sort.order,
  })

  const { data: coreRateLimit } = useQuery({
    queryKey: ['coreRateLimit'],
    queryFn: fetchCoreRateLimit,
    staleTime: 60_000,
    retry: false,
  })

  const displayRateLimit = coreRateLimit || rateLimit

  const handleTopicClick = (topic: string) => {
    if (!filters.topics.includes(topic)) {
      updateFilters({ topics: [...filters.topics, topic] })
    }
  }

  const isRateLimitError =
    error && 'status' in error && (error as { status: number }).status === 403

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-github-dark/95 backdrop-blur-sm border-b border-github-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-1.5 text-github-muted hover:text-github-text rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent"
              aria-label="Open filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-github-text" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <h1 className="text-2xl font-bold text-github-text">
                GitHub Dashboard
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {displayRateLimit && (
              <span className="text-sm hidden lg:inline">
                {displayRateLimit.remaining > 0 ? (
                  <span className={displayRateLimit.remaining <= 100 ? 'text-red-400' : ''}>
                    API: {formatNumber(displayRateLimit.remaining)} remaining
                  </span>
                ) : (
                  <span className="text-red-400">Rate limit exceeded</span>
                )}
              </span>
            )}
            <button
              onClick={() => setShowBookmarks(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Bookmarks"
              title="Bookmarks"
            >
              <BookmarkIcon />
              {prefs.bookmarks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                  {prefs.bookmarks.length > 9 ? '9+' : prefs.bookmarks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCollections(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Collections"
              title="Collections"
            >
              <FolderIcon />
              {prefs.collections.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                  {prefs.collections.length > 9 ? '9+' : prefs.collections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowFollowedTopics(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Followed topics"
              title="Followed topics"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {prefs.followedTopics.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                  {prefs.followedTopics.length > 9 ? '9+' : prefs.followedTopics.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowIgnoreList(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Ignore list"
              title="Ignore list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              {(prefs.ignoredTopics.length + prefs.ignoredLanguages.length) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                  {prefs.ignoredTopics.length + prefs.ignoredLanguages.length > 9
                    ? '9+'
                    : prefs.ignoredTopics.length + prefs.ignoredLanguages.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              to="/settings"
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <FilterSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 min-w-0 px-4 py-6 lg:pl-6">
          {/* Sort bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select-main" className="sr-only">Sort by</label>
              <select
                id="sort-select-main"
                value={sort.field}
                onChange={(e) => setSort({ field: e.target.value as SortState['field'] })}
                className="px-3 py-1.5 bg-github-darker border border-github-border rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent cursor-pointer"
                aria-label="Sort repositories by"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleOrder}
                className="p-1.5 bg-github-darker border border-github-border rounded-lg text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent"
                aria-label={`Switch to ${sort.order === 'asc' ? 'descending' : 'ascending'} order`}
                title={sort.order === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sort.order === 'asc' ? (
                  <ChevronUpIcon />
                ) : (
                  <ChevronDownIcon />
                )}
              </button>
              <div className="w-px h-6 bg-github-border" />
              <label htmlFor="min-stars" className="text-sm text-github-muted">Min ⭐</label>
              <input
                id="min-stars"
                type="number"
                min={0}
                value={filters.minStars || ''}
                onChange={(e) => updateFilters({ minStars: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1.5 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
                placeholder="0"
              />
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-github-accent hover:underline focus:outline-none"
              >
                Reset filters ({activeFilterCount})
              </button>
            )}
          </div>

          {isError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-center mb-6">
              <p className="text-red-400 font-medium mb-2">
                {isRateLimitError
                  ? 'GitHub API rate limit exceeded'
                  : 'Failed to load repositories'}
              </p>
              {isRateLimitError && rateLimit && (
                <p className="text-sm text-github-muted mb-3">
                  Resets at {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
                </p>
              )}
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          )}

          <RepoGrid
            repos={repos}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            fetchNextPage={fetchNextPage}
            onTopicClick={handleTopicClick}
            activeDeveloperFilters={filters.developerFilters}
          />
        </main>
      </div>

      <CollectionsPanel isOpen={showCollections} onClose={() => setShowCollections(false)} onTopicClick={handleTopicClick} />
      <FollowedTopicsManager isOpen={showFollowedTopics} onClose={() => setShowFollowedTopics(false)} />
      <IgnoreListManager isOpen={showIgnoreList} onClose={() => setShowIgnoreList(false)} />
      <BookmarksPanel isOpen={showBookmarks} onClose={() => setShowBookmarks(false)} onTopicClick={handleTopicClick} />
    </div>
  )
}

export default Home
