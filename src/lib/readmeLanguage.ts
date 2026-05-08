const COMMON_ENGLISH_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'are', 'was', 'been', 'were',
  'has', 'had', 'does', 'did', 'done', 'being', 'using', 'used', 'getting',
  'support', 'simple', 'fast', 'easy', 'build', 'built', 'create',
  'manage', 'library', 'tool', 'framework', 'application', 'project',
  'install', 'usage', 'example', 'documentation', 'license', 'contribute',
  'features', 'getting', 'started', 'quick', 'start', 'guide', 'api',
  'code', 'test', 'run', 'based', 'written', 'developed', 'designed',
  'lightweight', 'real', 'time', 'open', 'source', 'high', 'performance',
  'available', 'default', 'configuration', 'setup', 'config', 'option',
  'module', 'package', 'dependency', 'version', 'release', 'update',
  'function', 'method', 'class', 'object', 'value', 'type', 'string',
  'number', 'array', 'list', 'set', 'map', 'file', 'directory', 'path',
  'status', 'error', 'message', 'response', 'request', 'data', 'model',
  'view', 'control', 'route', 'endpoint', 'server', 'client', 'browser',
  'node', 'script', 'command', 'line', 'interface', 'user', 'input',
  'output', 'process', 'handle', 'return', 'callback', 'async', 'await',
  'import', 'export', 'default', 'const', 'let', 'var', 'function',
  'page', 'component', 'style', 'theme', 'color', 'dark', 'light',
  'mode', 'toggle', 'filter', 'sort', 'search', 'list', 'grid', 'card',
  'item', 'select', 'choose', 'add', 'remove', 'edit', 'save', 'delete',
  'link', 'url', 'href', 'src', 'image', 'icon', 'button', 'form',
  'field', 'label', 'text', 'area', 'checkbox', 'radio', 'dropdown',
  'menu', 'navigation', 'header', 'footer', 'content', 'main', 'section',
  'container', 'wrapper', 'flex', 'grid', 'row', 'column', 'padding',
  'margin', 'border', 'shadow', 'radius', 'size', 'width', 'height',
  'min', 'max', 'auto', 'block', 'inline', 'table', 'position',
  'relative', 'absolute', 'fixed', 'sticky', 'z', 'index', 'overflow',
  'scroll', 'visible', 'hidden', 'opacity', 'transform', 'transition',
  'animation', 'keyframe', 'media', 'query', 'breakpoint', 'responsive',
  'hello', 'world', 'example', 'demo', 'tutorial', 'guide', 'learn',
  'overview', 'introduction', 'description', 'summary', 'details',
  'welcome', 'contributing', 'changelog', 'roadmap', 'faq', 'help',
  'thanks', 'credit', 'acknowledgements', 'references', 'resources',
])

export function detectReadmeLanguage(text: string): 'english' | 'other' {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*_~\[\]()>|\\]/g, ' ')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  const words = cleaned.split(/\s+/).filter((w) => w.length > 1)
  const nonAlphabetic = cleaned.replace(/[a-z\s]/g, '').length
  const totalChars = cleaned.length || 1
  const alphaRatio = 1 - nonAlphabetic / totalChars

  if (words.length === 0) return 'other'

  const englishWordCount = words.filter((w) => COMMON_ENGLISH_WORDS.has(w)).length
  const englishRatio = englishWordCount / words.length

  if (alphaRatio > 0.85 && englishRatio > 0.02) return 'english'
  if (alphaRatio > 0.60 && englishRatio > 0.05) return 'english'

  return 'other'
}
