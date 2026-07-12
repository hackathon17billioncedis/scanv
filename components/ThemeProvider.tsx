"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContext {
  mode: ThemeMode;
  effective: "light" | "dark";
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeContext>({
  mode: "system",
  effective: "dark",
  setMode: () => {},
});

export const useTheme = () => useContext(Ctx);

function getSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [effective, setEffective] = useState<"light" | "dark">("dark");

  const apply = useCallback((m: ThemeMode) => {
    const sys = getSystem();
    const eff = m === "system" ? sys : m;
    document.documentElement.setAttribute("data-theme", eff);
    setEffective(eff);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    apply(m);
    try { localStorage.setItem("scanv-theme", m); } catch {}
  }, [apply]);

  useEffect(() => {
    const saved = (typeof window !== "undefined"
      ? localStorage.getItem("scanv-theme")
      : null) as ThemeMode | null;
    const initial = saved || "system";
    setModeState(initial);
    apply(initial);

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (initial === "system") apply("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [apply]);

  return (
    <Ctx.Provider value={{ mode, effective, setMode }}>
      {children}
    </Ctx.Provider>
  );
}
