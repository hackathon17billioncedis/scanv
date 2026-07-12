"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useScanCtx } from "@/contexts/ScanContext";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { FindingCard } from "@/components/FindingCard";
import { GradeBadge } from "@/components/GradeBadge";

type Status = "pending" | "scanning" | "complete" | "error";

interface ScanEntry {
  status: Status;
  error?: string;
  report?: {
    grade: string;
    score: number;
    color: string;
    summary: string;
    executiveSummary: string;
    findings: {
      severity: "critical" | "high" | "medium" | "low" | "info";
      title: string;
      details: string;
      plainEnglish: string;
    }[];
  };
  url?: string | null;
  hash?: string | null;
  fileName?: string | null;
}

export default function ScanResultPage() {
  const params = useParams();
  const id = params.id as string;
  const { setScanning } = useScanCtx();

  const [entry, setEntry] = useState<ScanEntry | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setScanning(true);
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch(`/api/scan?id=${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              setError("Scan not found");
              return;
            }
            throw new Error("Failed to fetch");
          }
          const data: ScanEntry = await res.json();
          if (!cancelled) {
            setEntry(data);
            if (data.status === "complete" || data.status === "error") {
              return;
            }
          }
        } catch {
          if (!cancelled) {
            setError("Connection error");
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    poll();
    return () => {
      cancelled = true;
      setScanning(false);
    };
  }, [id, setScanning]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <p style={{ color: "var(--cyber-pink)" }} className="font-mono font-semibold text-lg">
            !error
          </p>
          <p className="text-sm font-mono mt-2" style={{ color: "var(--cyber-text-muted)" }}>
            {error}
          </p>
          <a href="/" className="cyber-link mt-6 inline-block text-sm font-mono underline">
            &lt; back /scan
          </a>
        </div>
      </div>
    );
  }

  if (!entry || entry.status === "pending" || entry.status === "scanning") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="cyber-spinner h-10 w-10 mx-auto" />
          <p className="mt-4 font-mono text-sm sm:text-base" style={{ color: "var(--cyber-cyan)" }}>
            {entry?.status === "scanning" ? "scanning target..." : "queued..."}
          </p>
          <p className="text-xs font-mono mt-2" style={{ color: "var(--cyber-text-muted)" }}>
            $ estimated &lt;30s
          </p>
        </div>
      </div>
    );
  }

  if (entry.status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-md">
          <p className="font-mono font-semibold text-lg" style={{ color: "var(--cyber-pink)" }}>
            !scan_failed
          </p>
          <p className="text-sm font-mono mt-2" style={{ color: "var(--cyber-text-muted)" }}>
            {entry.error || "An unknown error occurred"}
          </p>
          <a href="/" className="cyber-link mt-6 inline-block text-sm font-mono underline">
            &lt; retry
          </a>
        </div>
      </div>
    );
  }

  const report = entry.report!;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-4">
        <div className="flex-1 min-w-0">
          <a href="/" className="text-xs sm:text-sm font-mono cyber-link">
            &lt;_ back
          </a>
          <h1
            className="text-xl sm:text-2xl font-bold mt-2 cyber-glitch"
            data-text="Scan Results"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            Scan Results
          </h1>
          <p className="text-xs font-mono mt-1 truncate" style={{ color: "var(--cyber-text-muted)" }}>
            target: {entry.fileName ? (
              <span style={{ color: "var(--cyber-cyan)" }}>{entry.fileName}</span>
            ) : entry.url ? (
              <span style={{ color: "var(--cyber-cyan)" }}>{entry.url}</span>
            ) : (
              <span style={{ color: "var(--cyber-cyan)" }}>{entry.hash?.slice(0, 16)}...</span>
            )}
          </p>
        </div>
        <div className="shrink-0 self-start">
          <GradeBadge grade={report.grade} score={report.score} color={report.color} />
        </div>
      </div>

      <ExecutiveSummary summary={report.executiveSummary} />

      <div className="space-y-3">
        <h2
          className="text-sm font-mono tracking-wider uppercase"
          style={{ color: "var(--cyber-text-muted)" }}
        >
          Findings &lt;{report.findings.length}&gt;
        </h2>
        {report.findings.length === 0 ? (
          <p className="text-sm font-mono" style={{ color: "var(--cyber-text-muted)" }}>
            No significant findings detected.
          </p>
        ) : (
          report.findings.map((f, i) => (
            <FindingCard key={i} finding={f} />
          ))
        )}
      </div>
    </div>
  );
}
