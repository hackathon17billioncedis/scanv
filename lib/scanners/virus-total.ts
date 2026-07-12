import type { VtAnalysis, EngineResult } from '../types'

const VT_BASE = 'https://www.virustotal.com/api/v3'

function getApiKey(): string {
  const key = process.env.VIRUSTOTAL_API_KEY
  if (!key) throw new Error('VIRUSTOTAL_API_KEY not configured')
  return key
}

function parseEngineResults(data: any): EngineResult[] {
  const results: EngineResult[] = []
  if (!data?.data?.attributes?.results) return results

  for (const [engine, result] of Object.entries(data.data.attributes.results)) {
    const r = result as any
    results.push({
      engine,
      category: r.category || 'undetected',
      result: r.result || null,
    })
  }
  return results
}

export async function scanUrl(target: string): Promise<VtAnalysis> {
  const apiKey = getApiKey()

  const submitRes = await fetch(`${VT_BASE}/urls`, {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ url: target }).toString(),
  })

  if (!submitRes.ok) {
    const text = await submitRes.text()
    throw new Error(`VT URL submit failed: ${submitRes.status} ${text}`)
  }

  const submitData = await submitRes.json()
  const analysisId = submitData?.data?.id
  if (!analysisId) throw new Error('No analysis ID from VT')

  await new Promise((r) => setTimeout(r, 5000))

  const analysisRes = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
    headers: { 'x-apikey': apiKey },
  })

  if (!analysisRes.ok) {
    const text = await analysisRes.text()
    throw new Error(`VT analysis poll failed: ${analysisRes.status} ${text}`)
  }

  const analysisData = await analysisRes.json()
  const stats = analysisData?.data?.attributes?.stats || {}
  const engineResults = parseEngineResults(analysisData)

  return {
    stats: {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      timeout: stats.timeout || 0,
    },
    engineResults,
  }
}

export async function lookupFileHash(hash: string): Promise<VtAnalysis> {
  const apiKey = getApiKey()

  const res = await fetch(`${VT_BASE}/files/${hash}`, {
    headers: { 'x-apikey': apiKey },
  })

  if (res.status === 404) {
    return {
      stats: { malicious: 0, suspicious: 0, undetected: 0, harmless: 0, timeout: 0 },
      engineResults: [],
    }
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`VT file lookup failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const stats = data?.data?.attributes?.last_analysis_stats || {}
  const engineResults = parseEngineResults(data)

  return {
    stats: {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      timeout: stats.timeout || 0,
    },
    engineResults,
  }
}
