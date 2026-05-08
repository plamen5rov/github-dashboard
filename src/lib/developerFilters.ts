import type { RepositoryWithIntelligence, GraphQLRepositoryEnrichment } from '../types/github'
import type { DeveloperFilter } from '../hooks/useFilters'

export interface DeveloperFilterResult {
  matches: boolean
  badge?: { label: string; icon: string; color: string }
}

export function evaluateDeveloperFilter(
  filter: DeveloperFilter,
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  switch (filter) {
    case 'beginner_friendly':
      return evaluateBeginnerFriendly(repo, enrichment)
    case 'good_first_issue':
      return evaluateGoodFirstIssue(repo, enrichment)
    case 'actively_maintained':
      return evaluateActivelyMaintained(repo, enrichment)
    case 'solo_maintained':
      return evaluateSoloMaintained(repo, enrichment)
    case 'production_ready':
      return evaluateProductionReady(repo, enrichment)
    case 'ai_related':
      return evaluateAIRelated(repo, enrichment)
    case 'indie_project':
      return evaluateIndieProject(repo, enrichment)
    case 'new_exploding':
      return evaluateNewExploding(repo, enrichment)
    case 'low_competition':
      return evaluateLowCompetition(repo, enrichment)
    case 'enterprise_grade':
      return evaluateEnterpriseGrade(repo, enrichment)
    case 'lightweight':
      return evaluateLightweight(repo, enrichment)
    default:
      return { matches: true }
  }
}

function evaluateBeginnerFriendly(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const hasBeginnerTopics = repo.topics.some((t) =>
    ['beginner-friendly', 'tutorial', 'learning', 'education', 'examples'].includes(t),
  )
  const hasReadme = enrichment?.hasReadme ?? false
  const lowComplexity = repo.stars < 5000 && repo.forks < 1000

  const matches = hasBeginnerTopics || (hasReadme && lowComplexity)

  return {
    matches,
    badge: matches ? { label: 'Beginner-friendly', icon: '🌱', color: 'text-green-400' } : undefined,
  }
}

function evaluateGoodFirstIssue(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const goodFirstIssues = enrichment?.goodFirstIssueCount ?? 0
  const matches = goodFirstIssues > 0

  return {
    matches,
    badge: matches
      ? { label: `${goodFirstIssues} good first issues`, icon: '🎯', color: 'text-blue-400' }
      : undefined,
  }
}

function evaluateActivelyMaintained(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const daysSincePush = Math.floor(
    (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const contributorCount = enrichment?.contributorCount ?? 0
  const recentCommitCount = enrichment?.recentCommitCount ?? 0

  const matches = daysSincePush <= 7 && (contributorCount >= 2 || recentCommitCount >= 5)

  return {
    matches,
    badge: matches
      ? { label: 'Actively maintained', icon: '🔧', color: 'text-yellow-400' }
      : undefined,
  }
}

function evaluateSoloMaintained(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const contributorCount = enrichment?.contributorCount ?? 1
  const matches = contributorCount <= 2 && repo.stars > 100

  return {
    matches,
    badge: matches ? { label: 'Solo project', icon: '👤', color: 'text-purple-400' } : undefined,
  }
}

function evaluateProductionReady(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const hasReleases = (enrichment?.releaseCount ?? 0) > 0
  const hasTests = enrichment?.hasTests ?? false
  const isStable = repo.stars > 1000 && repo.forks > 100
  const hasLicense = repo.license !== null

  const matches = hasLicense && isStable && (hasReleases || hasTests)

  return {
    matches,
    badge: matches ? { label: 'Production ready', icon: '🚀', color: 'text-emerald-400' } : undefined,
  }
}

function evaluateAIRelated(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const aiTopics = repo.topics.filter((t) =>
    [
      'machine-learning',
      'artificial-intelligence',
      'deep-learning',
      'neural-network',
      'nlp',
      'computer-vision',
      'llm',
      'transformer',
      'ai',
      'ml',
      'generative-ai',
      'rag',
    ].includes(t),
  )
  const aiDescription =
    repo.description &&
    /machine learning|artificial intelligence|neural network|deep learning|llm|transformer|ai\s|ai\b|ml\s|ml\b/gi.test(
      repo.description,
    )

  const matches = aiTopics.length > 0 || aiDescription

  return {
    matches,
    badge: matches ? { label: 'AI/ML', icon: '🤖', color: 'text-cyan-400' } : undefined,
  }
}

function evaluateIndieProject(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const indieTopics = repo.topics.filter((t) =>
    ['indie', 'creative', 'art', 'game', 'music', 'pixel', 'fun', 'experimental', 'toy'].includes(t),
  )
  const smallProject = repo.stars < 2000 && repo.forks < 200
  const contributorCount = enrichment?.contributorCount ?? 1
  const isSolo = contributorCount <= 3

  const matches = (indieTopics.length > 0 && smallProject) || (smallProject && isSolo)

  return {
    matches,
    badge: matches ? { label: 'Indie project', icon: '🎨', color: 'text-pink-400' } : undefined,
  }
}

function evaluateNewExploding(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const repoAge = Math.floor(
    (Date.now() - new Date(repo.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const isNew = repoAge <= 90
  const growth = repo.growth
  const isExploding = growth && (growth.starsThisWeek > 50 || growth.momentumScore > 70)

  const matches = isNew && isExploding

  return {
    matches,
    badge: matches ? { label: 'New & exploding', icon: '💥', color: 'text-orange-400' } : undefined,
  }
}

function evaluateLowCompetition(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const isUndiscovered = repo.stars > 50 && repo.stars < 500
  const hasGoodQuality = repo.license !== null && repo.archived === false
  const growth = repo.growth
  const isGrowing = growth && growth.velocity > 0.5

  const matches = isUndiscovered && hasGoodQuality && isGrowing

  return {
    matches,
    badge: matches ? { label: 'Low competition gem', icon: '💎', color: 'text-indigo-400' } : undefined,
  }
}

function evaluateEnterpriseGrade(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const enterpriseTopics = repo.topics.filter((t) =>
    [
      'enterprise',
      'microservices',
      'cloud-native',
      'kubernetes',
      'docker',
      'api',
      'saas',
      'platform',
      'infrastructure',
      'devops',
    ].includes(t),
  )
  const isLarge = repo.stars > 5000 && repo.forks > 1000
  const hasManyContributors = (enrichment?.contributorCount ?? 0) > 10
  const hasReleases = (enrichment?.releaseCount ?? 0) > 5

  const matches =
    (enterpriseTopics.length > 0 && isLarge) ||
    (hasManyContributors && hasReleases && isLarge)

  return {
    matches,
    badge: matches ? { label: 'Enterprise grade', icon: '🏢', color: 'text-slate-400' } : undefined,
  }
}

function evaluateLightweight(
  repo: RepositoryWithIntelligence,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const lightweightTopics = repo.topics.filter((t) =>
    ['lightweight', 'minimal', 'zero-dependency', 'no-dependencies', 'tiny', 'micro', 'fast'].includes(t),
  )
  const isSmall = repo.stars < 10000
  const hasFewDependencies = enrichment?.dependencyCount !== undefined && enrichment.dependencyCount < 5

  const matches = lightweightTopics.length > 0 || (isSmall && hasFewDependencies)

  return {
    matches,
    badge: matches ? { label: 'Lightweight', icon: '🪶', color: 'text-teal-400' } : undefined,
  }
}
