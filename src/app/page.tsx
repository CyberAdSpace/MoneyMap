"use client";

import Link from "next/link";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard,
  Wallet,
  TrendingDown,
  CreditCard,
  ArrowRight,
  Moon,
  Sun,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function LandingContent() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-lg">MoneyMap</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent"
            >
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link href="/dashboard">
              <Button size="sm">Open App</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          See your entire financial life
          <br />
          <span className="text-primary">in one place</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Every account, every bill, every debt, every reward — one dashboard with a clear,
          prioritized plan to improve it all.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Free forever. No account linking required. Your data stays on your device.
        </p>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: LayoutDashboard,
              title: "Financial Dashboard",
              description:
                "Net position, total debt, credit utilization, and upcoming alerts at a glance.",
            },
            {
              icon: Wallet,
              title: "Account Tracking",
              description:
                "Manually track every bank account, credit card, mortgage, auto loan, and HELOC.",
            },
            {
              icon: TrendingDown,
              title: "Debt Payoff Planner",
              description:
                "Avalanche or snowball strategies with interactive sliders and month-by-month timelines.",
            },
            {
              icon: CreditCard,
              title: "Rewards Optimizer",
              description:
                "Know exactly which card to use for every purchase and never miss an expiring benefit.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Built on Principles</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Privacy First",
                description:
                  "Your financial data never leaves your device. No server required for the MVP.",
              },
              {
                icon: Zap,
                title: "Manual Entry Always Works",
                description:
                  "No bank linking needed. Enter and maintain all data by hand if you prefer.",
              },
              {
                icon: Target,
                title: "Trustworthy Numbers",
                description:
                  "Every calculation is transparent and auditable. No black boxes.",
              },
            ].map((principle) => (
              <div key={principle.title} className="text-center">
                <principle.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">{principle.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 text-center text-sm text-muted-foreground">
          MoneyMap &copy; {new Date().getFullYear()}. All data is stored locally in your browser.
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LandingContent />
    </ThemeProvider>
  );
}
