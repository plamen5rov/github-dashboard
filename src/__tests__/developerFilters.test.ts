import { describe, it, expect } from 'vitest'
import { evaluateDeveloperFilter } from '../lib/developerFilters'
import type { RepositoryWithIntelligence, GraphQLRepositoryEnrichment } from '../types/github'

function createMockRepo(overrides: Partial<RepositoryWithIntelligence> = {}): RepositoryWithIntelligence {
  return {
    id: 1,
    name: 'test-repo',
    fullName: 'user/test-repo',
    description: 'A test repository',
    htmlUrl: 'https://github.com/user/test-repo',
    owner: { login: 'user', avatarUrl: 'https://example.com/avatar.png' },
    stars: 100,
    forks: 20,
    openIssues: 5,
    openPRs: 2,
    pushedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    language: 'TypeScript',
    languageColor: '#3178c6',
    license: { spdxId: 'MIT', name: 'MIT License' },
    topics: [],
    archived: false,
    isFork: false,
    growth: {
      starsToday: 5,
      starsThisWeek: 30,
      starsThisMonth: 100,
      forksGrowth: 10,
      velocity: 4.3,
      momentumScore: 50,
      trend: 'stable',
      trendingTopics: [],
    },
    ...overrides,
  }
}

function createMockEnrichment(overrides: Partial<GraphQLRepositoryEnrichment> = {}): GraphQLRepositoryEnrichment {
  return {
    openPRs: 2,
    openIssues: 5,
    languageColor: '#3178c6',
    goodFirstIssueCount: 0,
    contributorCount: 1,
    recentCommitCount: 3,
    releaseCount: 0,
    hasReadme: false,
    hasTests: false,
    dependencyCount: 0,
    ...overrides,
  }
}

describe('evaluateDeveloperFilter', () => {
  describe('beginner_friendly', () => {
    it('matches repos with beginner-friendly topics', () => {
      const repo = createMockRepo({ topics: ['beginner-friendly', 'tutorial'] })
      const result = evaluateDeveloperFilter('beginner_friendly', repo)
      expect(result.matches).toBe(true)
      expect(result.badge).toBeDefined()
    })

    it('does not match repos without beginner signals', () => {
      const repo = createMockRepo()
      const result = evaluateDeveloperFilter('beginner_friendly', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('good_first_issue', () => {
    it('matches repos with good first issues', () => {
      const repo = createMockRepo()
      const enrichment = createMockEnrichment({ goodFirstIssueCount: 3 })
      const result = evaluateDeveloperFilter('good_first_issue', repo, enrichment)
      expect(result.matches).toBe(true)
      expect(result.badge?.label).toContain('good first issues')
    })

    it('does not match repos without good first issues', () => {
      const repo = createMockRepo()
      const result = evaluateDeveloperFilter('good_first_issue', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('actively_maintained', () => {
    it('matches repos with recent activity and multiple contributors', () => {
      const repo = createMockRepo({ pushedAt: new Date().toISOString() })
      const enrichment = createMockEnrichment({ contributorCount: 5, recentCommitCount: 10 })
      const result = evaluateDeveloperFilter('actively_maintained', repo, enrichment)
      expect(result.matches).toBe(true)
    })

    it('does not match stale repos', () => {
      const repo = createMockRepo({ pushedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() })
      const result = evaluateDeveloperFilter('actively_maintained', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('solo_maintained', () => {
    it('matches repos with 1-2 contributors and some stars', () => {
      const repo = createMockRepo({ stars: 500 })
      const enrichment = createMockEnrichment({ contributorCount: 1 })
      const result = evaluateDeveloperFilter('solo_maintained', repo, enrichment)
      expect(result.matches).toBe(true)
    })

    it('does not match repos with many contributors', () => {
      const repo = createMockRepo()
      const enrichment = createMockEnrichment({ contributorCount: 20 })
      const result = evaluateDeveloperFilter('solo_maintained', repo, enrichment)
      expect(result.matches).toBe(false)
    })
  })

  describe('production_ready', () => {
    it('matches repos with license, stars, and releases', () => {
      const repo = createMockRepo({ stars: 5000, forks: 500 })
      const enrichment = createMockEnrichment({ releaseCount: 10 })
      const result = evaluateDeveloperFilter('production_ready', repo, enrichment)
      expect(result.matches).toBe(true)
    })

    it('does not match repos without license', () => {
      const repo = createMockRepo({ license: null, stars: 5000, forks: 500 })
      const result = evaluateDeveloperFilter('production_ready', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('ai_related', () => {
    it('matches repos with AI topics', () => {
      const repo = createMockRepo({ topics: ['machine-learning', 'deep-learning'] })
      const result = evaluateDeveloperFilter('ai_related', repo)
      expect(result.matches).toBe(true)
    })

    it('matches repos with AI in description', () => {
      const repo = createMockRepo({ description: 'A machine learning library for neural networks' })
      const result = evaluateDeveloperFilter('ai_related', repo)
      expect(result.matches).toBe(true)
    })

    it('does not match non-AI repos', () => {
      const repo = createMockRepo()
      const result = evaluateDeveloperFilter('ai_related', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('indie_project', () => {
    it('matches small creative projects', () => {
      const repo = createMockRepo({ topics: ['indie', 'game'], stars: 500, forks: 50 })
      const enrichment = createMockEnrichment({ contributorCount: 2 })
      const result = evaluateDeveloperFilter('indie_project', repo, enrichment)
      expect(result.matches).toBe(true)
    })

    it('does not match large projects', () => {
      const repo = createMockRepo({ stars: 50000 })
      const result = evaluateDeveloperFilter('indie_project', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('new_exploding', () => {
    it('matches new repos with rapid growth', () => {
      const repo = createMockRepo({
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        growth: {
          starsToday: 100,
          starsThisWeek: 200,
          starsThisMonth: 300,
          forksGrowth: 50,
          velocity: 28.6,
          momentumScore: 85,
          trend: 'accelerating',
          trendingTopics: ['viral'],
        },
      })
      const result = evaluateDeveloperFilter('new_exploding', repo)
      expect(result.matches).toBe(true)
    })

    it('does not match old repos', () => {
      const repo = createMockRepo({
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      const result = evaluateDeveloperFilter('new_exploding', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('low_competition', () => {
    it('matches undiscovered growing repos', () => {
      const repo = createMockRepo({ stars: 200, forks: 30 })
      const result = evaluateDeveloperFilter('low_competition', repo)
      expect(result.matches).toBe(true)
    })

    it('does not match very small repos without growth', () => {
      const repo = createMockRepo({ stars: 30, forks: 5 })
      const result = evaluateDeveloperFilter('low_competition', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('enterprise_grade', () => {
    it('matches large repos with enterprise topics', () => {
      const repo = createMockRepo({
        topics: ['kubernetes', 'docker', 'cloud-native'],
        stars: 10000,
        forks: 2000,
      })
      const result = evaluateDeveloperFilter('enterprise_grade', repo)
      expect(result.matches).toBe(true)
    })

    it('does not match small repos', () => {
      const repo = createMockRepo()
      const result = evaluateDeveloperFilter('enterprise_grade', repo)
      expect(result.matches).toBe(false)
    })
  })

  describe('lightweight', () => {
    it('matches repos with lightweight topics', () => {
      const repo = createMockRepo({ topics: ['lightweight', 'minimal'] })
      const result = evaluateDeveloperFilter('lightweight', repo)
      expect(result.matches).toBe(true)
    })

    it('does not match repos without lightweight signals', () => {
      const repo = createMockRepo()
      const result = evaluateDeveloperFilter('lightweight', repo)
      expect(result.matches).toBe(false)
    })
  })
})
