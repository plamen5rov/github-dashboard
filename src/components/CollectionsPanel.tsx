import { useState, useEffect } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import { getToken, fetchRepoByFullName } from '../lib/github'
import type { RepositoryWithIntelligence } from '../types/github'
import { formatRelativeTime, formatNumber } from '../lib/utils'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import Panel from './Panel'
import { StarIcon, ForkIcon, ChevronUpIcon, TrashIcon, CloseIcon } from './Icons'

interface CollectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  onTopicClick: (topic: string) => void
}

function CollectionsPanel({ isOpen, onClose, onTopicClick }: CollectionsPanelProps) {
  const { prefs, addCollection, deleteCollection, removeFromCollection } = usePersonalization()
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null)
  const [reposMap, setReposMap] = useState<Map<string, RepositoryWithIntelligence>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const allFullNames = new Set<string>()
    prefs.collections.forEach((c) => c.repoFullNames.forEach((f) => allFullNames.add(f)))

    if (allFullNames.size === 0) {
      setReposMap(new Map())
      return
    }

    const fetchRepos = async () => {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const fetched = new Map<string, RepositoryWithIntelligence>()
      await Promise.allSettled(
        Array.from(allFullNames).map(async (fullName) => {
          try {
            const repo = await fetchRepoByFullName(fullName)
            if (repo) fetched.set(fullName, repo)
          } catch {
            // Skip failed fetches
          }
        }),
      )
      setReposMap(fetched)
      setLoading(false)
    }

    fetchRepos()
  }, [isOpen, prefs.collections])

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Collections"
      headerExtra={
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          {prefs.collections.length} collection{prefs.collections.length !== 1 ? 's' : ''}
        </span>
      }
      footer={
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full px-4 py-2 bg-github-accent/10 text-github-accent rounded-lg hover:bg-github-accent/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-github-accent"
        >
          + New Collection
        </button>
      }
    >
      {prefs.collections.length === 0 && !showCreateForm ? (
        <div className="text-center py-12">
          <svg className="mx-auto w-16 h-16 text-github-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-github-muted mb-2">No collections yet</p>
          <p className="text-xs text-github-muted">Create a collection and add repos from the folder icon on any repo card</p>
        </div>
      ) : (
        <div className="space-y-3">
          {showCreateForm && (
            <div className="p-4 bg-github-dark border border-github-border rounded-lg">
              <h3 className="text-sm font-medium text-github-text mb-3">New Collection</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent mb-2"
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 bg-github-darker border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      addCollection(newName.trim(), newDescription.trim() || undefined)
                      setNewName('')
                      setNewDescription('')
                      setShowCreateForm(false)
                    }
                  }}
                  className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-github-border text-github-text rounded-lg hover:bg-github-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {prefs.collections.map((collection) => {
            const isExpanded = expandedCollection === collection.id
            const repoCount = collection.repoFullNames.length

            return (
              <div
                key={collection.id}
                className="bg-github-dark border border-github-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCollection(isExpanded ? null : collection.id)}
                  className="w-full p-4 flex items-start justify-between text-left hover:bg-github-border/30 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-github-text">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-xs text-github-muted mt-1">{collection.description}</p>
                    )}
                    <p className="text-xs text-github-muted mt-2">
                      {repoCount} repo{repoCount !== 1 ? 's' : ''} · Updated {new Date(collection.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded && <ChevronUpIcon />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCollection(collection.id)
                      }}
                      className="p-1 text-github-muted hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      aria-label={`Delete collection ${collection.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-github-border p-4">
                    {repoCount === 0 ? (
                      <p className="text-xs text-github-muted text-center py-4">
                        No repos yet. Click the 📁 icon on any repo card to add it here.
                      </p>
                    ) : loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: repoCount }).map((_, i) => (
                          <div key={i} className="p-3 bg-github-darker border border-github-border rounded animate-pulse">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-github-border" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-github-border rounded w-3/4" />
                                <div className="h-3 bg-github-border rounded w-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {collection.repoFullNames.map((fullName) => {
                          const repo = reposMap.get(fullName)
                          return (
                            <div
                              key={fullName}
                              className="p-3 bg-github-darker border border-github-border rounded-lg hover:border-github-accent/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <a
                                    href={repo?.htmlUrl || `https://github.com/${fullName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-github-accent hover:underline truncate block"
                                  >
                                    {fullName}
                                  </a>
                                  {repo?.description && (
                                    <p className="text-xs text-github-muted line-clamp-2 mt-0.5">{repo.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeFromCollection(collection.id, fullName)}
                                  className="flex-shrink-0 p-1 text-github-muted hover:text-red-400 focus:outline-none rounded"
                                  aria-label={`Remove ${fullName} from collection`}
                                >
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {repo && (
                                <>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
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
                                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-github-border/50">
                                      {repo.topics.slice(0, 3).map((topic) => (
                                        <button
                                          key={topic}
                                          onClick={() => onTopicClick(topic)}
                                          className="px-1.5 py-0.5 bg-github-accent/10 text-github-accent rounded-full text-xs hover:bg-github-accent/20"
                                        >
                                          {topic}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

export default CollectionsPanel
