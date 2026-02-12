"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UnitSystem = "metric" | "imperial";

interface UnitContextValue {
  unit: UnitSystem;
  toggle: () => void;
}

const UnitContext = createContext<UnitContextValue>({
  unit: "metric",
  toggle: () => {},
});

export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const toggle = useCallback(
    () => setUnit((prev) => (prev === "metric" ? "imperial" : "metric")),
    [],
  );
  return (
    <UnitContext.Provider value={{ unit, toggle }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
