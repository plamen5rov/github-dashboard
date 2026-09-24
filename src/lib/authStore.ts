const TOKEN_KEY = 'github_token'

let revision = 0
const listeners = new Set<() => void>()

function notify() {
  revision += 1
  listeners.forEach((listener) => listener())
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function getAuthRevision(): number {
  return revision
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setGitHubToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  notify()
}

export function clearGitHubToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === TOKEN_KEY) {
      notify()
    }
  })
}
