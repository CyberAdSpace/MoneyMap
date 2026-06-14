"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import {
  calculateDebtPayoff,
  calculateHELOCRefinance,
  formatCurrency,
  formatPercent,
} from "@/lib/calculations";
import { DEBT_ACCOUNT_TYPES, type DebtStrategy, type DebtForCalculation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { TrendingDown, Calculator, ArrowDown, DollarSign, Calendar } from "lucide-react";

type Tab = "payoff" | "heloc";

export default function DebtPlanPage() {
  const [tab, setTab] = useState<Tab>("payoff");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Debt Plan</h1>

      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        <button
          onClick={() => setTab("payoff")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "payoff"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Debt Payoff Calculator
        </button>
        <button
          onClick={() => setTab("heloc")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "heloc"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          HELOC Refinance
        </button>
      </div>

      {tab === "payoff" ? <DebtPayoffSection /> : <HELOCSection />}
    </div>
  );
}

/* ===================== DEBT PAYOFF ===================== */

const CHART_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed",
  "#0891b2", "#be185d", "#65a30d", "#ea580c", "#6366f1",
];

function DebtPayoffSection() {
  const { accounts } = useStore();
  const [strategy, setStrategy] = useState<DebtStrategy>("avalanche");
  const [extraPayment, setExtraPayment] = useState(200);

  const debtAccounts = accounts.filter(
    (a) => DEBT_ACCOUNT_TYPES.includes(a.account_type) && a.current_balance > 0
  );

  const debts: DebtForCalculation[] = debtAccounts.map((a) => ({
    id: a.id,
    nickname: a.nickname,
    balance: a.current_balance,
    apr: a.interest_rate ?? 0,
    minimum_payment: a.minimum_payment ?? Math.max(25, a.current_balance * 0.02),
  }));

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayments = debts.reduce((s, d) => s + d.minimum_payment, 0);
  const weightedAvgRate =
    totalDebt > 0
      ? debts.reduce((s, d) => s + d.apr * (d.balance / totalDebt), 0)
      : 0;

  const debtsKey = JSON.stringify(debts);
  const result = useMemo(
    () => calculateDebtPayoff(debts, extraPayment, strategy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debtsKey, extraPayment, strategy]
  );

  // Chart data: total debt per month
  const chartData = useMemo(() => {
    if (result.debts.length === 0) return [];
    const maxLen = Math.max(...result.debts.map((d) => d.monthly_balances.length));
    const data = [];
    for (let i = 0; i < Math.min(maxLen, 360); i++) {
      const point: Record<string, number | string> = { month: i };
      let total = 0;
      for (const debt of result.debts) {
        const bal = debt.monthly_balances[i] ?? 0;
        point[debt.nickname] = Math.round(bal);
        total += bal;
      }
      point["Total"] = Math.round(total);
      data.push(point);
    }
    return data;
  }, [result]);

  if (debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingDown className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No debts to plan</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add credit cards, loans, or mortgages in the Accounts tab to create a payoff plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-bold font-tabular">{formatCurrency(totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Monthly Minimum</p>
            <p className="text-2xl font-bold font-tabular">{formatCurrency(totalMinPayments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Weighted Avg APR</p>
            <p className="text-2xl font-bold font-tabular">{formatPercent(weightedAvgRate)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Strategy</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStrategy("avalanche")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                    strategy === "avalanche"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="font-semibold">Avalanche</div>
                  <div className="text-xs mt-0.5 opacity-75">Highest APR first</div>
                </button>
                <button
                  onClick={() => setStrategy("snowball")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                    strategy === "snowball"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="font-semibold">Snowball</div>
                  <div className="text-xs mt-0.5 opacity-75">Smallest balance first</div>
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Extra Monthly Payment
              </label>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="0"
                  max="2000"
                  step="25"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(parseInt(e.target.value))}
                  className="w-full h-2 accent-primary border-0 p-0"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">$0</span>
                  <span className="font-semibold text-primary font-tabular">
                    {formatCurrency(extraPayment)}/mo
                  </span>
                  <span className="text-muted-foreground">$2,000</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-green mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Debt-Free In</span>
            </div>
            <p className="text-2xl font-bold font-tabular">
              {result.total_months < 600
                ? `${Math.floor(result.total_months / 12)}y ${result.total_months % 12}m`
                : "50+ years"}
            </p>
            <p className="text-xs text-muted-foreground font-tabular">{result.total_months} months</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Total Interest</span>
            </div>
            <p className="text-2xl font-bold font-tabular">{formatCurrency(result.total_interest_paid)}</p>
          </CardContent>
        </Card>
        <Card className="border-green/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-green mb-1">
              <ArrowDown className="h-4 w-4" />
              <span className="text-sm font-medium">Interest Saved</span>
            </div>
            <p className="text-2xl font-bold font-tabular text-green">
              {formatCurrency(result.total_interest_saved)}
            </p>
            <p className="text-xs text-muted-foreground">vs. minimum payments only</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payoff Timeline</CardTitle>
            <CardDescription>Total debt balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => `${Math.floor(v / 12)}y`}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    className="text-xs"
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Month ${label}`}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payoff Order */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payoff Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.debts
              .sort((a, b) => a.payoff_month - b.payoff_month)
              .map((debt, i) => (
                <div
                  key={debt.account_id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{debt.nickname}</p>
                    <p className="text-xs text-muted-foreground font-tabular">
                      {formatCurrency(debt.starting_balance)} @ {formatPercent(debt.apr)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium font-tabular">
                      {debt.payoff_month < 600
                        ? `Month ${debt.payoff_month}`
                        : "50+ yrs"}
                    </p>
                    <p className="text-xs text-muted-foreground font-tabular">
                      {formatCurrency(debt.interest_paid)} interest
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== HELOC REFINANCE ===================== */
function HELOCSection() {
  const [balance, setBalance] = useState("75000");
  const [currentRate, setCurrentRate] = useState("8.5");
  const [newRate, setNewRate] = useState("6.0");
  const [termYears, setTermYears] = useState("15");

  const result = useMemo(
    () =>
      calculateHELOCRefinance(
        parseFloat(balance) || 0,
        parseFloat(currentRate) || 0,
        parseFloat(newRate) || 0,
        parseInt(termYears) || 15
      ),
    [balance, currentRate, newRate, termYears]
  );

  // Chart: cumulative interest over time
  const chartData = useMemo(() => {
    const months = result.term_months;
    const data = [];
    const bal = parseFloat(balance) || 0;
    const currentMonthly = result.current_monthly;
    const newMonthly = result.new_monthly;

    for (let m = 0; m <= months; m += Math.max(1, Math.floor(months / 60))) {
      const cumulativeCurrent = currentMonthly * m;

      data.push({
        month: m,
        "Current (Interest-Only)": Math.round(cumulativeCurrent),
        "New (Fixed-Rate)": Math.round(Math.max(0, newMonthly * m - bal)),
      });
    }
    return data;
  }, [balance, result]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            HELOC / Interest-Only Refinance Calculator
          </CardTitle>
          <CardDescription>
            Compare your current interest-only payments against a fixed-rate amortizing loan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="75000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                placeholder="8.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">New Fixed Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="6.0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Term (Years)</label>
              <Input
                type="number"
                value={termYears}
                onChange={(e) => setTermYears(e.target.value)}
                placeholder="15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-red/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red">Current: Interest-Only</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="text-2xl font-bold font-tabular">{formatCurrency(result.current_monthly)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Interest ({parseInt(termYears) || 15} yrs)
              </p>
              <p className="text-xl font-bold font-tabular text-red">
                {formatCurrency(result.current_total_interest)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Principal never decreases — every dollar goes to interest.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green">New: Fixed-Rate Amortizing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="text-2xl font-bold font-tabular">{formatCurrency(result.new_monthly)}</p>
              {result.new_monthly > result.current_monthly && (
                <p className="text-xs text-amber mt-1">
                  +{formatCurrency(result.new_monthly - result.current_monthly)}/mo higher
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Interest ({parseInt(termYears) || 15} yrs)
              </p>
              <p className="text-xl font-bold font-tabular text-green">
                {formatCurrency(result.new_total_interest)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Every dollar builds equity instead of disappearing.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings */}
      {result.interest_saved > 0 && (
        <Card className="border-green/30 bg-green-bg/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Total Interest Saved</p>
            <p className="text-3xl font-bold font-tabular text-green mt-1">
              {formatCurrency(result.interest_saved)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              over {parseInt(termYears) || 15} years by refinancing to a fixed rate
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cumulative Interest Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => `${Math.floor(v / 12)}y`}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    className="text-xs"
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Month ${label}`}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Current (Interest-Only)"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="New (Fixed-Rate)"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
