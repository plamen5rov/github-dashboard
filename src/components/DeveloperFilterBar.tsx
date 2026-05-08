import { DEVELOPER_FILTERS } from '../lib/constants'
import type { DeveloperFilter } from '../hooks/useFilters'

interface DeveloperFilterBarProps {
  activeFilters: DeveloperFilter[]
  onToggle: (filter: DeveloperFilter) => void
}

function DeveloperFilterBar({ activeFilters, onToggle }: DeveloperFilterBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-github-muted uppercase tracking-wide">
          Developer Filters
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(DEVELOPER_FILTERS).map(([key, { label, icon, description }]) => {
          const isActive = activeFilters.includes(key as DeveloperFilter)
          return (
            <button
              key={key}
              onClick={() => onToggle(key as DeveloperFilter)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-github-accent ${
                isActive
                  ? 'bg-github-accent/20 text-github-accent border border-github-accent/40 shadow-sm'
                  : 'bg-github-border/50 text-github-muted border border-transparent hover:bg-github-border hover:text-github-text'
              }`}
              aria-pressed={isActive}
              title={description}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DeveloperFilterBar
