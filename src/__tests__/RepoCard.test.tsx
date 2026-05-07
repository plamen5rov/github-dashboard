import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RepoCard from '../components/RepoCard'
import type { Repository } from '../types/github'

const mockRepo: Repository = {
  id: 1,
  name: 'test-repo',
  fullName: 'owner/test-repo',
  description: 'A test repository for demonstration',
  htmlUrl: 'https://github.com/owner/test-repo',
  owner: { login: 'owner', avatarUrl: 'https://example.com/avatar.png' },
  stars: 1500,
  forks: 150,
  openIssues: 10,
  openPRs: 5,
  pushedAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  language: 'TypeScript',
  languageColor: '#3178c6',
  license: { spdxId: 'MIT', name: 'MIT License' },
  topics: ['react', 'typescript', 'demo'],
  archived: false,
  isFork: false,
}

describe('RepoCard', () => {
  it('renders repo name and full name', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('owner/test-repo')).toBeInTheDocument()
  })

  it('renders repo description', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('A test repository for demonstration')).toBeInTheDocument()
  })

  it('renders language badge', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders open source license badge', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('Open Source')).toBeInTheDocument()
  })

  it('renders star count', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('1.5k')).toBeInTheDocument()
  })

  it('renders fork count', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    const forks = screen.getByText('150')
    expect(forks).toBeInTheDocument()
  })

  it('renders topic chips', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('demo')).toBeInTheDocument()
  })

  it('calls onTopicClick when topic is clicked', () => {
    const handleClick = vi.fn()
    render(<RepoCard repo={mockRepo} onTopicClick={handleClick} />)
    screen.getByText('react').click()
    expect(handleClick).toHaveBeenCalledWith('react')
  })

  it('renders link to GitHub repo', () => {
    render(<RepoCard repo={mockRepo} onTopicClick={vi.fn()} />)
    const link = screen.getByRole('link', { name: /owner\/test-repo/i })
    expect(link).toHaveAttribute('href', 'https://github.com/owner/test-repo')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders no license badge when license is null', () => {
    const repoWithoutLicense = { ...mockRepo, license: null }
    render(<RepoCard repo={repoWithoutLicense} onTopicClick={vi.fn()} />)
    expect(screen.getByText('No License')).toBeInTheDocument()
  })
})
