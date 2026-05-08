import { parseISO, differenceInDays, differenceInHours, subDays, subHours } from 'date-fns'
import type { StarTimelineEntry, GrowthMetrics } from '../types/github'

export function calculateGrowthMetrics(
  starTimeline: StarTimelineEntry[],
  totalStars: number,
  createdAt: string,
  pushedAt: string,
): GrowthMetrics {
  const now = new Date()
  const createdDate = parseISO(createdAt)
  const repoAgeDays = Math.max(differenceInDays(now, createdDate), 1)

  const starsToday = starTimeline.filter((entry) => {
    const starredAt = parseISO(entry.starred_at)
    return differenceInHours(now, starredAt) <= 24
  }).length

  const starsThisWeek = starTimeline.filter((entry) => {
    const starredAt = parseISO(entry.starred_at)
    return differenceInDays(now, starredAt) <= 7
  }).length

  const starsThisMonth = starTimeline.filter((entry) => {
    const starredAt = parseISO(entry.starred_at)
    return differenceInDays(now, starredAt) <= 30
  }).length

  const lastWeekStars = starTimeline.filter((entry) => {
    const starredAt = parseISO(entry.starred_at)
    const daysDiff = differenceInDays(now, starredAt)
    return daysDiff > 7 && daysDiff <= 14
  }).length

  const velocity = starsThisWeek / 7

  const weekOverWeekGrowth = lastWeekStars > 0 ? (starsThisWeek - lastWeekStars) / lastWeekStars : 0

  let trend: GrowthMetrics['trend']
  if (repoAgeDays < 7) {
    trend = 'new'
  } else if (weekOverWeekGrowth > 0.2) {
    trend = 'accelerating'
  } else if (weekOverWeekGrowth < -0.2) {
    trend = 'declining'
  } else {
    trend = 'stable'
  }

  const starsPerDay = totalStars / repoAgeDays
  const normalizedVelocity = velocity / Math.max(starsPerDay, 0.1)
  const recencyScore = Math.min(differenceInDays(now, parseISO(pushedAt)), 30) / 30
  const momentumScore = Math.round(
    (normalizedVelocity * 0.5 + (1 - recencyScore) * 0.3 + (starsThisMonth / Math.max(totalStars, 1)) * 0.2) * 100,
  )

  const trendingTopics: string[] = []
  if (starsToday > 50) trendingTopics.push('viral')
  if (starsThisWeek > 200) trendingTopics.push('trending')
  if (trend === 'accelerating') trendingTopics.push('growth accelerating')
  if (momentumScore > 80) trendingTopics.push('high momentum')

  return {
    starsToday,
    starsThisWeek,
    starsThisMonth,
    forksGrowth: Math.round(totalStars * 0.1),
    velocity: Math.round(velocity * 10) / 10,
    momentumScore,
    trend,
    trendingTopics,
  }
}

export function getTrendEmoji(trend: GrowthMetrics['trend']): string {
  const emojis = {
    accelerating: '📈',
    stable: '➡️',
    declining: '📉',
    new: '🌟',
  }
  return emojis[trend]
}

export function getTrendLabel(trend: GrowthMetrics['trend']): string {
  const labels = {
    accelerating: 'Growth accelerating',
    stable: 'Steady growth',
    declining: 'Cooling down',
    new: 'New repository',
  }
  return labels[trend]
}
