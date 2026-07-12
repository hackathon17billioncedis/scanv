import type {
  PortFinding,
  VtAnalysis,
  SecurityReport,
  ReportFinding,
} from '../types'

function scoreGrade(score: number): SecurityReport['grade'] {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

function scoreTrafficLight(score: number): SecurityReport['trafficLight'] {
  if (score >= 75) return 'green'
  if (score >= 40) return 'amber'
  return 'red'
}

const HIGH_RISK_PORTS = new Set([21, 23, 25, 53, 110, 135, 137, 139, 143, 445, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 27017, 11211, 12345, 27374, 31337])

const MEDIUM_RISK_PORTS = new Set([22, 79, 111, 161, 389, 465, 514, 636, 873, 993, 995, 1080, 1194, 1434, 1701, 1723, 1883, 2049, 2375, 2376, 3128, 3260, 3690, 4840, 5060, 5222, 5672, 5900, 5984, 6000, 6379, 8080, 8443, 9092, 9200, 10000, 11211])

function portSeverity(port: number): ReportFinding['severity'] {
  if (HIGH_RISK_PORTS.has(port)) return 'high'
  if (MEDIUM_RISK_PORTS.has(port)) return 'medium'
  return 'low'
}

function portDescription(port: number, service: string): string {
  const descriptions: Record<number, string> = {
    21: 'FTP transmits credentials and data in plaintext. Commonly targeted for brute-force attacks.',
    23: 'Telnet sends all traffic unencrypted, exposing credentials and commands.',
    25: 'SMTP servers without proper security are abused for spam relay and email spoofing.',
    53: 'DNS servers can be used for amplification DDoS attacks if misconfigured.',
    80: 'HTTP lacks encryption. Data transmitted is visible to anyone on the network.',
    110: 'POP3 sends passwords in plaintext. Vulnerable to credential interception.',
    135: 'MSRPC is frequently exploited by worms and ransomware for lateral movement.',
    137: 'NetBIOS Name Service can leak internal network information.',
    139: 'NetBIOS Session Service is a common vector for SMB-based attacks.',
    143: 'IMAP without TLS exposes credentials and email content.',
    445: 'SMB is the primary vector for ransomware like WannaCry. Extremely high-risk if exposed.',
    1433: 'MSSQL databases exposed to the internet are heavily targeted for brute-force and RCE.',
    1521: 'Oracle databases exposed online face constant brute-force attacks.',
    3306: 'MySQL databases should never be exposed directly to the internet.',
    3389: 'RDP is the most targeted remote access protocol for ransomware entry points.',
    5432: 'PostgreSQL exposed to the internet is a high-value target for credential attacks.',
    5900: 'VNC often lacks proper authentication and is frequently scanned by threat actors.',
    6379: 'Redis without authentication allows full server compromise.',
    8080: 'HTTP alternative ports should be secured just like port 80.',
    11211: 'Memcached exposed to the internet enables massive DDoS amplification attacks.',
    27017: 'Unsecured MongoDB instances have been targeted by mass ransom campaigns.',
    8443: 'HTTPS alternative ports should have proper TLS configuration.',
    22: 'SSH is frequently brute-forced. Use key-based authentication and disable root login.',
    389: 'LDAP without TLS exposes directory data and credentials in transit.',
    636: 'LDAPS should use valid certificates to prevent man-in-the-middle attacks.',
    2049: 'NFS without proper export restrictions can expose entire filesystems.',
    9200: 'Elasticsearch without authentication exposes all indexed data.',
  }
  return descriptions[port] || `${service} port ${port} is open. Review whether this service needs to be publicly accessible.`
}

function portAction(port: number, service: string): string {
  const actions: Record<number, string> = {
    21: 'Disable FTP if not needed, or replace with SFTP/FTPS. Restrict access by IP whitelist.',
    23: 'Replace Telnet with SSH immediately. Telnet sends all data in plaintext.',
    25: 'Restrict SMTP to your mail server only. Enable TLS and SPF/DKIM/DMARC records.',
    53: 'Restrict DNS to authorized resolvers only. Disable recursion if not required.',
    80: 'Redirect all HTTP traffic to HTTPS. Enable HSTS headers.',
    110: 'Disable POP3 or enforce TLS-only connections.',
    135: 'Block MSRPC at the firewall. Internal services should use secure alternatives.',
    139: 'Block NetBIOS at the firewall. Use modern alternatives like SMB over TCP.',
    143: 'Enforce TLS for IMAP connections. Disable plaintext authentication.',
    445: 'Block SMB at the firewall. Never expose SMB directly to the internet.',
    3389: 'Disable RDP if not needed. Use a VPN or jump host for remote access.',
    3306: 'Bind MySQL to localhost only. Use a VPN or SSH tunnel for remote connections.',
    5900: 'Disable VNC or tunnel it through SSH. Use VPN-based access instead.',
    6379: 'Set a strong password on Redis. Bind to localhost if remote access is not required.',
    27017: 'Enable MongoDB authentication. Restrict access to trusted IPs only.',
    11211: 'Disable Memcached UDP support. Bind to localhost and firewall the port.',
  }
  return actions[port] || `Restrict access to port ${port} using firewall rules. Ensure ${service} is properly configured with authentication and encryption.`
}

function gradePortFindings(findings: PortFinding[]): ReportFinding[] {
  const result: ReportFinding[] = []

  const highRisk = findings.filter((f) => HIGH_RISK_PORTS.has(f.port))
  const mediumRisk = findings.filter((f) => MEDIUM_RISK_PORTS.has(f.port) && !HIGH_RISK_PORTS.has(f.port))
  const lowRisk = findings.filter((f) => !HIGH_RISK_PORTS.has(f.port) && !MEDIUM_RISK_PORTS.has(f.port))

  if (highRisk.length > 0) {
    result.push({
      category: 'Open Ports',
      severity: 'critical',
      title: `${highRisk.length} high-risk port${highRisk.length > 1 ? 's' : ''} exposed`,
      technicalDetail: highRisk.map((f) => `Port ${f.port} (${f.service})`).join(', '),
      plainEnglish: `We found ${highRisk.length} port${highRisk.length > 1 ? 's that are' : ' that is'} commonly targeted by attackers: ${highRisk.map((f) => `${f.port} (${f.service})`).join(', ')}. These services are frequently exploited in real-world attacks.`,
      recommendedAction: `Close or firewall these ports. ${highRisk.map((f) => portAction(f.port, f.service)).join(' ')}`,
    })
  }

  for (const f of highRisk) {
    result.push({
      category: 'Open Ports',
      severity: 'high',
      title: `Port ${f.port} (${f.service}) is open`,
      technicalDetail: `Port ${f.port}/${f.service} is accepting TCP connections.`,
      plainEnglish: portDescription(f.port, f.service),
      recommendedAction: portAction(f.port, f.service),
    })
  }

  for (const f of mediumRisk) {
    result.push({
      category: 'Open Ports',
      severity: 'medium',
      title: `Port ${f.port} (${f.service}) is open`,
      technicalDetail: `Port ${f.port}/${f.service} is accepting TCP connections.`,
      plainEnglish: portDescription(f.port, f.service),
      recommendedAction: portAction(f.port, f.service),
    })
  }

  for (const f of lowRisk) {
    result.push({
      category: 'Open Ports',
      severity: 'info',
      title: `Port ${f.port} (${f.service}) is open`,
      technicalDetail: `Port ${f.port}/${f.service} is accepting TCP connections.`,
      plainEnglish: `Port ${f.port} (${f.service}) is open. While not typically targeted, it should still be reviewed.`,
      recommendedAction: `Verify that ${f.service} on port ${f.port} needs to be publicly accessible. If not, restrict it.`,
    })
  }

  return result
}

function gradeVtAnalysis(analysis: VtAnalysis, label: string): ReportFinding[] {
  const result: ReportFinding[] = []
  const { malicious, suspicious } = analysis.stats

  if (malicious === 0 && suspicious === 0) {
    return []
  }

  const topMalicious = analysis.engineResults
    .filter((r) => r.category === 'malicious' && r.result)
    .slice(0, 5)

  const threatLabels = [...new Set(topMalicious.map((r) => r.result))].filter(Boolean)

  let severity: ReportFinding['severity'] = 'info'
  if (malicious >= 5) severity = 'critical'
  else if (malicious >= 2) severity = 'high'
  else if (malicious >= 1) severity = 'medium'
  else if (suspicious >= 1) severity = 'low'

  const titleSuffix = malicious > 0
    ? `flagged by ${malicious} security vendor${malicious > 1 ? 's' : ''}`
    : `${suspicious} suspicious detection${suspicious > 1 ? 's' : ''}`

  let plainEnglish = ''
  if (malicious > 0) {
    plainEnglish = `${label} was flagged as malicious by ${malicious} out of ${analysis.stats.malicious + analysis.stats.harmless + analysis.stats.undetected + analysis.stats.suspicious} security vendors.`
    if (threatLabels.length > 0) {
      plainEnglish += ` The most common threat labels include: ${threatLabels.slice(0, 3).join(', ')}.`
    }
    plainEnglish += ' This means multiple security tools detect this as a threat.'
  } else if (suspicious > 0) {
    plainEnglish = `${label} was marked as suspicious by ${suspicious} security vendor${suspicious > 1 ? 's' : ''}. While not definitively malicious, it exhibits unusual or potentially harmful behavior that warrants investigation.`
  }

  result.push({
    category: 'VirusTotal',
    severity,
    title: `${label} ${titleSuffix}`,
    technicalDetail: `Malicious: ${analysis.stats.malicious}, Suspicious: ${analysis.stats.suspicious}, Undetected: ${analysis.stats.undetected}, Harmless: ${analysis.stats.harmless}`,
    plainEnglish,
    recommendedAction: malicious > 0
      ? 'Do not interact with this target. If it was accessed inadvertently, run a full security scan on the affected device and review credentials that may have been used.'
      : 'Investigate further. Run additional scans with dedicated security tools and review any interactions with this target.',
  })

  return result
}

function buildExecutiveSummary(findings: ReportFinding[]): string {
  const criticalCount = findings.filter((f) => f.severity === 'critical').length
  const highCount = findings.filter((f) => f.severity === 'high').length
  const mediumCount = findings.filter((f) => f.severity === 'medium').length

  let summary = ''

  if (criticalCount > 0) {
    summary = `This scan found ${criticalCount} critical and ${highCount} high-severity issue${highCount !== 1 ? 's' : ''}. `
    summary += 'Immediate action is recommended to address these findings, as they represent significant security risks that could be exploited by attackers. '
  } else if (highCount > 0) {
    summary = `This scan identified ${highCount} high-severity issue${highCount > 1 ? 's' : ''} and ${mediumCount} medium-severity issue${mediumCount !== 1 ? 's' : ''}. `
    summary += 'These should be addressed promptly to reduce the attack surface. '
  } else if (mediumCount > 0) {
    summary = `This scan found ${mediumCount} medium-severity issue${mediumCount > 1 ? 's' : ''}. `
    summary += 'While no critical issues were detected, addressing these findings will improve your overall security posture. '
  } else {
    summary = 'No significant security issues were detected. Your target appears to be in good standing. '
  }

  summary += 'The report below provides detailed findings with plain-English explanations and recommended actions for each issue.'

  return summary
}

export function generateReport(
  domain: string,
  portFindings: PortFinding[],
  vtAnalysis: VtAnalysis | null,
  fileHashAnalysis: VtAnalysis | null,
  portPartial: boolean
): SecurityReport {
  const findings: ReportFinding[] = []

  findings.push(...gradePortFindings(portFindings))

  if (vtAnalysis) {
    findings.push(...gradeVtAnalysis(vtAnalysis, 'URL'))
  }

  if (fileHashAnalysis) {
    findings.push(...gradeVtAnalysis(fileHashAnalysis, 'File hash'))
  }

  if (portPartial) {
    findings.push({
      category: 'System',
      severity: 'info',
      title: 'Port scan was incomplete',
      technicalDetail: 'The scan timed out before all ports could be checked. Results are based on partial data.',
      plainEnglish: 'The port scan did not have enough time to check all ports. This may mean some open ports were missed. For a complete picture, try the quick scan mode or run the scan on a target with lower latency.',
      recommendedAction: 'Run a quick scan instead, or consider using a dedicated port scanning tool like Nmap for more thorough results.',
    })
  }

  findings.sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5)
  })

  let score = 100

  const criticalCount = findings.filter((f) => f.severity === 'critical').length
  const highCount = findings.filter((f) => f.severity === 'high').length
  const mediumCount = findings.filter((f) => f.severity === 'medium').length

  score -= criticalCount * 20
  score -= highCount * 10
  score -= mediumCount * 5

  if (vtAnalysis) {
    score -= vtAnalysis.stats.malicious * 5
    score -= vtAnalysis.stats.suspicious * 2
  }

  if (fileHashAnalysis) {
    score -= fileHashAnalysis.stats.malicious * 5
    score -= fileHashAnalysis.stats.suspicious * 2
  }

  score = Math.max(0, Math.min(100, score))

  return {
    grade: scoreGrade(score),
    score,
    trafficLight: scoreTrafficLight(score),
    executiveSummary: buildExecutiveSummary(findings),
    findings,
  }
}
