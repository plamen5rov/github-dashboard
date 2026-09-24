import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RepoGrid from '../components/RepoGrid'
import type { Repository } from '../types/github'

function makeRepo(id: number): Repository {
  return {
    id,
    name: `repo-${id}`,
    fullName: `owner/repo-${id}`,
    description: null,
    htmlUrl: `https://github.com/owner/repo-${id}`,
    owner: { login: 'owner', avatarUrl: 'https://example.com/a.png' },
    stars: 100,
    forks: 10,
    openIssues: 1,
    openPRs: 0,
    pushedAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    language: 'TypeScript',
    languageColor: null,
    license: null,
    topics: [],
    archived: false,
    isFork: false,
  }
}

const baseProps = {
  isLoading: false,
  isFetchingNextPage: false,
  emptyPageStreak: 0,
  onTopicClick: vi.fn(),
  fetchNextPage: vi.fn(),
}

describe('RepoGrid pagination states', () => {
  it('shows the plain empty state when there are no results and no more pages', () => {
    render(<RepoGrid {...baseProps} repos={[]} hasNextPage={false} fetchNextPage={vi.fn()} />)
    expect(screen.getByText('No repositories found')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /search more/i })).not.toBeInTheDocument()
  })

  it('offers an explicit search-more action when a page was fully filtered out', () => {
    const fetchNextPage = vi.fn()
    render(
      <RepoGrid {...baseProps} repos={[]} hasNextPage emptyPageStreak={1} fetchNextPage={fetchNextPage} />,
    )
    const button = screen.getByRole('button', { name: /search more repositories/i })
    button.click()
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('shows the loading skeleton while the initial page loads', () => {
    render(<RepoGrid {...baseProps} repos={[]} hasNextPage={false} isLoading />)
    expect(screen.queryByText('No repositories found')).not.toBeInTheDocument()
  })

  it('switches from automatic fetching to a manual load-more after repeated empty pages', () => {
    const fetchNextPage = vi.fn()
    render(
      <RepoGrid
        {...baseProps}
        repos={[makeRepo(1)]}
        hasNextPage
        emptyPageStreak={3}
        fetchNextPage={fetchNextPage}
      />,
    )
    const button = screen.getByRole('button', { name: /load more repositories/i })
    button.click()
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('renders repository cards', () => {
    render(<RepoGrid {...baseProps} repos={[makeRepo(1)]} hasNextPage={false} />)
    expect(screen.getByText('owner/repo-1')).toBeInTheDocument()
  })
})
