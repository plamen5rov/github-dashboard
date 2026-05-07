import type { SortField } from './utils'

export const TIME_RANGES = {
  day: { label: 'Today', days: 1 },
  week: { label: 'This Week', days: 7 },
  month: { label: 'This Month', days: 30 },
} as const

export type TimeRange = keyof typeof TIME_RANGES

export const SORT_OPTIONS: { field: SortField; label: string; icon: string }[] = [
  { field: 'best_match', label: 'Best Match', icon: '✨' },
  { field: 'stars', label: 'Most Starred', icon: '⭐' },
  { field: 'forks', label: 'Most Forked', icon: '🍴' },
  { field: 'pull_requests', label: 'Most Open PRs', icon: '🔀' },
  { field: 'issues', label: 'Most Open Issues', icon: '🐛' },
  { field: 'updated', label: 'Recently Updated', icon: '🕐' },
] as const

export const OSI_APPROVED_LICENSES = [
  'MIT',
  'Apache-2.0',
  'GPL-2.0',
  'GPL-3.0',
  'LGPL-2.1',
  'LGPL-3.0',
  'MPL-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'Unlicense',
  'CC0-1.0',
  'BSL-1.0',
  'Zlib',
  'Artistic-2.0',
  'EPL-1.0',
  'EPL-2.0',
  'AGPL-3.0',
  'EUPL-1.1',
  'EUPL-1.2',
  'OFL-1.1',
  'WTFPL',
  '0BSD',
  'BlueOak-1.0.0',
] as const

export const COMMON_LICENSES = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'GPL-2.0',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'LGPL-3.0',
  'MPL-2.0',
  'ISC',
  'AGPL-3.0',
  'Unlicense',
  'CC0-1.0',
] as const

export const DEFAULT_PER_PAGE = 30

export const GITHUB_API_BASE = 'https://api.github.com'

export const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
