import type { UserPreferences, Bookmark, Collection, Watchlist, TrendAlert } from '../types/github'

const STORAGE_KEY = 'github_dashboard_preferences'

const DEFAULT_PREFERENCES: UserPreferences = {
  followedTopics: [],
  ignoredTopics: [],
  ignoredLanguages: [],
  bookmarks: [],
  collections: [],
  watchlists: [],
  alerts: [],
  alertThreshold: 50,
}

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_PREFERENCES }
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_PREFERENCES, ...parsed }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('preferences-changed'))
  return updated
}

export function isBookmarked(fullName: string): boolean {
  const prefs = loadPreferences()
  return prefs.bookmarks.some((b) => b.fullName === fullName)
}

export function toggleBookmark(fullName: string, note?: string): UserPreferences {
  const prefs = loadPreferences()
  const exists = prefs.bookmarks.findIndex((b) => b.fullName === fullName)

  if (exists >= 0) {
    prefs.bookmarks.splice(exists, 1)
  } else {
    prefs.bookmarks.push({ fullName, addedAt: new Date().toISOString(), note })
  }

  return savePreferences({ bookmarks: prefs.bookmarks })
}

export function addCollection(name: string, description?: string): Collection {
  const prefs = loadPreferences()
  const collection: Collection = {
    id: crypto.randomUUID(),
    name,
    description,
    repoFullNames: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  prefs.collections.push(collection)
  savePreferences({ collections: prefs.collections })
  return collection
}

export function deleteCollection(id: string): void {
  const prefs = loadPreferences()
  prefs.collections = prefs.collections.filter((c) => c.id !== id)
  savePreferences({ collections: prefs.collections })
}

export function addToCollection(collectionId: string, repoFullName: string): void {
  const prefs = loadPreferences()
  const collection = prefs.collections.find((c) => c.id === collectionId)
  if (collection && !collection.repoFullNames.includes(repoFullName)) {
    collection.repoFullNames.push(repoFullName)
    collection.updatedAt = new Date().toISOString()
    savePreferences({ collections: prefs.collections })
  }
}

export function removeFromCollection(collectionId: string, repoFullName: string): void {
  const prefs = loadPreferences()
  const collection = prefs.collections.find((c) => c.id === collectionId)
  if (collection) {
    collection.repoFullNames = collection.repoFullNames.filter((f) => f !== repoFullName)
    collection.updatedAt = new Date().toISOString()
    savePreferences({ collections: prefs.collections })
  }
}

export function addWatchlist(name: string, topics: string[] = [], languages: string[] = [], minStars = 0, maxStars = 100000): Watchlist {
  const prefs = loadPreferences()
  const watchlist: Watchlist = {
    id: crypto.randomUUID(),
    name,
    topics,
    languages,
    minStars,
    maxStars,
    createdAt: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    newMatches: [],
  }
  prefs.watchlists.push(watchlist)
  savePreferences({ watchlists: prefs.watchlists })
  return watchlist
}

export function deleteWatchlist(id: string): void {
  const prefs = loadPreferences()
  prefs.watchlists = prefs.watchlists.filter((w) => w.id !== id)
  savePreferences({ watchlists: prefs.watchlists })
}

export function followTopic(topic: string): void {
  const prefs = loadPreferences()
  if (!prefs.followedTopics.includes(topic)) {
    prefs.followedTopics.push(topic)
    savePreferences({ followedTopics: prefs.followedTopics })
  }
}

export function unfollowTopic(topic: string): void {
  const prefs = loadPreferences()
  prefs.followedTopics = prefs.followedTopics.filter((t) => t !== topic)
  savePreferences({ followedTopics: prefs.followedTopics })
}

export function ignoreTopic(topic: string): void {
  const prefs = loadPreferences()
  if (!prefs.ignoredTopics.includes(topic)) {
    prefs.ignoredTopics.push(topic)
    savePreferences({ ignoredTopics: prefs.ignoredTopics })
  }
}

export function unignoreTopic(topic: string): void {
  const prefs = loadPreferences()
  prefs.ignoredTopics = prefs.ignoredTopics.filter((t) => t !== topic)
  savePreferences({ ignoredTopics: prefs.ignoredTopics })
}

export function ignoreLanguage(language: string): void {
  const prefs = loadPreferences()
  if (!prefs.ignoredLanguages.includes(language)) {
    prefs.ignoredLanguages.push(language)
    savePreferences({ ignoredLanguages: prefs.ignoredLanguages })
  }
}

export function unignoreLanguage(language: string): void {
  const prefs = loadPreferences()
  prefs.ignoredLanguages = prefs.ignoredLanguages.filter((l) => l !== language)
  savePreferences({ ignoredLanguages: prefs.ignoredLanguages })
}

export function addAlert(alert: Omit<TrendAlert, 'id' | 'timestamp' | 'read'>): TrendAlert {
  const prefs = loadPreferences()
  const newAlert: TrendAlert = {
    ...alert,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  }
  prefs.alerts.unshift(newAlert)
  if (prefs.alerts.length > 50) {
    prefs.alerts = prefs.alerts.slice(0, 50)
  }
  savePreferences({ alerts: prefs.alerts })
  return newAlert
}

export function markAlertRead(id: string): void {
  const prefs = loadPreferences()
  const alert = prefs.alerts.find((a) => a.id === id)
  if (alert) {
    alert.read = true
    savePreferences({ alerts: prefs.alerts })
  }
}

export function markAllAlertsRead(): void {
  const prefs = loadPreferences()
  prefs.alerts.forEach((a) => (a.read = true))
  savePreferences({ alerts: prefs.alerts })
}

export function clearReadAlerts(): void {
  const prefs = loadPreferences()
  prefs.alerts = prefs.alerts.filter((a) => !a.read)
  savePreferences({ alerts: prefs.alerts })
}

export function getUnreadAlertCount(): number {
  const prefs = loadPreferences()
  return prefs.alerts.filter((a) => !a.read).length
}
