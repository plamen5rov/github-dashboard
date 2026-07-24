const colorMap = {
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
} as const

type BadgeColor = keyof typeof colorMap

interface BadgeCountProps {
  count: number
  color: BadgeColor
}

function BadgeCount({ count, color }: BadgeCountProps) {
  if (count <= 0) return null

  return (
    <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 ${colorMap[color]} rounded-full text-white text-xs flex items-center justify-center font-medium`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

export default BadgeCount
