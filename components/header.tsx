"use client";

import { Clapperboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUnit } from "@/components/unit-provider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { unit, toggle } = useUnit();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">CineMate</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="px-2 text-xs font-mono"
          >
            {unit === "metric" ? "m" : "ft"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
