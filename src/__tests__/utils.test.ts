import { describe, it, expect } from 'vitest'
import { formatNumber, formatRelativeTime, getDateForTimeRange, buildGitHubQuery, isOSILicense } from '../lib/utils'

describe('formatNumber', () => {
  it('formats numbers under 1000 as-is', () => {
    expect(formatNumber(500)).toBe('500')
    expect(formatNumber(99)).toBe('99')
  })

  it('formats thousands with k suffix', () => {
    expect(formatNumber(1000)).toBe('1k')
    expect(formatNumber(1500)).toBe('1.5k')
    expect(formatNumber(12400)).toBe('12.4k')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M')
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(12400000)).toBe('12.4M')
  })
})

describe('formatRelativeTime', () => {
  it('formats past dates with ago suffix', () => {
    const now = new Date()
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const result = formatRelativeTime(threeHoursAgo.toISOString())
    expect(result).toContain('ago')
  })

  it('formats day-based distances', () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(sevenDaysAgo.toISOString())
    expect(result).toMatch(/7 days? ago/)
  })
})

describe('getDateForTimeRange', () => {
  it('returns date 1 day ago for day range', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    const expected = yesterday.toISOString().split('T')[0]
    const result = getDateForTimeRange('day')
    expect(result).toBe(expected)
  })

  it('returns date 7 days ago for week range', () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const expected = weekAgo.toISOString().split('T')[0]
    const result = getDateForTimeRange('week')
    expect(result).toBe(expected)
  })

  it('returns date 30 days ago for month range', () => {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const expected = monthAgo.toISOString().split('T')[0]
    const result = getDateForTimeRange('month')
    expect(result).toBe(expected)
  })
})

describe('buildGitHubQuery', () => {
  it('builds basic query with time range', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('pushed:>')
    expect(query).toContain('stars:>50')
  })

  it('adds keyword to query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', keyword: 'react' })
    expect(query).toContain('react')
  })

  it('adds language filter', () => {
    const query = buildGitHubQuery({ timeRange: 'week', language: ['TypeScript'] })
    expect(query).toContain('language:TypeScript')
  })

  it('adds multiple language filters', () => {
    const query = buildGitHubQuery({ timeRange: 'week', language: ['TypeScript', 'JavaScript'] })
    expect(query).toContain('language:TypeScript')
    expect(query).toContain('language:JavaScript')
  })

  it('adds min stars filter', () => {
    const query = buildGitHubQuery({ timeRange: 'week', minStars: 1000 })
    expect(query).toContain('stars:>=1000')
  })

  it('adds topic filters', () => {
    const query = buildGitHubQuery({ timeRange: 'week', topics: ['react', 'hooks'] })
    expect(query).toContain('topic:react')
    expect(query).toContain('topic:hooks')
  })

  it('excludes archived by default', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('archived:false')
  })

  it('includes archived when specified', () => {
    const query = buildGitHubQuery({ timeRange: 'week', includeArchived: true })
    expect(query).not.toContain('archived:false')
  })

  it('excludes forks by default', () => {
    const query = buildGitHubQuery({ timeRange: 'week' })
    expect(query).toContain('fork:false')
  })

  it('includes forks when specified', () => {
    const query = buildGitHubQuery({ timeRange: 'week', includeForks: true })
    expect(query).not.toContain('fork:false')
  })

  it('builds open source license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'open_source' })
    expect(query).toContain('(license:mit')
  })

  it('builds no license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'no_license' })
    expect(query).toContain('license:null')
  })

  it('builds specific license query', () => {
    const query = buildGitHubQuery({ timeRange: 'week', licenseType: 'MIT' })
    expect(query).toContain('license:mit')
  })
})

describe('isOSILicense', () => {
  it('returns true for MIT', () => {
    expect(isOSILicense('MIT')).toBe(true)
  })

  it('returns true for Apache-2.0', () => {
    expect(isOSILicense('Apache-2.0')).toBe(true)
  })

  it('returns true for GPL-3.0', () => {
    expect(isOSILicense('GPL-3.0')).toBe(true)
  })

  it('returns false for null', () => {
    expect(isOSILicense(null)).toBe(false)
  })

  it('returns false for NOASSERTION', () => {
    expect(isOSILicense('NOASSERTION')).toBe(false)
  })

  it('returns false for Other', () => {
    expect(isOSILicense('Other')).toBe(false)
  })
})
