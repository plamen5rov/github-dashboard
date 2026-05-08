import type { GrowthMetrics } from '../types/github'
import { getTrendEmoji, getTrendLabel } from '../lib/growth'
import { formatNumber } from '../lib/utils'

interface RepositoryInsightProps {
  growth: GrowthMetrics
}

function RepositoryInsight({ growth }: RepositoryInsightProps) {
  const { starsToday, starsThisWeek, starsThisMonth, velocity, momentumScore, trend, trendingTopics } = growth

  if (momentumScore < 10 && starsThisWeek < 5) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-github-border space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-base">{getTrendEmoji(trend)}</span>
        <span className="text-github-muted">{getTrendLabel(trend)}</span>
        <span className="ml-auto px-1.5 py-0.5 bg-github-accent/10 text-github-accent rounded text-xs font-medium">
          {momentumScore} momentum
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-github-muted">
        {starsToday > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-green-400">🚀</span>
            +{formatNumber(starsToday)} today
          </span>
        )}
        {starsThisWeek > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-blue-400">📈</span>
            +{formatNumber(starsThisWeek)} this week
          </span>
        )}
        {starsThisMonth > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-purple-400">⭐</span>
            +{formatNumber(starsThisMonth)} this month
          </span>
        )}
        {velocity > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">⚡</span>
            {velocity}/day
          </span>
        )}
      </div>

      {trendingTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {trendingTopics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 rounded-full text-xs font-medium"
            >
              🔥 {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default RepositoryInsight
