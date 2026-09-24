import { LANGUAGE_COLORS } from '../lib/languageColors'

interface LanguageBadgeProps {
  language: string | null
  color: string | null
}

function LanguageBadge({ language, color }: LanguageBadgeProps) {
  if (!language) return null

  const dotColor = color || LANGUAGE_COLORS[language] || '#8b949e'

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-github-muted">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      {language}
    </span>
  )
}

export default LanguageBadge
