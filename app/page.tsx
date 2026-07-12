"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ScanType = "domain" | "hash";

export default function Home() {
  const router = useRouter();
  const [scanType, setScanType] = useState<ScanType>("domain");
  const [target, setTarget] = useState("");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: Record<string, unknown> = {};
    if (scanType === "domain") {
      let domain = target.trim();
      if (domain && !domain.startsWith("http://") && !domain.startsWith("https://")) {
        domain = "https://" + domain;
      }
      body.url = domain;
      body.depth = depth;
    } else {
      body.hash = target.trim();
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }
      const data = await res.json();
      router.push(`/scan/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-lg relative">
        <div className="text-center mb-10">
          <h1
            className="text-5xl font-bold tracking-tight cyber-glitch"
            data-text="ScanV"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            ScanV
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--cyber-text-muted)" }}>
            <span style={{ color: "var(--cyber-cyan)" }}>$</span> vulnerability scan
            <span style={{ color: "var(--cyber-cyan)" }}> --stakeholder-friendly</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="cyber-card p-6 space-y-5"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setScanType("domain")}
              className={`flex-1 py-2 text-sm font-medium transition-all rounded-xl ${
                scanType === "domain"
                  ? "cyber-chip active"
                  : "cyber-chip"
              }`}
            >
              $ domain
            </button>
            <button
              type="button"
              onClick={() => setScanType("hash")}
              className={`flex-1 py-2 text-sm font-medium transition-all rounded-xl ${
                scanType === "hash"
                  ? "cyber-chip active"
                  : "cyber-chip"
              }`}
            >
              $ file-hash
            </button>
          </div>

          <div>
            <label
              htmlFor="target"
              className="block text-xs font-mono mb-1.5 tracking-wider uppercase"
              style={{ color: "var(--cyber-text-muted)" }}
            >
              {scanType === "domain" ? "Target // domain" : "Target // sha256"}
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                scanType === "domain"
                  ? "example.com"
                  : "9f86d081884c7d659a2feaa0c55ad015a..."
              }
              className="cyber-input w-full px-4 py-2.5 text-sm font-mono"
              required
            />
          </div>

          {scanType === "domain" && (
            <div>
              <label
                className="block text-xs font-mono mb-1.5 tracking-wider uppercase"
                style={{ color: "var(--cyber-text-muted)" }}
              >
                Depth // port-scan
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDepth("quick")}
                  className={`flex-1 py-2 text-sm font-mono transition-all rounded-xl ${
                    depth === "quick"
                      ? "cyber-chip active"
                      : "cyber-chip"
                  }`}
                >
                  quick (26)
                </button>
                <button
                  type="button"
                  onClick={() => setDepth("deep")}
                  className={`flex-1 py-2 text-sm font-mono transition-all rounded-xl ${
                    depth === "deep"
                      ? "cyber-chip active"
                      : "cyber-chip"
                  }`}
                >
                  deep (250+)
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              className="text-sm font-mono rounded-xl px-4 py-2.5"
              style={{
                color: "var(--cyber-pink)",
                background: "rgba(255, 0, 85, 0.08)",
                border: "1px solid rgba(255, 0, 85, 0.2)",
              }}
            >
              <span style={{ color: "var(--cyber-pink)" }}>!</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn w-full py-2.5 px-4 rounded-xl text-sm font-mono cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="cyber-spinner inline-block h-4 w-4" />
                scanning...
              </span>
            ) : (
              ">_ scan --run"
            )}
          </button>
        </form>

        <p
          className="text-center text-xs mt-4 font-mono"
          style={{ color: "var(--cyber-text-muted)" }}
        >
          [ system online — ready for reconnaissance ]
        </p>
      </div>
    </main>
  );
}
