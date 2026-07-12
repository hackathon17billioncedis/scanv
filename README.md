# ScanV — Vulnerability Scanner

**ScanV** is a modern web-based vulnerability scanner that fuses TCP port scanning with VirusTotal intelligence and delivers **letter-grade (A–F) reports** with traffic-light indicators. Every finding pairs technical detail with a plain-English translation, built for both security engineers and the executives who need to understand them.

---

## Features

| Capability | Description |
|---|---|
| **Port Scanner** | Quick mode (26 common ports) or Deep mode (250+ ports). Detects open services and flags known-risky ports (FTP, Telnet, RDP, SMB, etc.). |
| **VirusTotal Integration** | Submit a URL (with polling for analysis) or look up a file by SHA-256 hash against 70+ antivirus engines. |
| **Grade-Based Report** | A–F scoring with traffic-light coloring (Green / Amber / Red). Score starts at 100 and deducts per-severity penalty. |
| **Plain English** | Every finding includes a technical description and a plain-English explanation for non-technical stakeholders. |
| **Executive Summary** | Concise overview targeting critical and high-severity findings, suitable for management dashboards or compliance reviews. |
| **Async Polling** | Scan kicks off server-side and the client polls for completion — handles Vercel's 30s Hobby timeout gracefully. |

---

## Architecture

```
┌─────────────┐     POST /api/scan      ┌──────────────────┐
│  Landing     │ ──────────────────────→ │  Scan API Route   │
│  (page.tsx)  │                         │  (route.ts)       │
│             │ ←── redirect /scan/id── │  returns { id }   │
└─────────────┘                         └────────┬─────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
          ┌─────────────────┐          ┌──────────────────┐       ┌──────────────────┐
          │  Port Scanner    │          │  VirusTotal API  │       │  In-Memory Store  │
          │  (port-scanner)  │          │  (virus-total)    │       │  (store.ts)       │
          │  TCP connect     │          │  URL submit/poll  │       │  Map<string,      │
          │  concurrency 20  │          │  Hash lookup      │       │   ScanEntry>      │
          └────────┬────────┘          └────────┬─────────┘       └──────────────────┘
                   │                            │
                   └──────────┬─────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  Report Engine   │
                    │  (reporter.ts)   │
                    │  Grade, Score,   │
                    │  Plain English   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Scan Results    │
                    │  (scan/[id])     │
                    │  Polls GET API   │
                    └──────────────────┘
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Runtime:** Node.js (TCP port scanning via `net`)
- **External API:** VirusTotal API v3
- **Deployment:** Vercel (Hobby)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- [VirusTotal API key](https://www.virustotal.com/gui/my-apikey) (free tier)

### Install

```bash
git clone https://github.com/hackathon17billioncedis/scanv.git
cd scanv
npm install
```

### Environment Variables

Create `.env.local` at the project root:

```env
VIRUSTOTAL_API_KEY=your_api_key_here
```

> **Note:** The API key is never committed to the repository. Set it via Vercel dashboard for production deployments.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## API Reference

### `POST /api/scan`

Initiates a new scan. Returns `{ id }` for polling.

**URL Scan:**
```json
{ "url": "https://example.com", "depth": "quick" }
```

**File Hash Lookup:**
```json
{ "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" }
```

### `GET /api/scan?id={id}`

Poll for results. Returns the full `ScanEntry` object, including `status` (`pending`, `scanning`, `complete`, `error`) and the `SecurityReport` when complete.

---

## Deployment

Deployed on **Vercel**. Pushes to the `main` branch trigger automatic redeploys.

### Required Environment Variable

Set `VIRUSTOTAL_API_KEY` in your Vercel project settings → Environment Variables.

---

## License

MIT
