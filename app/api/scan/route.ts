import { NextRequest, NextResponse } from 'next/server'
import { scanUrl, lookupFileHash } from '@/lib/scanners/virus-total'
import { scanPorts } from '@/lib/scanners/port-scanner'
import { generateReport } from '@/lib/scanners/reporter'
import { storeReport, generateId } from '@/lib/store'
import type { ScanResult } from '@/lib/types'

export const maxDuration = 30

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }
  const { getReport } = await import('@/lib/store')
  const report = getReport(id)
  if (!report) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(report)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target, portMode, fileHash, fileName } = body as {
      target: string
      portMode: 'quick' | 'deep'
      fileHash?: string
      fileName?: string
    }

    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 })
    }

    const cleanTarget = target.trim().toLowerCase()
    const hasProtocol = /^https?:\/\//.test(cleanTarget)
    const domain = hasProtocol ? new URL(cleanTarget).hostname : cleanTarget

    const id = generateId()

    const [portResults, vtResult, hashResult] = await Promise.all([
      scanPorts(domain, portMode || 'quick'),
      scanUrl(cleanTarget).catch(() => null),
      fileHash ? lookupFileHash(fileHash.trim()).catch(() => null) : Promise.resolve(null),
    ])

    const report = generateReport(
      domain,
      portResults.findings,
      vtResult,
      hashResult,
      portResults.partial
    )

    const result: ScanResult = {
      id,
      target: cleanTarget,
      fileHash: fileHash?.trim() || null,
      fileName: fileName?.trim() || null,
      timestamp: Date.now(),
      portMode: portMode || 'quick',
      portScan: {
        findings: portResults.findings,
        partial: portResults.partial,
      },
      vtScan: vtResult,
      fileHashScan: hashResult,
      report,
    }

    await storeReport(result)

    return NextResponse.json({ id, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Scan failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
