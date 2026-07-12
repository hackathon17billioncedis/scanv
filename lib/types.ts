export interface PortFinding {
  port: number
  service: string
  state: 'open' | 'closed' | 'filtered'
}

export interface VtStats {
  malicious: number
  suspicious: number
  undetected: number
  harmless: number
  timeout: number
}

export interface ScanResult {
  id: string
  target: string
  fileHash: string | null
  fileName: string | null
  timestamp: number
  portMode: 'quick' | 'deep'
  portScan: {
    findings: PortFinding[]
    partial: boolean
  }
  vtScan: VtAnalysis | null
  fileHashScan: VtAnalysis | null
  report: SecurityReport
}

export interface VtAnalysis {
  stats: VtStats
  engineResults: EngineResult[]
}

export interface EngineResult {
  engine: string
  category: string
  result: string | null
}

export interface SecurityReport {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score: number
  trafficLight: 'green' | 'amber' | 'red'
  executiveSummary: string
  findings: ReportFinding[]
}

export interface ReportFinding {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  technicalDetail: string
  plainEnglish: string
  recommendedAction: string
}
