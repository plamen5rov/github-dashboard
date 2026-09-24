import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getToken,
  getAuthRevision,
  subscribeAuth,
  setGitHubToken,
  clearGitHubToken,
} from '../lib/authStore'

beforeEach(() => {
  localStorage.removeItem('github_token')
})

describe('authStore', () => {
  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
  })

  it('stores and reads back a token', () => {
    setGitHubToken('ghp_test123')
    expect(getToken()).toBe('ghp_test123')
    expect(localStorage.getItem('github_token')).toBe('ghp_test123')
  })

  it('removes the token on clear', () => {
    setGitHubToken('ghp_test123')
    clearGitHubToken()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem('github_token')).toBeNull()
  })

  it('increments the revision when the token changes', () => {
    const before = getAuthRevision()
    setGitHubToken('ghp_test123')
    expect(getAuthRevision()).toBe(before + 1)
    clearGitHubToken()
    expect(getAuthRevision()).toBe(before + 2)
  })

  it('notifies subscribers on token change', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeAuth(listener)
    setGitHubToken('ghp_test123')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    clearGitHubToken()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('increments the revision on cross-tab storage events for the token key', () => {
    const before = getAuthRevision()
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'github_token', newValue: 'ghp_other' }),
    )
    expect(getAuthRevision()).toBe(before + 1)
  })

  it('ignores storage events for other keys', () => {
    const before = getAuthRevision()
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'unrelated', newValue: 'x' }),
    )
    expect(getAuthRevision()).toBe(before)
  })
})
