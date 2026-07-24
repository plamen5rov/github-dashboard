import { useState, useCallback } from 'react'
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
import { BookmarkIcon, FolderIcon, ChevronUpIcon, ChevronDownIcon, SunIcon, MoonIcon, MenuIcon, GitHubIcon, TagIcon, NoEntryIcon, SettingsIcon } from '../components/Icons'
import BadgeCount from '../components/BadgeCount'
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

  const handleTopicClick = useCallback((topic: string) => {
    if (!filters.topics.includes(topic)) {
      updateFilters({ topics: [...filters.topics, topic] })
    }
  }, [filters.topics, updateFilters])

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
              <MenuIcon className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <GitHubIcon className="w-8 h-8 text-github-text" />
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
              <BadgeCount count={prefs.bookmarks.length} color="yellow" />
            </button>
            <button
              onClick={() => setShowCollections(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Collections"
              title="Collections"
            >
              <FolderIcon />
              <BadgeCount count={prefs.collections.length} color="blue" />
            </button>
            <button
              onClick={() => setShowFollowedTopics(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Followed topics"
              title="Followed topics"
            >
              <TagIcon className="w-5 h-5" />
              <BadgeCount count={prefs.followedTopics.length} color="green" />
            </button>
            <button
              onClick={() => setShowIgnoreList(true)}
              className="relative p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg hidden sm:block"
              aria-label="Ignore list"
              title="Ignore list"
            >
              <NoEntryIcon className="w-5 h-5" />
              <BadgeCount count={prefs.ignoredTopics.length + prefs.ignoredLanguages.length} color="red" />
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
              <SettingsIcon className="w-5 h-5" />
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
