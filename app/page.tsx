"use client";

import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

type ScanType = "domain" | "hash";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Home() {
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanType, setScanType] = useState<ScanType>("domain");
  const [target, setTarget] = useState("");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [computingHash, setComputingHash] = useState(false);

  async function handleFile(file: File) {
    setComputingHash(true);
    setError("");
    try {
      const hash = await computeSHA256(file);
      setTarget(hash);
      setFileName(file.name);
      setFileSize(file.size);
    } catch {
      setError("Failed to compute file hash");
    } finally {
      setComputingHash(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setTarget("");
    setFileName("");
    setFileSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
      if (fileName) body.fileName = fileName;
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
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setMode(mode === "system" ? "dark" : mode === "dark" ? "light" : "system")}
        className="cyber-chip active fixed top-3 right-3 z-50 px-3 py-1.5 text-xs font-mono cursor-pointer"
        title={`Theme: ${mode}`}
      >
        {mode === "system" ? "🌓 sys" : mode === "dark" ? "🌙 dark" : "☀️ light"}
      </button>
      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8 sm:mb-10">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight cyber-glitch"
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
          className="cyber-card p-4 sm:p-6 space-y-4 sm:space-y-5"
        >
          <div className="flex flex-col sm:flex-row gap-2">
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
              {scanType === "domain" ? "Target // domain" : fileName ? "Target // sha256 (auto)" : "Target // sha256"}
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => { setTarget(e.target.value); if (fileName && e.target.value !== target) clearFile(); }}
              placeholder={
                scanType === "domain"
                  ? "example.com"
                  : "9f86d081884c7d659a2feaa0c55ad015a..."
              }
              className="cyber-input w-full px-4 py-2.5 text-sm font-mono"
              required
              readOnly={!!fileName}
            />
          </div>

          {scanType === "hash" && (
            <div>
              <label
                className="block text-xs font-mono mb-1.5 tracking-wider uppercase"
                style={{ color: "var(--cyber-text-muted)" }}
              >
                Upload // file
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !fileName && fileInputRef.current?.click()}
                style={{
                  border: "1px dashed rgba(0, 212, 255, 0.25)",
                  borderRadius: 12,
                  padding: fileName ? 12 : 24,
                  textAlign: "center",
                  cursor: fileName ? "default" : "pointer",
                  background: fileName ? "rgba(0, 212, 255, 0.04)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.3s",
                }}
                className="font-mono text-sm"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {computingHash ? (
                  <span style={{ color: "var(--cyber-cyan)" }}>
                    computing sha-256...
                  </span>
                ) : fileName ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
                      <div style={{ color: "var(--cyber-cyan)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {fileName}
                      </div>
                      <div style={{ color: "var(--cyber-text-muted)", fontSize: 11, marginTop: 2 }}>
                        {formatFileSize(fileSize)} — hash computed
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,0,85,0.3)",
                        color: "var(--cyber-pink)",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--cyber-text-muted)" }}>
                    drop a file here or click to browse
                  </span>
                )}
              </div>
            </div>
          )}

          {scanType === "domain" && (
            <div>
              <label
                className="block text-xs font-mono mb-1.5 tracking-wider uppercase"
                style={{ color: "var(--cyber-text-muted)" }}
              >
                Depth // port-scan
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
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
