'use client'

import { useState } from 'react'
import type { ReportFinding } from '@/lib/types'

interface FindingCardProps {
  finding: ReportFinding
}

const severityStyles: Record<string, { border: string; badge: string; label: string }> = {
  critical: { border: 'border-red-400', badge: 'bg-red-100 text-red-800', label: 'Critical' },
  high: { border: 'border-orange-400', badge: 'bg-orange-100 text-orange-800', label: 'High' },
  medium: { border: 'border-amber-400', badge: 'bg-amber-100 text-amber-800', label: 'Medium' },
  low: { border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-800', label: 'Low' },
  info: { border: 'border-blue-400', badge: 'bg-blue-100 text-blue-800', label: 'Info' },
}

export default function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const s = severityStyles[finding.severity] || severityStyles.info

  return (
    <div className={`border-l-4 ${s.border} bg-white rounded-lg shadow-sm overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
              {s.label}
            </span>
            <span className="text-xs text-gray-400">{finding.category}</span>
          </div>
          <h3 className="font-semibold text-sm text-gray-900">{finding.title}</h3>
        </div>
        <span className="text-gray-400 mt-1 shrink-0">
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">{finding.plainEnglish}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Technical Detail</h4>
            <p className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">{finding.technicalDetail}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommended Action</h4>
            <p className="text-sm text-gray-700">{finding.recommendedAction}</p>
          </div>
        </div>
      )}
    </div>
  )
}
