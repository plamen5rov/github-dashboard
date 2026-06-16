import type { ReactNode } from 'react'
import { CloseIcon } from './Icons'

interface PanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxW?: string
  maxH?: string
  footer?: ReactNode
  headerExtra?: ReactNode
}

function Panel({
  isOpen,
  onClose,
  title,
  children,
  maxW = 'max-w-4xl',
  maxH = 'max-h-[85vh]',
  footer,
  headerExtra,
}: PanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`w-full ${maxW} ${maxH} bg-github-darker border border-github-border rounded-xl shadow-2xl overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-github-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-github-text">{title}</h2>
            {headerExtra}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-github-muted hover:text-github-text focus:outline-none focus:ring-2 focus:ring-github-accent rounded"
            aria-label={`Close ${title} panel`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-github-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Panel
