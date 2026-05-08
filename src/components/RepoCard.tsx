import type { RepositoryWithIntelligence } from '../types/github'
import LanguageBadge from './LanguageBadge'
import LicenseBadge from './LicenseBadge'
import RepositoryInsight from './RepositoryInsight'
import { formatNumber, formatRelativeTime } from '../lib/utils'
import { evaluateDeveloperFilter } from '../lib/developerFilters'
import type { DeveloperFilter } from '../hooks/useFilters'

interface RepoCardProps {
  repo: RepositoryWithIntelligence
  onTopicClick: (topic: string) => void
  activeDeveloperFilters?: DeveloperFilter[]
}

function RepoCard({ repo, onTopicClick, activeDeveloperFilters = [] }: RepoCardProps) {
  const developerBadges = activeDeveloperFilters
    .map((filter) => evaluateDeveloperFilter(filter, repo))
    .filter((result) => result.badge)

  return (
    <article className="flex flex-col p-5 bg-github-darker border border-github-border rounded-xl hover:border-github-accent/50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={repo.owner.avatarUrl}
          alt={`${repo.owner.login} avatar`}
          className="w-10 h-10 rounded-full flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-github-accent hover:underline truncate block"
          >
            {repo.fullName}
          </a>
          {repo.description && (
            <p className="text-sm text-github-muted line-clamp-2 mt-1">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <LanguageBadge language={repo.language} color={repo.languageColor} />
        <LicenseBadge spdxId={repo.license?.spdxId || null} name={repo.license?.name || null} />
      </div>

      {developerBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {developerBadges.map((result, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${result.badge!.color} bg-github-dark/50 border border-github-border`}
            >
              <span>{result.badge!.icon}</span>
              <span>{result.badge!.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-github-muted mb-3">
        <span className="flex items-center gap-1" title={`${repo.stars} stars`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.37a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          {formatNumber(repo.stars)}
        </span>
        <span className="flex items-center gap-1" title={`${repo.forks} forks`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          {formatNumber(repo.forks)}
        </span>
        {repo.openPRs > 0 && (
          <span className="flex items-center gap-1" title={`${repo.openPRs} open PRs`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M1.75 0h2.5C4.94 0 5.5.56 5.5 1.25v2.5C5.5 4.44 4.94 5 4.25 5h-2.5C1.06 5 .5 4.44.5 3.75v-2.5C.5.56 1.06 0 1.75 0zM4 3.75v-2.5h-2.5v2.5h2.5zM11.75 0h2.5c.69 0 1.25.56 1.25 1.25v2.5c0 .69-.56 1.25-1.25 1.25h-2.5c-.69 0-1.25-.56-1.25-1.25v-2.5C10.5.56 11.06 0 11.75 0zm2.5 2.5v-2.5h-2.5v2.5h2.5zM1.75 8h2.5c.69 0 1.25.56 1.25 1.25v2.5c0 .69-.56 1.25-1.25 1.25h-2.5C1.06 13 .5 12.44.5 11.75v-2.5C.5 8.56 1.06 8 1.75 8zM4 11.75v-2.5h-2.5v2.5h2.5zM13 8.75c-.69 0-1.25.56-1.25 1.25v2.5c0 .69.56 1.25 1.25 1.25h1.25c.69 0 1.25-.56 1.25-1.25v-2.5c0-.69-.56-1.25-1.25-1.25H13z" />
            </svg>
            {formatNumber(repo.openPRs)}
          </span>
        )}
        <span className="flex items-center gap-1" title={`${repo.openIssues} open issues`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
          </svg>
          {formatNumber(repo.openIssues)}
        </span>
        <span className="ml-auto text-xs" title={repo.pushedAt}>
          {formatRelativeTime(repo.pushedAt)}
        </span>
      </div>

      {repo.growth && <RepositoryInsight growth={repo.growth} />}

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-github-border">
          {repo.topics.slice(0, 5).map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicClick(topic)}
              className="px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full text-xs hover:bg-github-accent/20 focus:outline-none focus:ring-2 focus:ring-github-accent"
            >
              {topic}
            </button>
          ))}
          {repo.topics.length > 5 && (
            <span className="px-2 py-0.5 text-github-muted text-xs">
              +{repo.topics.length - 5}
            </span>
          )}
        </div>
      )}
    </article>
  )
}

export default RepoCard
