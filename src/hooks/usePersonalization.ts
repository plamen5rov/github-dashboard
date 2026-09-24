import { useSyncExternalStore } from 'react'
import type { Collection } from '../types/github'
import {
  getPreferencesSnapshot,
  subscribePreferences,
  toggleBookmark,
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
} from '../lib/userPreferences'

export function usePersonalization() {
  const prefs = useSyncExternalStore(subscribePreferences, getPreferencesSnapshot)

  return {
    prefs,
    toggleBookmark,
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
  }
}

export function useBookmarked(fullName: string): boolean {
  return useSyncExternalStore(
    subscribePreferences,
    () => getPreferencesSnapshot().bookmarks.some((b) => b.fullName === fullName),
  )
}

export function useIsInAnyCollection(fullName: string): boolean {
  return useSyncExternalStore(
    subscribePreferences,
    () => getPreferencesSnapshot().collections.some((c) => c.repoFullNames.includes(fullName)),
  )
}

export function useCollections(): Collection[] {
  return useSyncExternalStore(
    subscribePreferences,
    () => getPreferencesSnapshot().collections,
  )
}
