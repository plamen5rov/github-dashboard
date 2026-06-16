import { useState, useCallback, useEffect } from 'react'
import type { UserPreferences } from '../types/github'
import {
  loadPreferences,
  toggleBookmark as toggleBookmarkFn,
  isBookmarked as isBookmarkedFn,
  addCollection as addCollectionFn,
  deleteCollection as deleteCollectionFn,
  addToCollection as addToCollectionFn,
  removeFromCollection as removeFromCollectionFn,
  addWatchlist as addWatchlistFn,
  deleteWatchlist as deleteWatchlistFn,
  followTopic as followTopicFn,
  unfollowTopic as unfollowTopicFn,
  ignoreTopic as ignoreTopicFn,
  unignoreTopic as unignoreTopicFn,
  ignoreLanguage as ignoreLanguageFn,
  unignoreLanguage as unignoreLanguageFn,
} from '../lib/userPreferences'

export function usePersonalization() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences)

  useEffect(() => {
    const handleSync = () => setPrefs(loadPreferences())
    window.addEventListener('storage', handleSync)
    window.addEventListener('preferences-changed', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('preferences-changed', handleSync)
    }
  }, [])

  const refresh = useCallback(() => setPrefs(loadPreferences()), [])

  const toggleBookmark = useCallback((fullName: string, note?: string) => {
    return toggleBookmarkFn(fullName, note)
  }, [])

  const isBookmarked = useCallback((fullName: string) => isBookmarkedFn(fullName), [])

  const addCollection = useCallback((name: string, description?: string) => {
    return addCollectionFn(name, description)
  }, [])

  const deleteCollection = useCallback((id: string) => {
    deleteCollectionFn(id)
  }, [])

  const addToCollection = useCallback((collectionId: string, repoFullName: string) => {
    addToCollectionFn(collectionId, repoFullName)
  }, [])

  const removeFromCollection = useCallback((collectionId: string, repoFullName: string) => {
    removeFromCollectionFn(collectionId, repoFullName)
  }, [])

  const addWatchlist = useCallback((name: string, topics: string[] = [], languages: string[] = [], minStars = 0, maxStars = 100000) => {
    return addWatchlistFn(name, topics, languages, minStars, maxStars)
  }, [])

  const deleteWatchlist = useCallback((id: string) => {
    deleteWatchlistFn(id)
  }, [])

  const followTopic = useCallback((topic: string) => {
    followTopicFn(topic)
  }, [])

  const unfollowTopic = useCallback((topic: string) => {
    unfollowTopicFn(topic)
  }, [])

  const ignoreTopic = useCallback((topic: string) => {
    ignoreTopicFn(topic)
  }, [])

  const unignoreTopic = useCallback((topic: string) => {
    unignoreTopicFn(topic)
  }, [])

  const ignoreLanguage = useCallback((language: string) => {
    ignoreLanguageFn(language)
  }, [])

  const unignoreLanguage = useCallback((language: string) => {
    unignoreLanguageFn(language)
  }, [])

  return {
    prefs,
    refresh,
    toggleBookmark,
    isBookmarked,
    addCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    addWatchlist,
    deleteWatchlist,
    followTopic,
    unfollowTopic,
    ignoreTopic,
    unignoreTopic,
    ignoreLanguage,
    unignoreLanguage,
  }
}
