import { formatNumber, formatRelativeTime } from '../lib/utils'
import { StarIcon, ForkIcon } from './Icons'

interface RepoStatsRowProps {
  stars: number
  forks: number
  pushedAt: string
  compact?: boolean
}

function RepoStatsRow({ stars, forks, pushedAt, compact = false }: RepoStatsRowProps) {
  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-3 mt-2 text-xs' : 'gap-4 text-sm'} text-github-muted`}>
      <span className="flex items-center gap-1" title={`${stars} stars`}>
        <StarIcon />
        {formatNumber(stars)}
      </span>
      <span className="flex items-center gap-1" title={`${forks} forks`}>
        <ForkIcon />
        {formatNumber(forks)}
      </span>
      <span className={compact ? 'ml-auto' : 'ml-auto text-xs'} title={pushedAt}>
        {formatRelativeTime(pushedAt)}
      </span>
    </div>
  )
}

export default RepoStatsRow
