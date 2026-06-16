import type { Repository, GraphQLRepositoryEnrichment } from '../types/github'
import type { DeveloperFilter } from '../hooks/useFilters'

interface DeveloperFilterResult {
  matches: boolean
  badge?: { label: string; icon: string; color: string }
}

export function evaluateDeveloperFilter(
  filter: DeveloperFilter,
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  switch (filter) {
    case 'beginner_friendly':
      return evaluateBeginnerFriendly(repo)
      case 'good_first_issue':
      return evaluateGoodFirstIssue(repo, enrichment)
      case 'actively_maintained':
      return evaluateActivelyMaintained(repo, enrichment)
      case 'solo_maintained':
      return evaluateSoloMaintained(repo, enrichment)
      case 'production_ready':
      return evaluateProductionReady(repo)
      case 'ai_related':
      return evaluateAIRelated(repo)
      case 'indie_project':
      return evaluateIndieProject(repo, enrichment)
      case 'new_exploding':
      return evaluateNewExploding(repo)
      case 'low_competition':
      return evaluateLowCompetition(repo)
      case 'enterprise_grade':
      return evaluateEnterpriseGrade(repo, enrichment)
    default:
      return { matches: true }
  }
}

function evaluateBeginnerFriendly(
  repo: Repository,
): DeveloperFilterResult {
  const hasBeginnerTopics = repo.topics.some((t) =>
    ['beginner-friendly', 'tutorial', 'learning', 'education', 'examples', 'good-first-issue', 'beginner'].includes(t),
  )
  const lowComplexity = repo.stars < 10000 && repo.forks < 2000
  const hasOpenIssues = repo.openIssues > 0

  const matches = hasBeginnerTopics || (lowComplexity && hasOpenIssues)

  return {
    matches,
    badge: matches ? { label: 'Beginner-friendly', icon: '🌱', color: 'text-green-400' } : undefined,
  }
}

function evaluateGoodFirstIssue(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const goodFirstIssues = enrichment?.goodFirstIssueCount ?? 0
  const hasGoodFirstTopic = repo.topics.some((t) =>
    ['good-first-issue', 'beginner-friendly', 'hacktoberfest'].includes(t),
  )
  const hasOpenIssues = repo.openIssues > 2

  const matches = goodFirstIssues > 0 || hasGoodFirstTopic || hasOpenIssues

  return {
    matches,
    badge: goodFirstIssues > 0
      ? { label: `${goodFirstIssues} good first issues`, icon: '🎯', color: 'text-blue-400' }
      : matches
        ? { label: 'Has open issues', icon: '🎯', color: 'text-blue-400' }
        : undefined,
  }
}

function evaluateActivelyMaintained(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const daysSincePush = Math.floor(
    (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const contributorCount = enrichment?.contributorCount ?? 0
  const recentCommitCount = enrichment?.recentCommitCount ?? 0

  const matches = daysSincePush <= 30 && (contributorCount >= 1 || recentCommitCount >= 1 || daysSincePush <= 7)

  return {
    matches,
    badge: matches
      ? { label: daysSincePush <= 7 ? 'Active this week' : 'Active this month', icon: '🔧', color: 'text-yellow-400' }
      : undefined,
  }
}

function evaluateSoloMaintained(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const contributorCount = enrichment?.contributorCount ?? 1
  const matches = contributorCount <= 3 && repo.stars > 50 && repo.stars < 5000

  return {
    matches,
    badge: matches ? { label: 'Solo/small team', icon: '👤', color: 'text-purple-400' } : undefined,
  }
}

function evaluateProductionReady(
  repo: Repository,
): DeveloperFilterResult {
  const isStable = repo.stars > 500 && repo.forks > 50
  const hasLicense = repo.license !== null
  const hasTopics = repo.topics.length > 0

  const matches = hasLicense && (isStable || hasTopics)

  return {
    matches,
    badge: matches ? { label: 'Production ready', icon: '🚀', color: 'text-emerald-400' } : undefined,
  }
}

function evaluateAIRelated(
  repo: Repository,
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
      'chatgpt',
      'openai',
    ].includes(t),
  )
  const aiDescription =
    repo.description &&
    /machine learning|artificial intelligence|neural network|deep learning|llm|transformer|gpt|ai\s|ai\b|ml\s|ml\b|chatbot|agent/gi.test(
      repo.description,
    )

  const matches = aiTopics.length > 0 || !!aiDescription

  return {
    matches,
    badge: matches ? { label: 'AI/ML', icon: '🤖', color: 'text-cyan-400' } : undefined,
  }
}

function evaluateIndieProject(
  repo: Repository,
  enrichment?: GraphQLRepositoryEnrichment,
): DeveloperFilterResult {
  const indieTopics = repo.topics.filter((t) =>
    ['indie', 'creative', 'art', 'game', 'music', 'pixel', 'fun', 'experimental', 'toy', 'hobby', 'personal'].includes(t),
  )
  const smallProject = repo.stars < 5000 && repo.forks < 500
  const contributorCount = enrichment?.contributorCount ?? 1
  const isSolo = contributorCount <= 3

  const matches = (indieTopics.length > 0 && smallProject) || (smallProject && isSolo)

  return {
    matches,
    badge: matches ? { label: 'Indie project', icon: '🎨', color: 'text-pink-400' } : undefined,
  }
}

function evaluateNewExploding(
  repo: Repository,
): DeveloperFilterResult {
  const repoAge = Math.floor(
    (Date.now() - new Date(repo.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const isNew = repoAge <= 180
  const hasSomeStars = repo.stars > 50

  const matches = isNew && hasSomeStars

  return {
    matches,
    badge: matches ? { label: 'Recently created', icon: '💥', color: 'text-orange-400' } : undefined,
  }
}

function evaluateLowCompetition(
  repo: Repository,
): DeveloperFilterResult {
  const matches = repo.license !== null

  return {
    matches,
    badge: matches ? { label: 'Low competition', icon: '💎', color: 'text-indigo-400' } : undefined,
  }
}

function evaluateEnterpriseGrade(
  repo: Repository,
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
  const isLarge = repo.stars > 1000 && repo.forks > 200
  const hasManyContributors = (enrichment?.contributorCount ?? 0) > 5
  const hasReleases = (enrichment?.releaseCount ?? 0) > 2

  const matches =
    (enterpriseTopics.length > 0 && isLarge) ||
    (hasManyContributors && hasReleases) ||
    (isLarge && repo.topics.length > 3)

  return {
    matches,
    badge: matches ? { label: 'Enterprise grade', icon: '🏢', color: 'text-slate-400' } : undefined,
  }
}
