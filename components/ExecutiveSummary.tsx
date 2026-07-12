interface Props {
  summary: string;
}

export function ExecutiveSummary({ summary }: Props) {
  return (
    <div
      className="cyber-card p-4 sm:p-5"
      style={{
        borderLeft: "3px solid var(--cyber-cyan)",
      }}
    >
      <h2 className="text-xs font-mono tracking-wider uppercase mb-2 sm:mb-3">
        <span style={{ color: "var(--cyber-cyan)" }}>$</span>{" "}
        <span style={{ color: "var(--cyber-text-muted)" }}>executive-summary</span>
      </h2>
      <div
        className="text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-line"
        style={{ color: "var(--cyber-text)" }}
      >
        {summary}
      </div>
    </div>
  );
}
