import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 text-github-muted mb-4 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-github-muted mb-2">{title}</p>
      {description && <p className="text-xs text-github-muted">{description}</p>}
    </div>
  )
}

export default EmptyState
