import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Panel from '../components/Panel'

describe('Panel accessibility', () => {
  it('exposes dialog semantics with an accessible name', () => {
    render(
      <Panel isOpen onClose={vi.fn()} title="Bookmarks">
        <p>content</p>
      </Panel>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Bookmarks')
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(
      <Panel isOpen onClose={onClose} title="Collections">
        <p>content</p>
      </Panel>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on Escape when already closed', async () => {
    const onClose = vi.fn()
    render(
      <Panel isOpen={false} onClose={onClose} title="Collections">
        <p>content</p>
      </Panel>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('moves focus into the dialog when opened', async () => {
    render(
      <Panel isOpen onClose={vi.fn()} title="Ignore List">
        <p>content</p>
      </Panel>,
    )
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })
})
