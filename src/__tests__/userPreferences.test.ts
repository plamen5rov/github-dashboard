import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadPreferences,
  savePreferences,
  toggleBookmark,
  isBookmarked,
  addCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  followTopic,
  unfollowTopic,
  ignoreTopic,
  unignoreTopic,
  ignoreLanguage,
  unignoreLanguage,
  addWatchlist,
  deleteWatchlist,
} from '../lib/userPreferences'

beforeEach(() => {
  localStorage.setItem('github_dashboard_preferences', JSON.stringify({}))
  vi.stubGlobal('crypto', {
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  })
})

describe('loadPreferences', () => {
  it('returns defaults when nothing stored', () => {
    const prefs = loadPreferences()
    expect(prefs.bookmarks).toEqual([])
    expect(prefs.collections).toEqual([])
  })

  it('recovers from corrupted JSON', () => {
    localStorage.setItem('github_dashboard_preferences', '{broken')
    const prefs = loadPreferences()
    expect(prefs.bookmarks).toEqual([])
  })
})

describe('bookmarks', () => {
  it('adds a bookmark', () => {
    toggleBookmark('owner/repo', 'my note')
    expect(isBookmarked('owner/repo')).toBe(true)
    const prefs = loadPreferences()
    const bm = prefs.bookmarks.find((b) => b.fullName === 'owner/repo')
    expect(bm?.note).toBe('my note')
  })

  it('removes a bookmark on second toggle', () => {
    toggleBookmark('owner/repo')
    expect(isBookmarked('owner/repo')).toBe(true)
    toggleBookmark('owner/repo')
    expect(isBookmarked('owner/repo')).toBe(false)
  })

  it('dispatches preferences-changed on bookmark toggle', () => {
    const spy = vi.fn()
    window.addEventListener('preferences-changed', spy)
    toggleBookmark('owner/repo')
    expect(spy).toHaveBeenCalled()
    window.removeEventListener('preferences-changed', spy)
  })
})

describe('collections', () => {
  it('creates a collection', () => {
    const col = addCollection('My Favorites', 'Best repos')
    expect(col.id).toBeDefined()
    expect(col.name).toBe('My Favorites')
    expect(col.repoFullNames).toEqual([])
  })

  it('deletes a collection', () => {
    const col = addCollection('To Delete')
    deleteCollection(col.id)
    const prefs = loadPreferences()
    expect(prefs.collections.find((c) => c.id === col.id)).toBeUndefined()
  })

  it('adds a repo to a collection', () => {
    const col = addCollection('Favorites')
    addToCollection(col.id, 'owner/repo')
    const prefs = loadPreferences()
    const found = prefs.collections.find((c) => c.id === col.id)
    expect(found?.repoFullNames).toContain('owner/repo')
  })

  it('does not add duplicate repos to collection', () => {
    const col = addCollection('Favorites')
    addToCollection(col.id, 'owner/repo')
    addToCollection(col.id, 'owner/repo')
    const prefs = loadPreferences()
    const found = prefs.collections.find((c) => c.id === col.id)
    expect(found?.repoFullNames).toHaveLength(1)
  })

  it('removes a repo from collection', () => {
    const col = addCollection('Favorites')
    addToCollection(col.id, 'owner/repo')
    removeFromCollection(col.id, 'owner/repo')
    const prefs = loadPreferences()
    const found = prefs.collections.find((c) => c.id === col.id)
    expect(found?.repoFullNames).toHaveLength(0)
  })
})

describe('topics', () => {
  it('follows a topic', () => {
    followTopic('react')
    const prefs = loadPreferences()
    expect(prefs.followedTopics).toContain('react')
  })

  it('does not follow duplicate', () => {
    followTopic('react')
    followTopic('react')
    expect(loadPreferences().followedTopics).toHaveLength(1)
  })

  it('unfollows a topic', () => {
    followTopic('react')
    unfollowTopic('react')
    expect(loadPreferences().followedTopics).toHaveLength(0)
  })

  it('ignores a topic', () => {
    ignoreTopic('spam')
    expect(loadPreferences().ignoredTopics).toContain('spam')
  })

  it('unignores a topic', () => {
    ignoreTopic('spam')
    unignoreTopic('spam')
    expect(loadPreferences().ignoredTopics).toHaveLength(0)
  })

  it('ignores a language', () => {
    ignoreLanguage('Ruby')
    expect(loadPreferences().ignoredLanguages).toContain('Ruby')
  })

  it('unignores a language', () => {
    ignoreLanguage('Ruby')
    unignoreLanguage('Ruby')
    expect(loadPreferences().ignoredLanguages).toHaveLength(0)
  })

  it('does not ignore duplicate topic', () => {
    ignoreTopic('spam')
    ignoreTopic('spam')
    expect(loadPreferences().ignoredTopics).toHaveLength(1)
  })
})

describe('watchlists', () => {
  it('creates a watchlist', () => {
    const wl = addWatchlist('My Watch', ['react'], ['TypeScript'], 100, 50000)
    expect(wl.topics).toContain('react')
    expect(wl.languages).toContain('TypeScript')
    expect(wl.minStars).toBe(100)
  })

  it('deletes a watchlist', () => {
    const wl = addWatchlist('To Delete')
    deleteWatchlist(wl.id)
    expect(loadPreferences().watchlists).toHaveLength(0)
  })
})

describe('savePreferences', () => {
  it('persists and dispatches event', () => {
    const spy = vi.fn()
    window.addEventListener('preferences-changed', spy)
    savePreferences({ followedTopics: ['react', 'vue'] })
    expect(spy).toHaveBeenCalled()
    expect(loadPreferences().followedTopics).toEqual(['react', 'vue'])
    window.removeEventListener('preferences-changed', spy)
  })
})
