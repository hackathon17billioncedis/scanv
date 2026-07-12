import { neon } from '@neondatabase/serverless'
import type { ScanResult } from './types'

const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function storeReport(report: ScanResult): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO scan_results (id, result)
    VALUES (${report.id}, ${JSON.stringify(report)})
    ON CONFLICT (id) DO NOTHING
  `
}

export async function getReport(id: string): Promise<ScanResult | undefined> {
  const sql = getSql()
  const rows = await sql`SELECT result FROM scan_results WHERE id = ${id}`
  if (rows.length === 0) return undefined
  return (rows[0] as { result: unknown }).result as ScanResult
}

export function generateId(): string {
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}
