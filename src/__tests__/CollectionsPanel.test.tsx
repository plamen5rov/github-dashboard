import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CollectionsPanel from '../components/CollectionsPanel'
import { reloadPreferences } from '../lib/userPreferences'

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <CollectionsPanel isOpen onClose={vi.fn()} onTopicClick={vi.fn()} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'github_dashboard_preferences',
    JSON.stringify({
      followedTopics: [],
      ignoredTopics: [],
      ignoredLanguages: [],
      bookmarks: [],
      collections: [
        {
          id: 'c1',
          name: 'My Collection',
          repoFullNames: ['owner/test-repo'],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }),
  )
  reloadPreferences()
})

describe('CollectionsPanel structure', () => {
  it('does not nest the delete button inside another button', () => {
    renderPanel()
    const deleteButton = screen.getByRole('button', { name: /delete collection my collection/i })
    expect(deleteButton.parentElement?.closest('button')).toBeNull()
  })

  it('keeps the expand toggle and delete as sibling controls', () => {
    renderPanel()
    const deleteButton = screen.getByRole('button', { name: /delete collection my collection/i })
    const toggle = deleteButton.parentElement!.parentElement!.querySelector('button')
    expect(toggle).not.toBeNull()
    expect(toggle).not.toBe(deleteButton)
  })
})
