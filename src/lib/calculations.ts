import type {
  IncomeSource,
  Expense,
  Account,
  DebtForCalculation,
  DebtPayoffSnapshot,
  DebtPayoffEntry,
  DebtStrategy,
  HELOCComparison,
  CategoryRecommendation,
  CardProduct,
  RewardUnit,
} from "./types";

/**
 * 6.1 Net Monthly Position
 */
export function calculateNetPosition(
  incomeSources: IncomeSource[],
  expenses: Expense[],
  debtAccounts: Account[]
): { stableIncome: number; totalExpenses: number; netPosition: number } {
  const stableIncome = incomeSources
    .filter((s) => s.is_stable)
    .reduce((sum, s) => sum + s.amount, 0);

  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const debtPayments = debtAccounts.reduce(
    (sum, a) => sum + (a.regular_payment ?? 0),
    0
  );
  const totalExpenses = expenseTotal + debtPayments;

  return {
    stableIncome,
    totalExpenses,
    netPosition: stableIncome - totalExpenses,
  };
}

/**
 * 6.2 Credit Utilization
 */
export function calculateCreditUtilization(
  creditCards: Account[]
): { utilization: number; totalBalance: number; totalLimit: number } {
  const totalBalance = creditCards.reduce(
    (sum, c) => sum + c.current_balance,
    0
  );
  const totalLimit = creditCards.reduce(
    (sum, c) => sum + (c.credit_limit ?? 0),
    0
  );

  if (totalLimit === 0) {
    return { utilization: 0, totalBalance, totalLimit };
  }

  return {
    utilization: (totalBalance / totalLimit) * 100,
    totalBalance,
    totalLimit,
  };
}

/**
 * 6.3 Debt Avalanche / Snowball Calculator
 */
export function calculateDebtPayoff(
  debts: DebtForCalculation[],
  extraMonthlyPayment: number,
  strategy: DebtStrategy
): DebtPayoffSnapshot {
  if (debts.length === 0) {
    return {
      debts: [],
      total_months: 0,
      total_interest_paid: 0,
      total_interest_saved: 0,
    };
  }

  const MAX_MONTHS = 600;

  function simulate(
    inputDebts: DebtForCalculation[],
    extra: number
  ): { entries: DebtPayoffEntry[]; totalMonths: number; totalInterest: number } {
    const sorted = [...inputDebts].sort((a, b) => {
      if (strategy === "avalanche") return b.apr - a.apr;
      return a.balance - b.balance;
    });

    const state = sorted.map((d) => ({
      ...d,
      balance: d.balance,
      minimum_payment: d.minimum_payment || Math.max(25, d.balance * 0.02),
      monthlyBalances: [d.balance] as number[],
      payoffMonth: 0,
      interestPaid: 0,
    }));

    let month = 0;
    let allPaidOff = false;

    while (!allPaidOff && month < MAX_MONTHS) {
      month++;
      let remainingExtra = extra;

      // Apply interest
      for (const debt of state) {
        if (debt.balance <= 0) continue;
        const monthlyInterest = debt.balance * (debt.apr / 12 / 100);
        debt.balance += monthlyInterest;
        debt.interestPaid += monthlyInterest;
      }

      // Apply minimum payments
      for (const debt of state) {
        if (debt.balance <= 0) continue;
        const payment = Math.min(debt.minimum_payment, debt.balance);
        debt.balance -= payment;
        if (debt.balance <= 0.01) {
          debt.balance = 0;
          if (debt.payoffMonth === 0) debt.payoffMonth = month;
        }
      }

      // Apply extra payment to first unpaid debt in sorted order
      for (const debt of state) {
        if (debt.balance <= 0 || remainingExtra <= 0) continue;
        const payment = Math.min(remainingExtra, debt.balance);
        debt.balance -= payment;
        remainingExtra -= payment;
        if (debt.balance <= 0.01) {
          debt.balance = 0;
          if (debt.payoffMonth === 0) debt.payoffMonth = month;
          // Cascade: freed-up minimum payment becomes extra
          remainingExtra += debt.minimum_payment;
        }
      }

      // Record balances
      for (const debt of state) {
        debt.monthlyBalances.push(Math.max(0, debt.balance));
      }

      allPaidOff = state.every((d) => d.balance <= 0);
    }

    // Set payoff month for any that never paid off
    for (const debt of state) {
      if (debt.payoffMonth === 0 && debt.balance > 0) {
        debt.payoffMonth = MAX_MONTHS;
      }
    }

    const entries: DebtPayoffEntry[] = state.map((d) => ({
      account_id: d.id,
      nickname: d.nickname,
      starting_balance: inputDebts.find((dd) => dd.id === d.id)?.balance ?? 0,
      apr: d.apr,
      minimum_payment: d.minimum_payment,
      payoff_month: d.payoffMonth,
      interest_paid: Math.round(d.interestPaid * 100) / 100,
      monthly_balances: d.monthlyBalances,
    }));

    return {
      entries,
      totalMonths: Math.max(...state.map((d) => d.payoffMonth)),
      totalInterest: entries.reduce((sum, e) => sum + e.interest_paid, 0),
    };
  }

  const withExtra = simulate(debts, extraMonthlyPayment);
  const baseline = simulate(debts, 0);

  return {
    debts: withExtra.entries,
    total_months: withExtra.totalMonths,
    total_interest_paid: Math.round(withExtra.totalInterest * 100) / 100,
    total_interest_saved:
      Math.round((baseline.totalInterest - withExtra.totalInterest) * 100) /
      100,
  };
}

/**
 * 6.4 HELOC / Interest-Only Loan Refinance Calculator
 */
export function calculateHELOCRefinance(
  balance: number,
  currentRate: number,
  newFixedRate: number,
  termYears: number
): HELOCComparison {
  const termMonths = termYears * 12;
  const currentMonthly = balance * (currentRate / 12 / 100);
  const currentTotalInterest = currentMonthly * termMonths;

  const r = newFixedRate / 12 / 100;
  const n = termMonths;
  let newMonthly: number;
  let newTotalInterest: number;

  if (r === 0) {
    newMonthly = balance / n;
    newTotalInterest = 0;
  } else {
    newMonthly = (balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    newTotalInterest = newMonthly * n - balance;
  }

  return {
    current_monthly: Math.round(currentMonthly * 100) / 100,
    new_monthly: Math.round(newMonthly * 100) / 100,
    current_total_interest: Math.round(currentTotalInterest * 100) / 100,
    new_total_interest: Math.round(newTotalInterest * 100) / 100,
    interest_saved:
      Math.round((currentTotalInterest - newTotalInterest) * 100) / 100,
    term_months: termMonths,
  };
}

/**
 * 6.5 Card Rewards Guide Matching
 */
export function matchBestCards(
  userCards: Array<{
    account_id: string;
    nickname: string;
    current_balance: number;
    card_product: CardProduct | null;
    annual_fee: number;
  }>,
  categories: readonly string[]
): CategoryRecommendation[] {
  const recommendations: CategoryRecommendation[] = [];

  // Cards carrying a balance should not be recommended
  const eligibleCards = userCards.filter((c) => c.current_balance <= 0);

  for (const category of categories) {
    let bestCard: (typeof userCards)[0] | null = null;
    let bestRate = 0;
    let bestUnit: RewardUnit = "cash_back";

    for (const card of eligibleCards) {
      if (!card.card_product) continue;
      const match = card.card_product.reward_categories.find(
        (rc) => rc.category === category
      );
      if (match && match.rate > bestRate) {
        bestRate = match.rate;
        bestUnit = match.unit;
        bestCard = card;
      } else if (match && match.rate === bestRate && bestCard) {
        // Tie-break: lowest annual fee
        if (card.annual_fee < bestCard.annual_fee) {
          bestCard = card;
          bestUnit = match.unit;
        }
      }
    }

    // Fallback to best "everything_else" rate
    if (!bestCard && category !== "everything_else") {
      for (const card of eligibleCards) {
        if (!card.card_product) continue;
        const fallback = card.card_product.reward_categories.find(
          (rc) => rc.category === "everything_else"
        );
        if (fallback && fallback.rate > bestRate) {
          bestRate = fallback.rate;
          bestUnit = fallback.unit;
          bestCard = card;
        }
      }
    }

    if (bestCard && bestCard.card_product) {
      recommendations.push({
        category,
        card_nickname: bestCard.nickname,
        card_issuer: bestCard.card_product.issuer,
        card_product: bestCard.card_product.product_name,
        rate: bestRate,
        unit: bestUnit,
        account_id: bestCard.account_id,
      });
    }
  }

  return recommendations;
}

/**
 * 6.6 Card Benefits Tracker — days until expiry
 */
export function daysUntilExpiry(expiresOn: string | null): number | null {
  if (!expiresOn) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresOn);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
