'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [target, setTarget] = useState('')
  const [portMode, setPortMode] = useState<'quick' | 'deep'>('quick')
  const [fileHash, setFileHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus('Submitting scan target...')

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          portMode,
          fileHash: fileHash.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      router.push(`/scan/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
      setStatus('')
    }
  }

  const isValidUrl = target.includes('.') || target.includes('://')

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-bold mb-4">
            SV
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ScanV</h1>
          <p className="text-sm text-gray-500">
            Vulnerability scanner with understandable security reports for everyone
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
              URL or Domain
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. example.com or https://example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="portMode" className="block text-sm font-medium text-gray-700 mb-1">
                Port Scan Depth
              </label>
              <select
                id="portMode"
                value={portMode}
                onChange={(e) => setPortMode(e.target.value as 'quick' | 'deep')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                disabled={loading}
              >
                <option value="quick">Quick (20 common ports)</option>
                <option value="deep">Deep (~250 ports)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="fileHash" className="block text-sm font-medium text-gray-700 mb-1">
              File Hash (optional)
            </label>
            <input
              id="fileHash"
              type="text"
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              placeholder="e.g. SHA256 hash of a file"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValidUrl}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {status || 'Scanning...'}
              </span>
            ) : (
              'Start Scan'
            )}
          </button>

          {loading && (
            <p className="text-xs text-gray-400 text-center">
              This may take up to 30 seconds. Port scanning &apos;deep&apos; mode checks ~250 ports.
            </p>
          )}
        </form>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What ScanV checks</h2>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-gray-900 mb-0.5">URL Scan</div>
              <div className="text-gray-500">VirusTotal reputation &amp; malware</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-gray-900 mb-0.5">Port Scan</div>
              <div className="text-gray-500">Open ports with risk analysis</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-gray-900 mb-0.5">File Check</div>
              <div className="text-gray-500">Hash lookup against known threats</div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
          <strong>Note:</strong> ScanV uses VirusTotal for URL/file analysis and native Node.js TCP connections for port scanning. Results are stored in memory and will reset on redeployment.
        </div>
      </div>
    </main>
  )
}
