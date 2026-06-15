"use client";

import { useStore } from "@/lib/store";
import {
  calculateNetPosition,
  calculateCreditUtilization,
  formatCurrency,
  formatPercent,
  daysUntilExpiry,
} from "@/lib/calculations";
import { DEBT_ACCOUNT_TYPES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  TrendingDown,
  CreditCard,
  AlertTriangle,
  PiggyBank,
  Home,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { accounts, incomeSources, expenses, cardBenefits } = useStore();

  const debtAccounts = accounts.filter((a) =>
    DEBT_ACCOUNT_TYPES.includes(a.account_type)
  );
  const creditCards = accounts.filter((a) => a.account_type === "credit_card");
  const bankAccounts = accounts.filter(
    (a) => a.account_type === "checking" || a.account_type === "savings"
  );

  const { stableIncome, totalExpenses, netPosition } = calculateNetPosition(
    incomeSources,
    expenses,
    debtAccounts
  );
  const { utilization, totalBalance: ccBalance, totalLimit } =
    calculateCreditUtilization(creditCards);

  const totalDebt = debtAccounts.reduce((s, a) => s + a.current_balance, 0);
  const totalSavings = bankAccounts.reduce((s, a) => s + a.current_balance, 0);

  // Mortgage equity estimate
  const mortgages = accounts.filter((a) => a.account_type === "mortgage");

  // Alerts
  const alerts: Array<{ type: "warning" | "info" | "danger"; message: string }> = [];

  if (netPosition < 0) {
    alerts.push({
      type: "danger",
      message: `Monthly shortfall of ${formatCurrency(Math.abs(netPosition))} — must be covered by variable income or savings.`,
    });
  }

  if (utilization > 50) {
    alerts.push({
      type: "danger",
      message: `Credit utilization at ${formatPercent(utilization)} — well above the recommended 30%.`,
    });
  } else if (utilization > 30) {
    alerts.push({
      type: "warning",
      message: `Credit utilization at ${formatPercent(utilization)} — approaching the 30% threshold.`,
    });
  }

  // Expiring benefits
  const expiringBenefits = cardBenefits.filter((b) => {
    if (b.claimed) return false;
    const days = daysUntilExpiry(b.expires_on);
    return days !== null && days <= 14 && days >= 0;
  });

  for (const benefit of expiringBenefits) {
    const days = daysUntilExpiry(benefit.expires_on)!;
    alerts.push({
      type: "warning",
      message: `"${benefit.name}" expires in ${days} day${days !== 1 ? "s" : ""} — ${formatCurrency(benefit.remaining_value)} at risk.`,
    });
  }

  // Bills due soon
  const today = new Date().getDate();
  const upcomingBills = expenses
    .filter((e) => e.is_recurring && e.due_day !== null)
    .filter((e) => {
      const daysDiff = ((e.due_day! - today + 31) % 31);
      return daysDiff <= 7;
    });

  for (const bill of upcomingBills.slice(0, 3)) {
    alerts.push({
      type: "info",
      message: `"${bill.name}" due on day ${bill.due_day} — ${formatCurrency(bill.amount)}.`,
    });
  }

  // 0% APR ending cards
  const promoCards = creditCards.filter(
    (c) => c.interest_rate !== null && c.interest_rate === 0 && c.current_balance > 0
  );
  for (const card of promoCards) {
    alerts.push({
      type: "warning",
      message: `0% APR promo on "${card.nickname}" — check expiry date and plan payoff.`,
    });
  }

  const isEmpty = accounts.length === 0 && incomeSources.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <PiggyBank className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to MoneyMap</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Start by adding your income sources and financial accounts to see your complete financial picture.
        </p>
        <div className="flex gap-3">
          <Link href="/accounts">
            <Button className="gap-2">
              Add Accounts <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Net Position Card */}
      <Card
        className={
          netPosition >= 0
            ? "border-green/30 bg-green-bg/50"
            : "border-red/30 bg-red-bg/50"
        }
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Monthly Position</p>
              <p className={`text-3xl font-bold font-tabular mt-1 ${netPosition >= 0 ? "text-green" : "text-red"}`}>
                {formatCurrency(netPosition)}
              </p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Stable Income:</span>{" "}
                <span className="font-medium font-tabular">{formatCurrency(stableIncome)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Fixed Expenses:</span>{" "}
                <span className="font-medium font-tabular">{formatCurrency(totalExpenses)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<TrendingDown className="h-5 w-5" />}
          label="Total Debt"
          value={formatCurrency(totalDebt)}
          variant="default"
        />
        <MetricCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Credit Utilization"
          value={formatPercent(utilization)}
          detail={`${formatCurrency(ccBalance)} / ${formatCurrency(totalLimit)}`}
          variant={utilization > 50 ? "red" : utilization > 30 ? "amber" : "green"}
        />
        <MetricCard
          icon={<PiggyBank className="h-5 w-5" />}
          label="Cash & Savings"
          value={formatCurrency(totalSavings)}
          variant="default"
        />
        <MetricCard
          icon={<Home className="h-5 w-5" />}
          label="Mortgages"
          value={
            mortgages.length > 0
              ? formatCurrency(mortgages.reduce((s, m) => s + m.current_balance, 0))
              : "—"
          }
          detail={mortgages.length > 0 ? `${mortgages.length} mortgage${mortgages.length > 1 ? "s" : ""}` : "None added"}
          variant="default"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg px-3 py-2 text-sm ${
                  alert.type === "danger"
                    ? "bg-red-bg text-red"
                    : alert.type === "warning"
                      ? "bg-amber-bg text-amber"
                      : "bg-secondary text-secondary-foreground"
                }`}
              >
                {alert.type === "danger" ? (
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{alert.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/debt-plan">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Debt Payoff Plan</p>
                <p className="text-sm text-muted-foreground">
                  {debtAccounts.length > 0
                    ? `${debtAccounts.length} debt${debtAccounts.length > 1 ? "s" : ""} totaling ${formatCurrency(totalDebt)}`
                    : "Add debts to create a payoff plan"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/rewards">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Rewards Guide</p>
                <p className="text-sm text-muted-foreground">
                  {creditCards.length > 0
                    ? `${creditCards.length} card${creditCards.length > 1 ? "s" : ""} — see best card for every purchase`
                    : "Add credit cards to optimize rewards"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
  variant?: "default" | "green" | "amber" | "red";
}) {
  const colorMap = {
    default: "text-foreground",
    green: "text-green",
    amber: "text-amber",
    red: "text-red",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <p className={`text-2xl font-bold font-tabular ${colorMap[variant]}`}>{value}</p>
        {detail && <p className="text-xs text-muted-foreground mt-1 font-tabular">{detail}</p>}
      </CardContent>
    </Card>
  );
}
