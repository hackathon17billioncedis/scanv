"use client";

import { useState } from "react";

interface Props {
  finding: {
    severity: string;
    title: string;
    details: string;
    plainEnglish: string;
  };
}

const severityLabels: Record<string, string> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
  info: "info",
};

export function FindingCard({ finding }: Props) {
  const [expanded, setExpanded] = useState(false);
  const label = severityLabels[finding.severity] || "info";

  return (
    <div className="cyber-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition cursor-pointer hover:bg-white/[0.02]"
      >
        <span className={`cyber-dot ${finding.severity} shrink-0`} />
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider w-20 shrink-0"
          style={{ color: "var(--cyber-text-muted)" }}
        >
          {label}
        </span>
        <span className="text-sm font-mono flex-1 leading-snug">
          {finding.title}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
          style={{ color: "var(--cyber-text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div
          className="px-4 pb-4 pt-1 space-y-3 border-t"
          style={{ borderColor: "var(--cyber-border)" }}
        >
          <p className="text-sm font-mono leading-relaxed" style={{ color: "var(--cyber-text)" }}>
            {finding.plainEnglish}
          </p>
          <details className="text-xs font-mono">
            <summary
              className="cursor-pointer"
              style={{ color: "var(--cyber-cyan)" }}
            >
              $ cat technical-details
            </summary>
            <pre
              className="mt-2 p-3 rounded-lg overflow-x-auto leading-relaxed"
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                color: "var(--cyber-text-muted)",
                border: "1px solid var(--cyber-border)",
              }}
            >
              {finding.details}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
