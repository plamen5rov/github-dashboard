import { useState, useEffect, useRef } from 'react'
import { LICENSE_LEGEND, CATEGORY_LABELS, CATEGORY_COLORS } from '../lib/licenseLegend'
import type { LicenseInfo } from '../lib/licenseLegend'

function LicenseLegend() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const grouped = LICENSE_LEGEND.reduce<Record<string, LicenseInfo[]>>(
    (acc, license) => {
      const cat = license.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(license)
      return acc
    },
    {},
  )

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-github-muted hover:text-github-accent focus:outline-none focus:ring-2 focus:ring-github-accent rounded transition-colors"
        aria-label="License legend"
        aria-expanded={isOpen}
        title="License guide"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 left-0 mt-2 w-80 bg-github-dark border border-github-border rounded-xl shadow-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold text-github-text mb-3">
            Open Source License Guide
          </h3>

          {Object.entries(grouped).map(([category, licenses]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h4
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${CATEGORY_COLORS[category as LicenseInfo['category']]}`}
              >
                {CATEGORY_LABELS[category as LicenseInfo['category']]}
              </h4>
              <ul className="space-y-2">
                {licenses.map((license) => (
                  <li key={license.spdxId}>
                    <span className="text-sm font-medium text-github-text">
                      {license.spdxId}
                    </span>
                    <p className="text-xs text-github-muted mt-0.5">
                      {license.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-4 pt-3 border-t border-github-border">
            <p className="text-xs text-github-muted">
              <span className="text-github-text font-medium">No License</span> — All rights
              reserved by the author. You may not use, modify, or distribute.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseLegend
