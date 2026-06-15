"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  Shield,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { accounts, incomeSources, expenses, cardBenefits, clearAll } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const exportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      accounts: useStore.getState().accounts,
      income_sources: useStore.getState().incomeSources,
      expenses: useStore.getState().expenses,
      card_benefits: useStore.getState().cardBenefits,
      debt_plans: useStore.getState().debtPlans,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneymap-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = [
      ["Type", "Name", "Category", "Balance/Amount", "APR", "Institution", "Due Day"],
    ];

    for (const a of accounts) {
      rows.push([
        a.account_type,
        a.nickname,
        "",
        a.current_balance.toString(),
        a.interest_rate?.toString() ?? "",
        a.institution_name,
        a.payment_due_day?.toString() ?? "",
      ]);
    }
    for (const i of incomeSources) {
      rows.push(["income", i.name, i.is_stable ? "stable" : "variable", i.amount.toString(), "", "", ""]);
    }
    for (const e of expenses) {
      rows.push(["expense", e.name, e.category, e.amount.toString(), "", "", e.due_day?.toString() ?? ""]);
    }

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneymap-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dataCount =
    accounts.length + incomeSources.length + expenses.length + cardBenefits.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium border transition-colors ${
                  theme === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Your data is stored locally in your browser&apos;s localStorage. Nothing is sent to any server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium text-sm">Data Storage</p>
              <p className="text-xs text-muted-foreground">
                {dataCount} item{dataCount !== 1 ? "s" : ""} stored locally
              </p>
            </div>
            <span className="text-xs text-green font-medium">Local Only</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium text-sm">Encryption</p>
              <p className="text-xs text-muted-foreground">
                Account numbers are masked (last 4 digits only)
              </p>
            </div>
            <span className="text-xs text-green font-medium">Enabled</span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications (placeholder for future) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Push notifications and email reminders will be available in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bill reminders, benefit expiration alerts, and credit utilization warnings coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your financial data as JSON or CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportData} className="gap-2">
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete All Data */}
      <Card className="border-red/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red">
            <Trash2 className="h-5 w-5" />
            Delete All Data
          </CardTitle>
          <CardDescription>
            Permanently remove all your MoneyMap data from this browser. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete All Data
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogHeader onClose={() => setConfirmDelete(false)}>
          <DialogTitle>Delete all data?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all {dataCount} items including accounts, income sources,
            expenses, and card benefits. This action cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearAll();
              setConfirmDelete(false);
            }}
          >
            Delete Everything
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
