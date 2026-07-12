"use client";

import { useScanCtx } from "@/contexts/ScanContext";

export function CyberBackground() {
  const { scanning } = useScanCtx();

  return (
    <>
      <div className="cyber-grid" aria-hidden="true" />
      <div className="cyber-particles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="cyber-particle" />
        ))}
      </div>
      {scanning && (
        <>
          <div className="cyber-scan-beam scanning" aria-hidden="true" />
          <div className="cyber-scan-ring scanning" aria-hidden="true" />
        </>
      )}
    </>
  );
}
