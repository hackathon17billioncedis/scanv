interface ExecutiveSummaryProps {
  summary: string
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider mb-2">
        Executive Summary
      </h2>
      <p className="text-sm text-indigo-900 leading-relaxed">{summary}</p>
    </div>
  )
}
