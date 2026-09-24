import { useSyncExternalStore } from 'react'
import { subscribeAuth, getAuthRevision } from '../lib/authStore'

function getServerSnapshot(): number {
  return 0
}

export function useAuthRevision(): number {
  return useSyncExternalStore(subscribeAuth, getAuthRevision, getServerSnapshot)
}
