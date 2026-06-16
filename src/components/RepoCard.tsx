import type { RepositoryWithIntelligence } from '../types/github'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import { formatNumber, formatRelativeTime } from '../lib/utils'
import { evaluateDeveloperFilter } from '../lib/developerFilters'
import type { DeveloperFilter } from '../hooks/useFilters'
import { usePersonalization } from '../hooks/usePersonalization'
import { useClickOutside } from '../hooks/useClickOutside'
import { useState, useRef } from 'react'
import { StarIcon, ForkIcon, BookmarkIcon, FolderIcon, CheckmarkIcon, PullRequestIcon, IssueIcon } from './Icons'

interface RepoCardProps {
  repo: RepositoryWithIntelligence
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
}

function RepoCard({ repo, onTopicClick, activeDeveloperFilters = [] }: RepoCardProps) {
  const { toggleBookmark, isBookmarked, prefs, addToCollection } = usePersonalization()
  const bookmarked = isBookmarked(repo.fullName)
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isInAnyCollection = prefs.collections.some((c) => c.repoFullNames.includes(repo.fullName))

  useClickOutside(dropdownRef, showCollectionDropdown, () => setShowCollectionDropdown(false))

  const developerBadges = activeDeveloperFilters
    .map((filter) => evaluateDeveloperFilter(filter, repo))
    .filter((result) => result.badge)

  return (
    <article className="flex flex-col p-5 bg-github-darker border border-github-border rounded-xl hover:border-github-accent/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={repo.owner.avatarUrl}
          alt={`${repo.owner.login} avatar`}
          className="w-10 h-10 rounded-full flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-github-accent hover:underline truncate block"
            >
              {repo.fullName}
            </a>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                    isInAnyCollection
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-github-muted hover:text-github-text'
                  }`}
                  aria-label="Add to collection"
                  title={isInAnyCollection ? 'In collection(s)' : 'Add to collection'}
                >
                  <FolderIcon filled={isInAnyCollection} />
                </button>
                {showCollectionDropdown && (
                  <div className="absolute right-0 z-20 mt-2 w-56 bg-github-dark border border-github-border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-github-border">
                      <p className="text-xs text-github-muted font-medium">Add to collection</p>
                    </div>
                    {prefs.collections.length === 0 ? (
                      <div className="p-3 text-xs text-github-muted text-center">
                        No collections yet
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {prefs.collections.map((collection) => {
                          const isInCollection = collection.repoFullNames.includes(repo.fullName)
                          return (
                            <button
                              key={collection.id}
                              onClick={() => {
                                addToCollection(collection.id, repo.fullName)
                                setShowCollectionDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-github-border transition-colors flex items-center justify-between gap-2 ${
                                isInCollection ? 'text-github-accent' : 'text-github-text'
                              }`}
                            >
                              <span className="truncate">{collection.name}</span>
                              {isInCollection && <CheckmarkIcon />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleBookmark(repo.fullName)}
                className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-github-accent ${
                  bookmarked
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-github-muted hover:text-github-text'
                }`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this repo'}
                title={bookmarked ? 'Bookmarked' : 'Bookmark'}
              >
                <BookmarkIcon className="w-5 h-5" filled={bookmarked} />
              </button>
            </div>
          </div>
          {repo.description && (
            <p className="text-sm text-github-muted line-clamp-2 mt-1">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <LanguageBadge language={repo.language} color={repo.languageColor} />
        <LicenseBadge spdxId={repo.license?.spdxId || null} />
      </div>

      {developerBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {developerBadges.map((result, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${result.badge!.color} bg-github-dark/50 border border-github-border`}
            >
              <span>{result.badge!.icon}</span>
              <span>{result.badge!.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-github-muted mb-3">
        <span className="flex items-center gap-1" title={`${repo.stars} stars`}>
          <StarIcon />
          {formatNumber(repo.stars)}
        </span>
        <span className="flex items-center gap-1" title={`${repo.forks} forks`}>
          <ForkIcon />
          {formatNumber(repo.forks)}
        </span>
        {repo.openPRs > 0 && (
          <span className="flex items-center gap-1" title={`${repo.openPRs} open PRs`}>
            <PullRequestIcon />
            {formatNumber(repo.openPRs)}
          </span>
        )}
        <span className="flex items-center gap-1" title={`${repo.openIssues} open issues`}>
          <IssueIcon />
          {formatNumber(repo.openIssues)}
        </span>
        <span className="ml-auto text-xs" title={repo.pushedAt}>
          {formatRelativeTime(repo.pushedAt)}
        </span>
      </div>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-github-border">
          {repo.topics.slice(0, 5).map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicClick(topic)}
              className="px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full text-xs hover:bg-github-accent/20 focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              {topic}
            </button>
          ))}
          {repo.topics.length > 5 && (
            <span className="px-2 py-0.5 text-github-muted text-xs">
              +{repo.topics.length - 5}
            </span>
          )}
        </div>
      )}
    </article>
  )
}

export default RepoCard
