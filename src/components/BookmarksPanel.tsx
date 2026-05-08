import { useState, useEffect } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import { getToken, fetchRepoByFullName } from '../lib/github'
import type { RepositoryWithIntelligence } from '../types/github'
import { formatRelativeTime, formatNumber } from '../lib/utils'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'

interface BookmarksPanelProps {
  isOpen: boolean
  onClose: () => void
  onTopicClick: (topic: string) => void
}

function BookmarksPanel({ isOpen, onClose, onTopicClick }: BookmarksPanelProps) {
  const { prefs, toggleBookmark } = usePersonalization()
  const [repos, setRepos] = useState<Map<string, RepositoryWithIntelligence>>(new Map())
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

      const fetched = new Map<string, RepositoryWithIntelligence>()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-github-darker border border-github-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-github-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-github-text">Bookmarks</h2>
            <span className="px-2 py-0.5 bg-github-accent/20 text-github-accent rounded-full text-xs font-medium">
              {prefs.bookmarks.length} saved
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
            aria-label="Close bookmarks panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {prefs.bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto w-16 h-16 text-github-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
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
                        <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    {repo && (
                      <>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <LanguageBadge language={repo.language} color={repo.languageColor} />
                          <LicenseBadge spdxId={repo.license?.spdxId || null} name={repo.license?.name || null} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-github-muted">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.37a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                            </svg>
                            {formatNumber(repo.stars)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                            </svg>
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
        </div>
      </div>
    </div>
  )
}

export default BookmarksPanel
