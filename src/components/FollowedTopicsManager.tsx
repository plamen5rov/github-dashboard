import { useState } from 'react'
import { usePersonalization } from '../hooks/usePersonalization'
import Panel from './Panel'

interface FollowedTopicsManagerProps {
  isOpen: boolean
  onClose: () => void
}

function FollowedTopicsManager({ isOpen, onClose }: FollowedTopicsManagerProps) {
  const { prefs, followTopic, unfollowTopic } = usePersonalization()
  const [newTopic, setNewTopic] = useState('')

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Followed Topics" maxW="max-w-lg" maxH="max-h-[80vh]">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newTopic.trim()) {
              followTopic(newTopic.trim().toLowerCase())
              setNewTopic('')
            }
          }}
          placeholder="Add a topic to follow..."
          className="flex-1 px-3 py-2 bg-github-dark border border-github-border rounded-lg text-sm text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
        />
        <button
          onClick={() => {
            if (newTopic.trim()) {
              followTopic(newTopic.trim().toLowerCase())
              setNewTopic('')
            }
          }}
          className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 text-sm focus:outline-none focus:ring-2 focus:ring-github-accent"
        >
          Follow
        </button>
      </div>

      {prefs.followedTopics.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto w-12 h-12 text-github-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-github-muted">No followed topics yet</p>
          <p className="text-xs text-github-muted mt-1">Follow topics to track them here</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {prefs.followedTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-github-accent/10 text-github-accent border border-github-accent/30 rounded-full text-sm"
            >
              <span className="text-xs">#</span>
              {topic}
              <button
                onClick={() => unfollowTopic(topic)}
                className="ml-1 text-github-accent/60 hover:text-red-400 focus:outline-none"
                aria-label={`Unfollow topic ${topic}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}

export default FollowedTopicsManager
