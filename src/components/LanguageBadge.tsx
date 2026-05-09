interface LanguageBadgeProps {
  language: string | null
  color: string | null
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Nim: '#ffc200',
  OCaml: '#3be133',
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
