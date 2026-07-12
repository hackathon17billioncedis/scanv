import net from 'net'
import type { PortFinding } from '../types'

const QUICK_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 445, service: 'SMB' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 1433, service: 'MSSQL' },
  { port: 1521, service: 'Oracle DB' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 5900, service: 'VNC' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 8443, service: 'HTTPS-Alt' },
]

const DEEP_PORTS = [
  { port: 7, service: 'Echo' },
  { port: 9, service: 'Discard' },
  { port: 19, service: 'Chargen' },
  { port: 37, service: 'Time' },
  { port: 43, service: 'WHOIS' },
  { port: 49, service: 'TACACS' },
  { port: 70, service: 'Gopher' },
  { port: 79, service: 'Finger' },
  { port: 88, service: 'Kerberos' },
  { port: 111, service: 'RPC' },
  { port: 113, service: 'Ident' },
  { port: 119, service: 'NNTP' },
  { port: 135, service: 'MSRPC' },
  { port: 137, service: 'NetBIOS-NS' },
  { port: 139, service: 'NetBIOS-SSN' },
  { port: 161, service: 'SNMP' },
  { port: 179, service: 'BGP' },
  { port: 194, service: 'IRC' },
  { port: 389, service: 'LDAP' },
  { port: 464, service: 'Kerberos' },
  { port: 465, service: 'SMTPS' },
  { port: 500, service: 'IKE' },
  { port: 514, service: 'Syslog' },
  { port: 515, service: 'LPD' },
  { port: 524, service: 'NCP' },
  { port: 540, service: 'UUCP' },
  { port: 546, service: 'DHCPv6' },
  { port: 547, service: 'DHCPv6' },
  { port: 554, service: 'RTSP' },
  { port: 563, service: 'NNTP-TLS' },
  { port: 587, service: 'SMTP-Submit' },
  { port: 591, service: 'FileMaker' },
  { port: 593, service: 'MSRPC' },
  { port: 631, service: 'IPP' },
  { port: 636, service: 'LDAPS' },
  { port: 639, service: 'MSDP' },
  { port: 646, service: 'LDP' },
  { port: 873, service: 'rsync' },
  { port: 902, service: 'VMware' },
  { port: 989, service: 'FTPS' },
  { port: 990, service: 'FTPS' },
  { port: 992, service: 'Telnet-TLS' },
  { port: 994, service: 'IRC-TLS' },
  { port: 1025, service: 'NFS-or-IIS' },
  { port: 1080, service: 'SOCKS' },
  { port: 1194, service: 'OpenVPN' },
  { port: 1214, service: 'KAZAA' },
  { port: 1241, service: 'Nessus' },
  { port: 1311, service: 'Dell iDRAC' },
  { port: 1337, service: 'WASTE' },
  { port: 1352, service: 'Lotus Notes' },
  { port: 1414, service: 'IBM MQ' },
  { port: 1434, service: 'MSSQL Monitor' },
  { port: 1494, service: 'Citrix ICA' },
  { port: 1524, service: 'Ingres' },
  { port: 1701, service: 'L2TP' },
  { port: 1720, service: 'H.323' },
  { port: 1723, service: 'PPTP' },
  { port: 1741, service: 'Cisco' },
  { port: 1755, service: 'WMS' },
  { port: 1801, service: 'MSMQ' },
  { port: 1812, service: 'RADIUS' },
  { port: 1813, service: 'RADIUS Acct' },
  { port: 1863, service: 'MSN' },
  { port: 1883, service: 'MQTT' },
  { port: 1900, service: 'UPnP' },
  { port: 1935, service: 'RTMP' },
  { port: 2000, service: 'Cisco SCCP' },
  { port: 2049, service: 'NFS' },
  { port: 2082, service: 'cPanel' },
  { port: 2083, service: 'cPanel SSL' },
  { port: 2086, service: 'WHM' },
  { port: 2087, service: 'WHM SSL' },
  { port: 2095, service: 'cPanel Webmail' },
  { port: 2096, service: 'cPanel Webmail SSL' },
  { port: 2222, service: 'DirectAdmin' },
  { port: 2302, service: 'Halo' },
  { port: 2375, service: 'Docker' },
  { port: 2376, service: 'Docker TLS' },
  { port: 2483, service: 'Oracle DB' },
  { port: 2484, service: 'Oracle DB SSL' },
  { port: 2525, service: 'SMTP-Alt' },
  { port: 25565, service: 'Minecraft' },
  { port: 26257, service: 'CockroachDB' },
  { port: 27015, service: 'HLDS' },
  { port: 27017, service: 'MongoDB' },
  { port: 28017, service: 'MongoDB HTTP' },
  { port: 3000, service: 'Node.js Dev' },
  { port: 3128, service: 'Squid Proxy' },
  { port: 3260, service: 'iSCSI' },
  { port: 3268, service: 'LDAP GC' },
  { port: 3269, service: 'LDAP GC SSL' },
  { port: 3307, service: 'MySQL-Alt' },
  { port: 3310, service: 'ClamAV' },
  { port: 3396, service: 'NDS' },
  { port: 3632, service: 'DistCC' },
  { port: 3689, service: 'DAAP' },
  { port: 3690, service: 'SVN' },
  { port: 4000, service: 'ICQ' },
  { port: 4040, service: 'Yoix' },
  { port: 4224, service: 'CDS' },
  { port: 4444, service: 'Blaster' },
  { port: 4500, service: 'IPSec NAT-T' },
  { port: 4567, service: 'Cisco' },
  { port: 4662, service: 'eMule' },
  { port: 4840, service: 'OPC UA TCP' },
  { port: 4843, service: 'OPC UA TLS' },
  { port: 4899, service: 'RAdmin' },
  { port: 4949, service: 'Munin' },
  { port: 5000, service: 'UPnP-Alt' },
  { port: 5001, service: 'Iperf' },
  { port: 5060, service: 'SIP' },
  { port: 5061, service: 'SIP-TLS' },
  { port: 5222, service: 'XMPP' },
  { port: 5223, service: 'XMPP SSL' },
  { port: 5269, service: 'XMPP Server' },
  { port: 5280, service: 'XMPP HTTP' },
  { port: 5353, service: 'mDNS' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 5555, service: 'Android ADB' },
  { port: 5601, service: 'Kibana' },
  { port: 5631, service: 'pcAnywhere' },
  { port: 5632, service: 'pcAnywhere' },
  { port: 5666, service: 'NRPE' },
  { port: 5672, service: 'AMQP' },
  { port: 5683, service: 'CoAP' },
  { port: 5800, service: 'VNC HTTP' },
  { port: 5900, service: 'VNC' },
  { port: 5984, service: 'CouchDB' },
  { port: 5985, service: 'WinRM HTTP' },
  { port: 5986, service: 'WinRM HTTPS' },
  { port: 6000, service: 'X11' },
  { port: 6379, service: 'Redis' },
  { port: 6380, service: 'Redis SSL' },
  { port: 6432, service: 'PgBouncer' },
  { port: 6443, service: 'HTTPS-Alt' },
  { port: 6514, service: 'Syslog TLS' },
  { port: 6580, service: 'Parsec' },
  { port: 6667, service: 'IRC' },
  { port: 6697, service: 'IRC TLS' },
  { port: 6789, service: 'Splunk' },
  { port: 6881, service: 'BitTorrent' },
  { port: 6969, service: 'BitTorrent Tracker' },
  { port: 7000, service: 'AFS' },
  { port: 7070, service: 'RealServer' },
  { port: 8000, service: 'HTTP-Alt' },
  { port: 8008, service: 'HTTP-Alt' },
  { port: 8009, service: 'AJP' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 8081, service: 'HTTP-Alt' },
  { port: 8090, service: 'HTTP-Alt' },
  { port: 8243, service: 'HTTPS-Alt' },
  { port: 8291, service: 'Winbox' },
  { port: 8332, service: 'Bitcoin' },
  { port: 8333, service: 'Bitcoin' },
  { port: 8443, service: 'HTTPS-Alt' },
  { port: 8530, service: 'WSUS' },
  { port: 8531, service: 'WSUS SSL' },
  { port: 8649, service: 'Ganglia' },
  { port: 8834, service: 'Nessus' },
  { port: 8883, service: 'MQTT TLS' },
  { port: 8888, service: 'HTTP-Alt' },
  { port: 9000, service: 'HTTP-Alt' },
  { port: 9001, service: 'HTTP-Alt' },
  { port: 9042, service: 'Cassandra' },
  { port: 9050, service: 'Tor' },
  { port: 9080, service: 'HTTP-Alt' },
  { port: 9090, service: 'HTTP-Alt' },
  { port: 9092, service: 'Kafka' },
  { port: 9100, service: 'JetDirect' },
  { port: 9200, service: 'Elasticsearch' },
  { port: 9300, service: 'Elasticsearch' },
  { port: 9418, service: 'Git' },
  { port: 9443, service: 'HTTPS-Alt' },
  { port: 9997, service: 'Splunk' },
  { port: 10000, service: 'Webmin' },
  { port: 10050, service: 'Zabbix' },
  { port: 10051, service: 'Zabbix' },
  { port: 11211, service: 'Memcached' },
  { port: 12345, service: 'NetBus' },
  { port: 15672, service: 'RabbitMQ UI' },
  { port: 16010, service: 'HBase' },
  { port: 16020, service: 'HBase' },
  { port: 16030, service: 'HBase' },
  { port: 17017, service: 'HP' },
  { port: 18080, service: 'HTTP-Alt' },
  { port: 19150, service: 'GKR' },
  { port: 20000, service: 'DNP' },
  { port: 22222, service: 'DirectAdmin' },
  { port: 25565, service: 'Minecraft' },
  { port: 25672, service: 'RabbitMQ' },
  { port: 27015, service: 'HLDS' },
  { port: 27017, service: 'MongoDB' },
  { port: 27374, service: 'Sub7' },
  { port: 31337, service: 'Back Orifice' },
  { port: 32400, service: 'Plex' },
  { port: 32764, service: 'Linksys' },
  { port: 34197, service: 'Factorio' },
]

const CONCURRENCY = 20
const TIMEOUT = 2000

function checkPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(TIMEOUT)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

function getPortList(mode: 'quick' | 'deep'): typeof QUICK_PORTS {
  if (mode === 'quick') return QUICK_PORTS
  const seen = new Set<number>()
  return [...QUICK_PORTS, ...DEEP_PORTS].filter((p) => {
    if (seen.has(p.port)) return false
    seen.add(p.port)
    return true
  })
}

export async function scanPorts(
  host: string,
  mode: 'quick' | 'deep'
): Promise<{ findings: PortFinding[]; partial: boolean }> {
  const ports = getPortList(mode)
  const findings: PortFinding[] = []
  const startTime = Date.now()
  const hardTimeout = 28000
  let partial = false

  for (let i = 0; i < ports.length; i += CONCURRENCY) {
    if (Date.now() - startTime > hardTimeout) {
      partial = true
      break
    }

    const batch = ports.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map((p) => checkPort(host, p.port))
    )

    for (let j = 0; j < batch.length; j++) {
      if (results[j]) {
        findings.push({
          port: batch[j].port,
          service: batch[j].service,
          state: 'open',
        })
      }
    }
  }

  return { findings, partial }
}
