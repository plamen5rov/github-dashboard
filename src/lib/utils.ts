import { formatDistanceToNow, parseISO } from 'date-fns'
import { TIME_RANGES } from './constants'
import type { TimeRange } from './constants'

export type SortField = 'stars' | 'forks' | 'updated' | 'pull_requests' | 'issues' | 'best_match'
export type SortOrder = 'asc' | 'desc'

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return num.toString()
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

export function getDateForTimeRange(timeRange: TimeRange): string {
  const now = new Date()
  const days = TIME_RANGES[timeRange].days
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

export interface BuildQueryOptions {
  keyword?: string
  timeRange: TimeRange
  language?: string[]
  licenseType?: string
  minStars?: number
  topics?: string[]
  includeArchived?: boolean
  includeForks?: boolean
}

export function buildGitHubQuery(options: BuildQueryOptions): string {
  const parts: string[] = []

  if (options.keyword?.trim()) {
    parts.push(options.keyword.trim())
  }

  const pushedDate = getDateForTimeRange(options.timeRange)
  parts.push(`pushed:>${pushedDate}`)

  if (options.language && options.language.length > 0) {
    options.language.forEach((lang) => {
      parts.push(`language:${lang}`)
    })
  }

  if (options.licenseType && options.licenseType !== 'all') {
    if (options.licenseType === 'open_source') {
      const licenses = [
        'license:mit',
        'license:apache-2.0',
        'license:bsd-2-clause',
        'license:bsd-3-clause',
        'license:gpl-2.0',
        'license:gpl-3.0',
        'license:lgpl-2.1',
        'license:lgpl-3.0',
        'license:isc',
        'license:unlicense',
        'license:mpl-2.0',
        'license:agpl-3.0',
        'license:epl-2.0',
        'license:epl-1.0',
        'license:cc0-1.0',
        'license:bsl-1.0',
        'license:zlib',
        'license:artistic-2.0',
        'license:ofl-1.1',
        'license:0bsd',
        'license:wtfpl',
        'license:blueoak-1.0.0',
        'license:eupl-1.1',
        'license:eupl-1.2',
      ]
      parts.push(`(${licenses.join(' ')})`)
    } else if (options.licenseType === 'no_license') {
      parts.push('license:null')
    } else {
      parts.push(`license:${options.licenseType.toLowerCase()}`)
    }
  }

  if (options.minStars && options.minStars > 0) {
    parts.push(`stars:>=${options.minStars}`)
  }

  if (options.topics && options.topics.length > 0) {
    options.topics.forEach((topic) => {
      parts.push(`topic:${topic}`)
    })
  }

  if (!options.includeArchived) {
    parts.push('archived:false')
  }

  if (!options.includeForks) {
    parts.push('fork:false')
  }

  parts.push('stars:>50')

  return parts.join(' ')
}

export function getAPISortField(field: SortField): string | undefined {
  const mapping: Record<SortField, string | undefined> = {
    stars: 'stars',
    forks: 'forks',
    updated: 'updated',
    pull_requests: undefined,
    issues: 'help-wanted-issues',
    best_match: undefined,
  }
  return mapping[field]
}

export function isOSILicense(spdxId: string | null): boolean {
  if (!spdxId || spdxId === 'NOASSERTION' || spdxId === 'Other') {
    return false
  }
  const OSI_APPROVED = new Set([
    'MIT', 'Apache-2.0', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0',
    'MPL-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense',
    'CC0-1.0', 'BSL-1.0', 'Zlib', 'Artistic-2.0', 'EPL-1.0',
    'EPL-2.0', 'AGPL-3.0', 'EUPL-1.1', 'EUPL-1.2', 'OFL-1.1',
    'WTFPL', '0BSD', 'BlueOak-1.0.0',
  ])
  return OSI_APPROVED.has(spdxId)
}
