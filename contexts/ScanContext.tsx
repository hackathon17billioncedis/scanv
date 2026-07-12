"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ScanCtx {
  scanning: boolean;
  setScanning: (v: boolean) => void;
}

const Ctx = createContext<ScanCtx>({
  scanning: false,
  setScanning: () => {},
});

export const useScanCtx = () => useContext(Ctx);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scanning, setScanning] = useState(false);
  return <Ctx.Provider value={{ scanning, setScanning }}>{children}</Ctx.Provider>;
}
