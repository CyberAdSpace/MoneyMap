export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "mortgage"
  | "auto_loan"
  | "personal_loan"
  | "heloc"
  | "other";

export type InterestType = "fixed" | "variable";

export type IncomeFrequency = "weekly" | "biweekly" | "monthly" | "irregular";

export type ExpenseCategory =
  | "housing"
  | "utilities"
  | "insurance"
  | "debt_payment"
  | "subscription"
  | "other";

export type BenefitFrequency = "monthly" | "quarterly" | "annual" | "one_time";

export type DebtStrategy = "avalanche" | "snowball";

export type RewardUnit = "points" | "miles" | "cash_back";

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  nickname: string;
  institution_name: string;
  account_type: AccountType;
  current_balance: number;
  credit_limit: number | null;
  interest_rate: number | null;
  interest_type: InterestType | null;
  minimum_payment: number | null;
  regular_payment: number | null;
  payment_due_day: number | null;
  is_interest_only: boolean;
  origination_date: string | null;
  maturity_date: string | null;
  last_four: string | null;
  annual_fee: number | null;
  card_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  is_stable: boolean;
  notes: string | null;
}

export interface Expense {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  category: ExpenseCategory;
  amount: number;
  due_day: number | null;
  is_recurring: boolean;
}

export interface CardProduct {
  id: string;
  issuer: string;
  product_name: string;
  annual_fee: number;
  reward_categories: RewardCategory[];
  recurring_benefits: RecurringBenefit[];
}

export interface RewardCategory {
  category: string;
  rate: number;
  unit: RewardUnit;
}

export interface RecurringBenefit {
  name: string;
  amount: number;
  frequency: BenefitFrequency;
}

export interface CardBenefit {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  total_value: number;
  remaining_value: number;
  frequency: BenefitFrequency;
  expires_on: string | null;
  claimed: boolean;
  instructions: string | null;
}

export interface DebtPlan {
  id: string;
  user_id: string;
  strategy: DebtStrategy;
  extra_monthly_payment: number;
  created_at: string;
  snapshot: DebtPayoffSnapshot;
}

export interface DebtPayoffSnapshot {
  debts: DebtPayoffEntry[];
  total_months: number;
  total_interest_paid: number;
  total_interest_saved: number;
}

export interface DebtPayoffEntry {
  account_id: string;
  nickname: string;
  starting_balance: number;
  apr: number;
  minimum_payment: number;
  payoff_month: number;
  interest_paid: number;
  monthly_balances: number[];
}

export interface DebtForCalculation {
  id: string;
  nickname: string;
  balance: number;
  apr: number;
  minimum_payment: number;
}

export interface HELOCComparison {
  current_monthly: number;
  new_monthly: number;
  current_total_interest: number;
  new_total_interest: number;
  interest_saved: number;
  term_months: number;
}

export interface CategoryRecommendation {
  category: string;
  card_nickname: string;
  card_issuer: string;
  card_product: string;
  rate: number;
  unit: RewardUnit;
  account_id: string;
}

export const DEBT_ACCOUNT_TYPES: AccountType[] = [
  "credit_card",
  "mortgage",
  "auto_loan",
  "personal_loan",
  "heloc",
];

export const SPENDING_CATEGORIES = [
  "groceries",
  "dining",
  "gas",
  "travel",
  "hotels",
  "online_retail",
  "drugstores",
  "everything_else",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

export const SPENDING_CATEGORY_LABELS: Record<SpendingCategory, string> = {
  groceries: "Groceries",
  dining: "Dining",
  gas: "Gas",
  travel: "Travel / Flights",
  hotels: "Hotels",
  online_retail: "Online Retail",
  drugstores: "Drugstores",
  everything_else: "Everything Else",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  auto_loan: "Auto Loan",
  personal_loan: "Personal Loan",
  heloc: "HELOC",
  other: "Other",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: "Housing",
  utilities: "Utilities",
  insurance: "Insurance",
  debt_payment: "Debt Payment",
  subscription: "Subscription",
  other: "Other",
};
