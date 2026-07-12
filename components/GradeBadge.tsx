interface GradeBadgeProps {
  grade: string
  score: number
  trafficLight: 'green' | 'amber' | 'red'
}

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  green: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', dot: 'bg-green-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-500' },
}

const gradeDescriptions: Record<string, string> = {
  A: 'Low Risk',
  B: 'Minor Issues',
  C: 'Moderate Risk',
  D: 'Significant Risk',
  F: 'Critical Risk',
}

export default function GradeBadge({ grade, score, trafficLight }: GradeBadgeProps) {
  const c = colorMap[trafficLight]

  return (
    <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${c.border} ${c.bg}`}>
      <div className="flex flex-col items-center">
        <span className={`text-5xl font-bold leading-none ${c.text}`}>{grade}</span>
        <span className={`text-xs font-medium ${c.text} mt-1`}>{score}/100</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${c.dot}`} />
          <span className={`font-semibold text-sm ${c.text}`}>
            {gradeDescriptions[grade] || 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-gray-500 mt-0.5">Security Score</span>
      </div>
    </div>
  )
}
