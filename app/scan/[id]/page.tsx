'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import GradeBadge from '@/components/GradeBadge'
import FindingCard from '@/components/FindingCard'
import ExecutiveSummary from '@/components/ExecutiveSummary'
import type { ScanResult } from '@/lib/types'

export default function ScanResultPage() {
  const params = useParams()
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = params.id
    if (!id) return

    async function poll() {
      let attempts = 0
      const maxAttempts = 30

      while (attempts < maxAttempts) {
        try {
          const res = await fetch(`/api/scan?id=${id}`)
          if (res.ok) {
            const data = await res.json()
            setResult(data)
            setLoading(false)
            return
          }
        } catch {
          // continue polling
        }
        attempts++
        await new Promise((r) => setTimeout(r, 1000))
      }
      setError('Scan did not complete in time. Please try again.')
      setLoading(false)
    }

    poll()
  }, [params.id])

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Waiting for scan results...</p>
        </div>
      </main>
    )
  }

  if (error || !result) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-3">{error || 'Report not found'}</p>
          <Link href="/" className="text-indigo-600 text-sm font-semibold hover:underline">
            Back to ScanV
          </Link>
        </div>
      </main>
    )
  }

  const grade = result.report.grade
  const score = result.report.score
  const trafficLight = result.report.trafficLight

  return (
    <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700">
          &larr; Back to ScanV
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{result.target}</h1>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span>Port scan: {result.portMode}</span>
            <span>&middot;</span>
            <span>{new Date(result.timestamp).toLocaleString()}</span>
            {result.fileHash && (
              <>
                <span>&middot;</span>
                <span className="font-mono">Hash: {result.fileHash.slice(0, 12)}...</span>
              </>
            )}
          </div>
        </div>
        <GradeBadge grade={grade} score={score} trafficLight={trafficLight} />
      </div>

      <ExecutiveSummary summary={result.report.executiveSummary} />

      {result.portScan.partial && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
          Port scan was partially incomplete due to time limits. Some ports may not have been checked. Switch to Quick mode for faster results.
        </div>
      )}

      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Findings ({result.report.findings.length})
        </h2>
        {result.report.findings.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-6 text-center">
            <p className="text-green-700 font-semibold">No issues found</p>
            <p className="text-green-600 text-sm mt-1">Everything looks good for this target.</p>
          </div>
        ) : (
          result.report.findings.map((f, i) => (
            <FindingCard key={i} finding={f} />
          ))
        )}
      </div>

      {result.portScan.findings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Port Scan Details
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Port</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Service</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.portScan.findings.map((f) => (
                  <tr key={f.port} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 font-mono text-gray-900">{f.port}</td>
                    <td className="px-4 py-2 text-gray-700">{f.service}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Open
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 py-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          Report ID: {result.id} &middot; All scan data is temporary and stored in memory
        </p>
      </div>
    </main>
  )
}
