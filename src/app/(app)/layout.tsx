"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NavShell } from "@/components/nav-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NavShell>{children}</NavShell>
    </ThemeProvider>
  );
}
