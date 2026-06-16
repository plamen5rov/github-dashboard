import { useState, useEffect } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import { getToken, fetchRepoByFullName } from '../lib/github'
import type { Repository } from '../types/github'
import { formatRelativeTime, formatNumber } from '../lib/utils'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import Panel from './Panel'
import { StarIcon, ForkIcon, BookmarkIcon, BookmarkOutlineIcon } from './Icons'

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onTopicClick: (topic: string) => void
}

function BookmarksPanel({ isOpen, onClose, onTopicClick }: BookmarksPanelProps) {
  const { prefs, toggleBookmark } = usePersonalization()
  const [repos, setRepos] = useState<Map<string, Repository>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || prefs.bookmarks.length === 0) return

    const fetchBookmarks = async () => {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const fetched = new Map<string, Repository>()
      await Promise.allSettled(
        prefs.bookmarks.map(async (bookmark) => {
          try {
            const repo = await fetchRepoByFullName(bookmark.fullName)
            if (repo) fetched.set(bookmark.fullName, repo)
          } catch {
            // Skip failed fetches
          }
        }),
      )
      setRepos(fetched)
      setLoading(false)
    }

    fetchBookmarks()
  }, [isOpen, prefs.bookmarks])

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Bookmarks"
      headerExtra={
        <span className="px-2 py-0.5 bg-github-accent/20 text-github-accent rounded-full text-xs font-medium">
          {prefs.bookmarks.length} saved
        </span>
      }
    >
      {prefs.bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkOutlineIcon className="mx-auto w-16 h-16 text-github-muted mb-4" />
          <p className="text-github-muted mb-2">No bookmarks yet</p>
          <p className="text-xs text-github-muted">Click the bookmark icon on any repo to save it here</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 bg-github-dark border border-github-border rounded-xl animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-github-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-github-border rounded w-3/4" />
                  <div className="h-4 bg-github-border rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prefs.bookmarks.map((bookmark) => {
            const repo = repos.get(bookmark.fullName)
            return (
              <div
                key={bookmark.fullName}
                className="p-4 bg-github-dark border border-github-border rounded-xl hover:border-github-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <a
                      href={repo?.htmlUrl || `https://github.com/${bookmark.fullName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-github-accent hover:underline truncate block"
                    >
                      {bookmark.fullName}
                    </a>
                    {repo?.description && (
                      <p className="text-xs text-github-muted line-clamp-2 mt-1">{repo.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBookmark(bookmark.fullName)}
                    className="flex-shrink-0 p-1 text-yellow-400 hover:text-yellow-300 focus:outline-none rounded"
                    aria-label="Remove bookmark"
                  >
                    <BookmarkIcon className="w-4 h-4" filled />
                  </button>
                </div>

                {repo && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <LanguageBadge language={repo.language} color={repo.languageColor} />
                      <LicenseBadge spdxId={repo.license?.spdxId || null} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-github-muted">
                      <span className="flex items-center gap-1">
                        <StarIcon />
                        {formatNumber(repo.stars)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ForkIcon />
                        {formatNumber(repo.forks)}
                      </span>
                      <span className="ml-auto">{formatRelativeTime(repo.pushedAt)}</span>
                    </div>

                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-github-border">
                        {repo.topics.slice(0, 4).map((topic) => (
                          <button
                            key={topic}
                            onClick={() => onTopicClick(topic)}
                            className="px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full text-xs hover:bg-github-accent/20"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {bookmark.note && (
                  <p className="text-xs text-github-muted mt-2 italic">"{bookmark.note}"</p>
                )}
                <p className="text-xs text-github-muted/60 mt-1">
                  Saved {formatRelativeTime(bookmark.addedAt)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

export default BookmarksPanel
