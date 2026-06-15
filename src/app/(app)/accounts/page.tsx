"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import {
  ACCOUNT_TYPE_LABELS,
  EXPENSE_CATEGORY_LABELS,
  type AccountType,
  type Account,
  type IncomeSource,
  type Expense,
  type IncomeFrequency,
  type ExpenseCategory,
  type InterestType,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  CreditCard,
  Home,
  Car,
  Wallet,
  DollarSign,
  Receipt,
} from "lucide-react";

type Tab = "accounts" | "income" | "expenses";

export default function AccountsPage() {
  const [tab, setTab] = useState<Tab>("accounts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {(["accounts", "income", "expenses"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "accounts" ? "Accounts" : t === "income" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      {tab === "accounts" && <AccountsList />}
      {tab === "income" && <IncomeList />}
      {tab === "expenses" && <ExpensesList />}
    </div>
  );
}

/* ===================== ACCOUNTS ===================== */
function AccountsList() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const groups: Record<string, Account[]> = {
    "Bank Accounts": accounts.filter(
      (a) => a.account_type === "checking" || a.account_type === "savings"
    ),
    "Credit Cards": accounts.filter((a) => a.account_type === "credit_card"),
    "Loans & Mortgages": accounts.filter((a) =>
      ["mortgage", "auto_loan", "personal_loan", "heloc", "other"].includes(a.account_type)
    ),
  };

  const accountIcon = (type: AccountType) => {
    switch (type) {
      case "checking":
      case "savings":
        return <Building2 className="h-4 w-4" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      case "mortgage":
      case "heloc":
        return <Home className="h-4 w-4" />;
      case "auto_loan":
        return <Car className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No accounts yet. Add your first account to get started.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groups).map(
          ([group, accts]) =>
            accts.length > 0 && (
              <Card key={group}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {accts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                        {accountIcon(account.account_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{account.nickname}</p>
                          <Badge variant="outline" className="text-xs">
                            {ACCOUNT_TYPE_LABELS[account.account_type]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{account.institution_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold font-tabular text-sm">
                          {formatCurrency(account.current_balance)}
                        </p>
                        {account.interest_rate !== null && (
                          <p className="text-xs text-muted-foreground font-tabular">
                            {formatPercent(account.interest_rate)} APR
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(account);
                            setDialogOpen(true);
                          }}
                          className="p-1.5 rounded text-muted-foreground hover:bg-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-red-bg hover:text-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
        )
      )}

      <AccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        account={editing}
        onSave={(data) => {
          if (editing) {
            updateAccount(editing.id, data);
          } else {
            addAccount(data);
          }
          setDialogOpen(false);
        }}
      />
    </>
  );
}

/* ===================== ACCOUNT DIALOG ===================== */
function AccountDialog({
  open,
  onClose,
  account,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (data: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => void;
}) {
  const [nickname, setNickname] = useState(account?.nickname ?? "");
  const [institution, setInstitution] = useState(account?.institution_name ?? "");
  const [accountType, setAccountType] = useState<AccountType>(account?.account_type ?? "checking");
  const [balance, setBalance] = useState(account?.current_balance?.toString() ?? "");
  const [creditLimit, setCreditLimit] = useState(account?.credit_limit?.toString() ?? "");
  const [interestRate, setInterestRate] = useState(account?.interest_rate?.toString() ?? "");
  const [interestType, setInterestType] = useState<InterestType | "">(account?.interest_type ?? "");
  const [minPayment, setMinPayment] = useState(account?.minimum_payment?.toString() ?? "");
  const [regularPayment, setRegularPayment] = useState(account?.regular_payment?.toString() ?? "");
  const [paymentDueDay, setPaymentDueDay] = useState(account?.payment_due_day?.toString() ?? "");
  const [isInterestOnly, setIsInterestOnly] = useState(account?.is_interest_only ?? false);
  const [lastFour, setLastFour] = useState(account?.last_four ?? "");
  const [annualFee, setAnnualFee] = useState(account?.annual_fee?.toString() ?? "");

  // Reset form when dialog opens with different account
  const [prevAccount, setPrevAccount] = useState<string | null>(null);
  const currentId = account?.id ?? null;
  if (currentId !== prevAccount && open) {
    setPrevAccount(currentId);
    setNickname(account?.nickname ?? "");
    setInstitution(account?.institution_name ?? "");
    setAccountType(account?.account_type ?? "checking");
    setBalance(account?.current_balance?.toString() ?? "");
    setCreditLimit(account?.credit_limit?.toString() ?? "");
    setInterestRate(account?.interest_rate?.toString() ?? "");
    setInterestType(account?.interest_type ?? "");
    setMinPayment(account?.minimum_payment?.toString() ?? "");
    setRegularPayment(account?.regular_payment?.toString() ?? "");
    setPaymentDueDay(account?.payment_due_day?.toString() ?? "");
    setIsInterestOnly(account?.is_interest_only ?? false);
    setLastFour(account?.last_four ?? "");
    setAnnualFee(account?.annual_fee?.toString() ?? "");
  }

  const isDebt = ["credit_card", "mortgage", "auto_loan", "personal_loan", "heloc", "other"].includes(accountType);
  const isCard = accountType === "credit_card";

  const handleSave = () => {
    onSave({
      nickname: nickname.trim(),
      institution_name: institution.trim(),
      account_type: accountType,
      current_balance: parseFloat(balance) || 0,
      credit_limit: creditLimit ? parseFloat(creditLimit) : null,
      interest_rate: interestRate ? parseFloat(interestRate) : null,
      interest_type: interestType || null,
      minimum_payment: minPayment ? parseFloat(minPayment) : null,
      regular_payment: regularPayment ? parseFloat(regularPayment) : null,
      payment_due_day: paymentDueDay ? parseInt(paymentDueDay) : null,
      is_interest_only: isInterestOnly,
      origination_date: null,
      maturity_date: null,
      last_four: lastFour || null,
      annual_fee: annualFee ? parseFloat(annualFee) : null,
      card_product_id: null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{account ? "Edit Account" : "Add Account"}</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Account Type</label>
            <Select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">Nickname</label>
            <Input placeholder="e.g. Chase Checking" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">Institution</label>
            <Input placeholder="e.g. Chase" value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-medium text-muted-foreground">
              {isDebt ? "Amount Owed" : "Balance"}
            </label>
            <Input type="number" placeholder="0.00" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>
          {(isCard || accountType === "heloc") && (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
              <Input type="number" placeholder="0.00" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
            </div>
          )}
          {isDebt && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">APR (%)</label>
                <Input type="number" step="0.01" placeholder="0.00" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Rate Type</label>
                <Select value={interestType} onChange={(e) => setInterestType(e.target.value as InterestType | "")}>
                  <option value="">Select...</option>
                  <option value="fixed">Fixed</option>
                  <option value="variable">Variable</option>
                </Select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Minimum Payment</label>
                <Input type="number" placeholder="0.00" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Regular Payment</label>
                <Input type="number" placeholder="0.00" value={regularPayment} onChange={(e) => setRegularPayment(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Due Day (1-31)</label>
                <Input type="number" min="1" max="31" placeholder="15" value={paymentDueDay} onChange={(e) => setPaymentDueDay(e.target.value)} />
              </div>
              {accountType === "heloc" && (
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="interest-only"
                    checked={isInterestOnly}
                    onChange={(e) => setIsInterestOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="interest-only" className="text-sm font-medium text-muted-foreground">
                    Interest-only payments
                  </label>
                </div>
              )}
            </>
          )}
          {isCard && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Last 4 Digits</label>
                <Input maxLength={4} placeholder="1234" value={lastFour} onChange={(e) => setLastFour(e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Annual Fee</label>
                <Input type="number" placeholder="0" value={annualFee} onChange={(e) => setAnnualFee(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!nickname.trim()}>
          {account ? "Save Changes" : "Add Account"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== INCOME ===================== */
function IncomeList() {
  const { incomeSources, addIncomeSource, updateIncomeSource, deleteIncomeSource } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeSource | null>(null);

  const stableTotal = incomeSources.filter((s) => s.is_stable).reduce((s, i) => s + i.amount, 0);
  const variableTotal = incomeSources.filter((s) => !s.is_stable).reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Stable: <span className="font-medium text-green">{formatCurrency(stableTotal)}</span>
          {variableTotal > 0 && (
            <>
              {" "}&middot; Variable: <span className="font-medium text-amber">{formatCurrency(variableTotal)}</span>
            </>
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Income
        </Button>
      </div>

      {incomeSources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No income sources yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border">
            {incomeSources.map((source) => (
              <div key={source.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{source.name}</p>
                    <Badge variant={source.is_stable ? "green" : "amber"}>
                      {source.is_stable ? "Stable" : "Variable"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{source.frequency}</p>
                </div>
                <p className="font-semibold font-tabular text-sm">{formatCurrency(source.amount)}/mo</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(source);
                      setDialogOpen(true);
                    }}
                    className="p-1.5 rounded text-muted-foreground hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteIncomeSource(source.id)}
                    className="p-1.5 rounded text-muted-foreground hover:bg-red-bg hover:text-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <IncomeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        source={editing}
        onSave={(data) => {
          if (editing) {
            updateIncomeSource(editing.id, data);
          } else {
            addIncomeSource(data);
          }
          setDialogOpen(false);
        }}
      />
    </>
  );
}

function IncomeDialog({
  open,
  onClose,
  source,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  source: IncomeSource | null;
  onSave: (data: Omit<IncomeSource, "id" | "user_id">) => void;
}) {
  const [name, setName] = useState(source?.name ?? "");
  const [amount, setAmount] = useState(source?.amount?.toString() ?? "");
  const [frequency, setFrequency] = useState<IncomeFrequency>(source?.frequency ?? "monthly");
  const [isStable, setIsStable] = useState(source?.is_stable ?? true);
  const [notes, setNotes] = useState(source?.notes ?? "");

  const [prevId, setPrevId] = useState<string | null>(null);
  if ((source?.id ?? null) !== prevId && open) {
    setPrevId(source?.id ?? null);
    setName(source?.name ?? "");
    setAmount(source?.amount?.toString() ?? "");
    setFrequency(source?.frequency ?? "monthly");
    setIsStable(source?.is_stable ?? true);
    setNotes(source?.notes ?? "");
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{source ? "Edit Income" : "Add Income"}</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <Input placeholder="e.g. Payroll, Airbnb" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Monthly Amount</label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Frequency</label>
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="irregular">Irregular</option>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="stable-income"
            checked={isStable}
            onChange={(e) => setIsStable(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="stable-income" className="text-sm font-medium text-muted-foreground">
            Stable / reliable income
          </label>
        </div>
        {!isStable && (
          <p className="text-xs text-amber bg-amber-bg px-3 py-2 rounded-lg">
            Variable income is excluded from your Net Position calculation. It won&apos;t be counted toward fixed obligations.
          </p>
        )}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
          <Input placeholder="Any additional details" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave({ name, amount: parseFloat(amount) || 0, frequency, is_stable: isStable, notes: notes || null })} disabled={!name.trim()}>
          {source ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ===================== EXPENSES ===================== */
function ExpensesList() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{formatCurrency(totalExpenses)}/mo</span>
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No expenses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{expense.name}</p>
                    <Badge variant="outline">{EXPENSE_CATEGORY_LABELS[expense.category]}</Badge>
                  </div>
                  {expense.due_day && (
                    <p className="text-xs text-muted-foreground">Due day {expense.due_day}</p>
                  )}
                </div>
                <p className="font-semibold font-tabular text-sm">{formatCurrency(expense.amount)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(expense);
                      setDialogOpen(true);
                    }}
                    className="p-1.5 rounded text-muted-foreground hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-1.5 rounded text-muted-foreground hover:bg-red-bg hover:text-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        expense={editing}
        onSave={(data) => {
          if (editing) {
            updateExpense(editing.id, data);
          } else {
            addExpense(data);
          }
          setDialogOpen(false);
        }}
      />
    </>
  );
}

function ExpenseDialog({
  open,
  onClose,
  expense,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (data: Omit<Expense, "id" | "user_id">) => void;
}) {
  const [name, setName] = useState(expense?.name ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "other");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [dueDay, setDueDay] = useState(expense?.due_day?.toString() ?? "");
  const [isRecurring, setIsRecurring] = useState(expense?.is_recurring ?? true);

  const [prevId, setPrevId] = useState<string | null>(null);
  if ((expense?.id ?? null) !== prevId && open) {
    setPrevId(expense?.id ?? null);
    setName(expense?.name ?? "");
    setCategory(expense?.category ?? "other");
    setAmount(expense?.amount?.toString() ?? "");
    setDueDay(expense?.due_day?.toString() ?? "");
    setIsRecurring(expense?.is_recurring ?? true);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <Input placeholder="e.g. Electric — Main St" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Due Day (1-31)</label>
            <Input type="number" min="1" max="31" placeholder="15" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-muted-foreground">
                Recurring
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() =>
            onSave({
              name,
              category,
              amount: parseFloat(amount) || 0,
              due_day: dueDay ? parseInt(dueDay) : null,
              is_recurring: isRecurring,
              account_id: null,
            })
          }
          disabled={!name.trim()}
        >
          {expense ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
