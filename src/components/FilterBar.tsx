import { useState } from 'react'
import { TIME_RANGES, COMMON_LICENSES } from '../lib/constants'
import type { TimeRange } from '../lib/constants'
import type { FilterState } from '../hooks/useFilters'

interface FilterBarProps {
  filters: FilterState
  onUpdate: (updates: Partial<FilterState>) => void
  onReset: () => void
  activeCount: number
}

const POPULAR_LANGUAGES = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Java', 'C++', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'Dart', 'Vue', 'Svelte', 'Shell', 'Lua', 'Scala',
]

function FilterBar({ filters, onUpdate, onReset, activeCount }: FilterBarProps) {
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [topicInput, setTopicInput] = useState('')

  const handleTopicAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault()
      const newTopics = [...filters.topics, topicInput.trim()]
      onUpdate({ topics: newTopics })
      setTopicInput('')
    }
  }

  const removeTopic = (topic: string) => {
    onUpdate({ topics: filters.topics.filter((t) => t !== topic) })
  }

  const toggleLanguage = (lang: string) => {
    const exists = filters.language.includes(lang)
    onUpdate({
      language: exists
        ? filters.language.filter((l) => l !== lang)
        : [...filters.language, lang],
    })
  }

  return (
    <div className="space-y-4 p-4 bg-github-darker border border-github-border rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-github-text">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-github-accent hover:underline focus:outline-none focus:ring-2 focus:ring-github-accent rounded px-2 py-1"
          >
            Reset all ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TIME_RANGES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => onUpdate({ timeRange: key as TimeRange })}
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

      <div className="flex flex-wrap gap-3">
        <div className="relative">
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

        <select
          value={filters.licenseType}
          onChange={(e) => onUpdate({ licenseType: e.target.value })}
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

        <div className="flex items-center gap-2">
          <label htmlFor="min-stars" className="text-sm text-github-muted">
            Min stars:
          </label>
          <input
            id="min-stars"
            type="number"
            min={0}
            value={filters.minStars || ''}
            onChange={(e) => onUpdate({ minStars: parseInt(e.target.value) || 0 })}
            className="w-20 px-2 py-1.5 bg-github-border border-0 rounded-lg text-sm text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeArchived}
            onChange={(e) => onUpdate({ includeArchived: e.target.checked })}
            className="w-4 h-4 rounded border-github-border bg-github-border text-github-accent focus:ring-github-accent focus:ring-offset-0"
          />
          <span className="text-sm text-github-muted">Include archived</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeForks}
            onChange={(e) => onUpdate({ includeForks: e.target.checked })}
            className="w-4 h-4 rounded border-github-border bg-github-border text-github-accent focus:ring-github-accent focus:ring-offset-0"
          />
          <span className="text-sm text-github-muted">Include forks</span>
        </label>
      </div>

      <div>
        <label className="text-sm text-github-muted block mb-1">README Language</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ readmeLanguage: 'all' })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
              filters.readmeLanguage === 'all'
                ? 'bg-github-accent text-white'
                : 'bg-github-border text-github-muted hover:text-github-text'
            }`}
            aria-pressed={filters.readmeLanguage === 'all'}
          >
            All Languages
          </button>
          <button
            onClick={() => onUpdate({ readmeLanguage: 'english' })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
              filters.readmeLanguage === 'english'
                ? 'bg-github-accent text-white'
                : 'bg-github-border text-github-muted hover:text-github-text'
            }`}
            aria-pressed={filters.readmeLanguage === 'english'}
          >
            English Only
          </button>
        </div>
      </div>

      {filters.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 px-2 py-1 bg-github-accent/20 text-github-accent rounded-full text-xs"
            >
              topic:{topic}
              <button
                onClick={() => removeTopic(topic)}
                className="ml-1 hover:text-white focus:outline-none"
                aria-label={`Remove topic ${topic}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={handleTopicAdd}
          placeholder="Add topic tag (press Enter)"
          className="flex-1 px-3 py-1.5 bg-github-border border-0 rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
          aria-label="Add topic filter"
        />
      </div>
    </div>
  )
}

export default FilterBar
