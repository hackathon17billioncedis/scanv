interface Props {
  grade: string;
  score: number;
  color: string;
}

const bgMap: Record<string, string> = {
  green: "grade-green",
  amber: "grade-amber",
  red: "grade-red",
};

const scoreColorMap: Record<string, string> = {
  green: "var(--cyber-green)",
  amber: "var(--cyber-amber)",
  red: "var(--cyber-pink)",
};

export function GradeBadge({ grade, score, color }: Props) {
  const cls = bgMap[color] || "grade-red";
  const sc = scoreColorMap[color] || "var(--cyber-pink)";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`cyber-grade ${cls}`}
        style={{
          width: 72,
          height: 72,
          fontSize: "1.75rem",
          background:
            color === "green"
              ? "radial-gradient(circle, rgba(0,255,65,0.15) 0%, transparent 70%)"
              : color === "amber"
              ? "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,0,85,0.15) 0%, transparent 70%)",
          color: sc,
        }}
      >
        {grade}
      </div>
      <div className="text-sm font-mono">
        <p style={{ color: "var(--cyber-text-muted)" }}>score</p>
        <p className="text-xl font-bold" style={{ color: sc }}>
          {score}
          <span className="text-xs" style={{ color: "var(--cyber-text-muted)" }}>/100</span>
        </p>
      </div>
    </div>
  );
}
