import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Settings from '../pages/Settings'
import * as authStore from '../lib/authStore'
import * as github from '../lib/github'

function renderSettings() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('Settings token handling', () => {
  it('validates and saves a token through the auth store', async () => {
    const validateSpy = vi.spyOn(github, 'validateToken').mockResolvedValue({ ok: true })
    const setTokenSpy = vi.spyOn(authStore, 'setGitHubToken').mockImplementation(() => {})

    renderSettings()
    await userEvent.type(screen.getByLabelText(/personal access token/i), 'ghp_testtoken')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(validateSpy).toHaveBeenCalledWith('ghp_testtoken'))
    expect(setTokenSpy).toHaveBeenCalledWith('ghp_testtoken')
    expect(await screen.findByText(/token saved successfully/i)).toBeInTheDocument()
  })

  it('shows an error and does not store an invalid token', async () => {
    vi.spyOn(github, 'validateToken').mockResolvedValue({ ok: false, status: 401 })
    const setTokenSpy = vi.spyOn(authStore, 'setGitHubToken')

    renderSettings()
    await userEvent.type(screen.getByLabelText(/personal access token/i), 'ghp_badtoken')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid token/i)
    expect(setTokenSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('github_token')).toBeNull()
  })

  it('clears a saved token when submitting an empty value', async () => {
    localStorage.setItem('github_token', 'ghp_old')
    const clearSpy = vi.spyOn(authStore, 'clearGitHubToken').mockImplementation(() => {})

    renderSettings()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(clearSpy).toHaveBeenCalled()
    expect(await screen.findByText(/token saved successfully/i)).toBeInTheDocument()
  })
})
