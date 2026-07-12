import type { ScanResult } from './types'

const reports = new Map<string, ScanResult>()

export function storeReport(report: ScanResult): void {
  reports.set(report.id, report)
}

export function getReport(id: string): ScanResult | undefined {
  return reports.get(id)
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}
