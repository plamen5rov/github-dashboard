interface TopicChipListProps {
  topics: string[]
  max?: number
  onTopicClick: (topic: string) => void
}

function TopicChipList({ topics, max = 5, onTopicClick }: TopicChipListProps) {
  if (topics.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-github-border">
      {topics.slice(0, max).map((topic) => (
        <button
          key={topic}
          onClick={() => onTopicClick(topic)}
          className="px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full text-xs hover:bg-github-accent/20 focus:outline-none focus:ring-2 focus:ring-github-accent"
        >
          {topic}
        </button>
      ))}
      {topics.length > max && (
        <span className="px-2 py-0.5 text-github-muted text-xs">
          +{topics.length - max}
        </span>
      )}
    </div>
  )
}

export default TopicChipList
