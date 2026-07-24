import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-github-dark p-4">
          <div className="max-w-md text-center space-y-4">
            <div className="text-4xl font-bold text-github-accent">!</div>
            <h1 className="text-xl font-semibold text-github-text">Something went wrong</h1>
            <p className="text-sm text-github-muted">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/80 focus:outline-none focus:ring-2 focus:ring-github-accent text-sm font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
