import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { SunIcon, MoonIcon } from '../components/Icons'

function Settings() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const stored = localStorage.getItem('github_token')
    if (stored) setToken(stored)
  }, [])

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('github_token', token.trim())
    } else {
      localStorage.removeItem('github_token')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-github-dark/95 backdrop-blur-sm border-b border-github-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
            aria-label="Back to home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-github-text">Settings</h1>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">GitHub Personal Access Token</h2>
          <p className="text-sm text-github-muted">
            Add a PAT to increase your API rate limit from 60 to 5,000 requests per hour
            (Core API), and from 10 to 30 requests per minute (Search API).
            Generate one at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-github-accent hover:underline"
            >
              github.com/settings/tokens
            </a>
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-4 py-2 bg-github-dark border border-github-border rounded-lg text-github-text placeholder-github-muted focus:outline-none focus:ring-2 focus:ring-github-accent"
              aria-label="GitHub Personal Access Token"
            />
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-github-green text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            >
              Save
            </button>
          </div>
          {saved && (
            <p className="text-sm text-green-400">Token saved successfully!</p>
          )}
        </section>

        <section className="p-6 bg-github-darker border border-github-border rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-github-text">About Rate Limits</h2>
          <div className="space-y-2 text-sm text-github-muted">
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>Unauthenticated</span>
              <span className="text-github-text">60 requests/hour</span>
            </div>
            <div className="flex justify-between py-2 border-b border-github-border">
              <span>With Personal Access Token</span>
              <span className="text-github-text">5,000 requests/hour</span>
            </div>
            <div className="flex justify-between py-2">
              <span>With GitHub App</span>
              <span className="text-github-text">15,000 requests/hour</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Settings
