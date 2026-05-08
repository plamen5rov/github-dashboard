import { describe, it, expect } from 'vitest'
import { calculateGrowthMetrics, getTrendEmoji, getTrendLabel } from '../lib/growth'
import { formatDistanceToNow, parseISO, subDays, subHours } from 'date-fns'

describe('calculateGrowthMetrics', () => {
  const now = new Date()

  it('returns zero metrics for empty timeline', () => {
    const metrics = calculateGrowthMetrics([], 1000, subDays(now, 365).toISOString(), now.toISOString())
    expect(metrics.starsToday).toBe(0)
    expect(metrics.starsThisWeek).toBe(0)
    expect(metrics.starsThisMonth).toBe(0)
    expect(metrics.velocity).toBe(0)
    expect(metrics.trend).toBe('stable')
  })

  it('detects accelerating trend', () => {
    const lastWeekStars = Array.from({ length: 5 }, (_, i) => ({
      starred_at: subDays(now, 8 + i).toISOString(),
    }))
    const thisWeekStars = Array.from({ length: 25 }, (_, i) => ({
      starred_at: subDays(now, Math.floor(i / 4)).toISOString(),
    }))
    const timeline = [...lastWeekStars, ...thisWeekStars]
    const metrics = calculateGrowthMetrics(timeline, 1000, subDays(now, 365).toISOString(), now.toISOString())
    expect(metrics.starsThisWeek).toBeGreaterThan(5)
    expect(metrics.velocity).toBeGreaterThan(0)
    expect(metrics.trend).toBe('accelerating')
  })

  it('marks new repositories', () => {
    const timeline = Array.from({ length: 10 }, (_, i) => ({
      starred_at: subHours(now, i).toISOString(),
    }))
    const metrics = calculateGrowthMetrics(timeline, 50, subDays(now, 3).toISOString(), now.toISOString())
    expect(metrics.trend).toBe('new')
  })

  it('calculates momentum score', () => {
    const timeline = Array.from({ length: 50 }, (_, i) => ({
      starred_at: subDays(now, i).toISOString(),
    }))
    const metrics = calculateGrowthMetrics(timeline, 5000, subDays(now, 180).toISOString(), now.toISOString())
    expect(metrics.momentumScore).toBeGreaterThanOrEqual(0)
    expect(metrics.momentumScore).toBeLessThanOrEqual(100)
  })

  it('identifies trending topics', () => {
    const timeline = [
      ...Array.from({ length: 60 }, (_, i) => ({
        starred_at: subHours(now, i).toISOString(),
      })),
      ...Array.from({ length: 100 }, (_, i) => ({
        starred_at: subHours(now, Math.floor(i / 5)).toISOString(),
      })),
    ]
    const metrics = calculateGrowthMetrics(timeline, 10000, subDays(now, 30).toISOString(), now.toISOString())
    expect(metrics.trendingTopics.length).toBeGreaterThan(0)
  })
})

describe('getTrendEmoji', () => {
  it('returns correct emoji for each trend', () => {
    expect(getTrendEmoji('accelerating')).toBe('📈')
    expect(getTrendEmoji('stable')).toBe('➡️')
    expect(getTrendEmoji('declining')).toBe('📉')
    expect(getTrendEmoji('new')).toBe('🌟')
  })
})

describe('getTrendLabel', () => {
  it('returns correct label for each trend', () => {
    expect(getTrendLabel('accelerating')).toBe('Growth accelerating')
    expect(getTrendLabel('stable')).toBe('Steady growth')
    expect(getTrendLabel('declining')).toBe('Cooling down')
    expect(getTrendLabel('new')).toBe('New repository')
  })
})
