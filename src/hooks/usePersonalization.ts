import { useState, useCallback, useEffect } from 'react'
import type { UserPreferences, Collection, Watchlist, TrendAlert } from '../types/github'
import {
  loadPreferences,
  savePreferences,
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
  addAlert as addAlertFn,
  markAlertRead as markAlertReadFn,
  markAllAlertsRead as markAllAlertsReadFn,
  clearReadAlerts as clearReadAlertsFn,
  getUnreadAlertCount as getUnreadAlertCountFn,
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
    const updated = toggleBookmarkFn(fullName, note)
    setPrefs(updated)
    return updated
  }, [])

  const isBookmarked = useCallback((fullName: string) => isBookmarkedFn(fullName), [])

  const addCollection = useCallback((name: string, description?: string) => {
    const collection = addCollectionFn(name, description)
    setPrefs(loadPreferences())
    return collection
  }, [])

  const deleteCollection = useCallback((id: string) => {
    deleteCollectionFn(id)
    setPrefs(loadPreferences())
  }, [])

  const addToCollection = useCallback((collectionId: string, repoFullName: string) => {
    addToCollectionFn(collectionId, repoFullName)
    setPrefs(loadPreferences())
  }, [])

  const removeFromCollection = useCallback((collectionId: string, repoFullName: string) => {
    removeFromCollectionFn(collectionId, repoFullName)
    setPrefs(loadPreferences())
  }, [])

  const addWatchlist = useCallback((name: string, topics: string[] = [], languages: string[] = [], minStars = 0, maxStars = 100000) => {
    const watchlist = addWatchlistFn(name, topics, languages, minStars, maxStars)
    setPrefs(loadPreferences())
    return watchlist
  }, [])

  const deleteWatchlist = useCallback((id: string) => {
    deleteWatchlistFn(id)
    setPrefs(loadPreferences())
  }, [])

  const followTopic = useCallback((topic: string) => {
    followTopicFn(topic)
    setPrefs(loadPreferences())
  }, [])

  const unfollowTopic = useCallback((topic: string) => {
    unfollowTopicFn(topic)
    setPrefs(loadPreferences())
  }, [])

  const ignoreTopic = useCallback((topic: string) => {
    ignoreTopicFn(topic)
    setPrefs(loadPreferences())
  }, [])

  const unignoreTopic = useCallback((topic: string) => {
    unignoreTopicFn(topic)
    setPrefs(loadPreferences())
  }, [])

  const ignoreLanguage = useCallback((language: string) => {
    ignoreLanguageFn(language)
    setPrefs(loadPreferences())
  }, [])

  const unignoreLanguage = useCallback((language: string) => {
    unignoreLanguageFn(language)
    setPrefs(loadPreferences())
  }, [])

  const addAlert = useCallback((alert: Omit<TrendAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert = addAlertFn(alert)
    setPrefs(loadPreferences())
    return newAlert
  }, [])

  const markAlertRead = useCallback((id: string) => {
    markAlertReadFn(id)
    setPrefs(loadPreferences())
  }, [])

  const markAllAlertsRead = useCallback(() => {
    markAllAlertsReadFn()
    setPrefs(loadPreferences())
  }, [])

  const clearReadAlerts = useCallback(() => {
    clearReadAlertsFn()
    setPrefs(loadPreferences())
  }, [])

  const unreadAlertCount = getUnreadAlertCountFn()

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
    addAlert,
    markAlertRead,
    markAllAlertsRead,
    clearReadAlerts,
    unreadAlertCount,
  }
}
