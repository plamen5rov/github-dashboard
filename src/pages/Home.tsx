import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useFilters } from '../hooks/useFilters'
import { useSort } from '../hooks/useSort'
import { useRepos } from '../hooks/useRepos'
import { useTheme } from '../hooks/useTheme'
import { TIME_RANGES, SORT_OPTIONS, COMMON_LICENSES } from '../lib/constants'
import type { TimeRange } from '../lib/constants'
import type { SortState } from '../hooks/useSort'
import type { DeveloperFilter } from '../hooks/useFilters'
import SearchInput from '../components/SearchInput'
import RepoGrid from '../components/RepoGrid'
import { formatNumber } from '../lib/utils'
import LicenseLegend from '../components/LicenseLegend'
import DeveloperFilterBar from '../components/DeveloperFilterBar'

function Home() {
  const { filters, updateFilters, resetFilters, activeFilterCount } = useFilters()
  const { sort, setSort, toggleOrder } = useSort()
  const { theme, toggleTheme } = useTheme()
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const langPickerRef = useRef<HTMLDivElement>(null)

  const POPULAR_LANGUAGES = [
    'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
    'Java', 'C++', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'Dart', 'Vue', 'Svelte', 'Shell', 'Lua', 'Scala',
  ]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) {
        setShowLanguagePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTopicAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault()
      const newTopics = [...filters.topics, topicInput.trim()]
      updateFilters({ topics: newTopics })
      setTopicInput('')
    }
  }

  const removeTopic = (topic: string) => {
    updateFilters({ topics: filters.topics.filter((t) => t !== topic) })
  }

  const toggleLanguage = (lang: string) => {
    const exists = filters.language.includes(lang)
    updateFilters({
      language: exists
        ? filters.language.filter((l) => l !== lang)
        : [...filters.language, lang],
    })
  }

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
    sort: sort.field,
    order: sort.order,
  })

  const handleTopicClick = (topic: string) => {
    if (!filters.topics.includes(topic)) {
      updateFilters({ topics: [...filters.topics, topic] })
    }
  }

  const toggleDeveloperFilter = (filter: DeveloperFilter) => {
    const exists = filters.developerFilters.includes(filter)
    updateFilters({
      developerFilters: exists
        ? filters.developerFilters.filter((f) => f !== filter)
        : [...filters.developerFilters, filter],
    })
  }

  const isRateLimitError =
    error && 'status' in error && (error as { status: number }).status === 403

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-github-dark/95 backdrop-blur-sm border-b border-github-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-github-text" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <h1 className="text-xl font-bold text-github-text">GitHub Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {rateLimit && (
              <span className="text-xs text-github-muted hidden sm:inline">
                {rateLimit.remaining > 0 ? (
                  <>API: {formatNumber(rateLimit.remaining)} remaining</>
                ) : (
                  <span className="text-red-400">Rate limit exceeded</span>
                )}
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
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

      <main className="container mx-auto px-4 py-6 space-y-6">
        <SearchInput
          value={filters.keyword}
          onChange={(value) => updateFilters({ keyword: value })}
        />

        <div className="p-3 sm:p-4 bg-github-darker border border-github-border rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => updateFilters({ timeRange: key as TimeRange })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                    filters.timeRange === key
                      ? 'bg-github-accent text-white'
                      : 'bg-github-border text-github-muted hover:text-github-text'
                  }`}
                  aria-pressed={filters.timeRange === key}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <label htmlFor="sort-select" className="sr-only">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sort.field}
                onChange={(e) => setSort({ field: e.target.value as SortState['field'] })}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-github-dark border border-github-border rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent cursor-pointer"
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
                className="p-1.5 bg-github-dark border border-github-border rounded-lg text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent"
                aria-label={`Switch to ${sort.order === 'asc' ? 'descending' : 'ascending'} order`}
                title={sort.order === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sort.order === 'asc' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-github-border">
            <div ref={langPickerRef} className="relative">
              <button
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                  filters.language.length > 0
                    ? 'bg-github-accent text-white'
                    : 'bg-github-border text-github-muted hover:text-github-text'
                }`}
              >
                Language{filters.language.length > 0 ? ` (${filters.language.length})` : ''}
              </button>
              {showLanguagePicker && (
                <div className="absolute z-10 mt-2 p-3 bg-github-dark border border-github-border rounded-lg shadow-xl w-64 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1">
                    {POPULAR_LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-2 py-1 rounded text-xs text-left transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                          filters.language.includes(lang)
                            ? 'bg-github-accent text-white'
                            : 'text-github-muted hover:bg-github-border'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <select
                value={filters.licenseType}
                onChange={(e) => updateFilters({ licenseType: e.target.value })}
                className="px-3 py-1.5 bg-github-border border-0 rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent cursor-pointer"
                aria-label="Filter by license type"
              >
                <option value="all">All Licenses</option>
                <option value="open_source">Open Source Only</option>
                <option value="no_license">No License</option>
                <optgroup label="Specific">
                  {COMMON_LICENSES.map((license) => (
                    <option key={license} value={license}>
                      {license}
                    </option>
                  ))}
                </optgroup>
              </select>
              <LicenseLegend />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="min-stars" className="text-sm text-github-muted">
                Min stars:
              </label>
              <input
                id="min-stars"
                type="number"
                min={0}
                value={filters.minStars || ''}
                onChange={(e) => updateFilters({ minStars: parseInt(e.target.value) || 0 })}
                className="w-16 sm:w-20 px-2 py-1.5 bg-github-border border-0 rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
                placeholder="0"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.includeArchived}
                onChange={(e) => updateFilters({ includeArchived: e.target.checked })}
                className="w-4 h-4 rounded border-github-border bg-github-border text-github-accent focus:ring-github-accent focus:ring-offset-0"
              />
              <span className="text-sm text-github-muted hidden sm:inline">Include archived</span>
              <span className="text-sm text-github-muted sm:hidden">Archived</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.includeForks}
                onChange={(e) => updateFilters({ includeForks: e.target.checked })}
                className="w-4 h-4 rounded border-github-border bg-github-border text-github-accent focus:ring-github-accent focus:ring-offset-0"
              />
              <span className="text-sm text-github-muted hidden sm:inline">Include forks</span>
              <span className="text-sm text-github-muted sm:hidden">Forks</span>
            </label>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded px-2 py-1"
              >
                Reset all ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-github-border">
            <span className="text-sm text-github-muted mr-2">Topics:</span>
            {filters.topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-1 bg-github-accent/20 text-github-accent rounded-full text-xs"
              >
                {topic}
                <button
                  onClick={() => removeTopic(topic)}
                  className="ml-1 hover:text-white focus:outline-none"
                  aria-label={`Remove topic ${topic}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleTopicAdd}
              placeholder="Add topic (Enter)"
              className="px-2 py-1 bg-github-border border-0 rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent w-28 sm:w-32"
              aria-label="Add topic filter"
            />
          </div>

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-github-border">
            <DeveloperFilterBar
              activeFilters={filters.developerFilters}
              onToggle={toggleDeveloperFilter}
            />
          </div>
        </div>

        {isError && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-center">
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
  )
}

export default Home
