import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  Account,
  IncomeSource,
  Expense,
  CardBenefit,
  CardProduct,
  DebtPlan,
} from "./types";

interface MoneyMapState {
  // Data
  accounts: Account[];
  incomeSources: IncomeSource[];
  expenses: Expense[];
  cardBenefits: CardBenefit[];
  cardProducts: CardProduct[];
  debtPlans: DebtPlan[];

  // Account CRUD
  addAccount: (account: Omit<Account, "id" | "user_id" | "created_at" | "updated_at">) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Income CRUD
  addIncomeSource: (source: Omit<IncomeSource, "id" | "user_id">) => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;

  // Expense CRUD
  addExpense: (expense: Omit<Expense, "id" | "user_id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Card Benefits CRUD
  addCardBenefit: (benefit: Omit<CardBenefit, "id" | "user_id">) => void;
  updateCardBenefit: (id: string, updates: Partial<CardBenefit>) => void;
  deleteCardBenefit: (id: string) => void;

  // Debt Plans
  saveDebtPlan: (plan: Omit<DebtPlan, "id" | "user_id" | "created_at">) => void;

  // Bulk
  clearAll: () => void;
}

const now = () => new Date().toISOString();
const USER_ID = "local-user";

export const useStore = create<MoneyMapState>()(
  persist(
    (set) => ({
      accounts: [],
      incomeSources: [],
      expenses: [],
      cardBenefits: [],
      cardProducts: defaultCardProducts(),
      debtPlans: [],

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...account, id: uuidv4(), user_id: USER_ID, created_at: now(), updated_at: now() },
          ],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates, updated_at: now() } : a
          ),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          expenses: state.expenses.filter((e) => e.account_id !== id),
          cardBenefits: state.cardBenefits.filter((b) => b.account_id !== id),
        })),

      addIncomeSource: (source) =>
        set((state) => ({
          incomeSources: [
            ...state.incomeSources,
            { ...source, id: uuidv4(), user_id: USER_ID },
          ],
        })),

      updateIncomeSource: (id, updates) =>
        set((state) => ({
          incomeSources: state.incomeSources.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteIncomeSource: (id) =>
        set((state) => ({
          incomeSources: state.incomeSources.filter((s) => s.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: uuidv4(), user_id: USER_ID },
          ],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addCardBenefit: (benefit) =>
        set((state) => ({
          cardBenefits: [
            ...state.cardBenefits,
            { ...benefit, id: uuidv4(), user_id: USER_ID },
          ],
        })),

      updateCardBenefit: (id, updates) =>
        set((state) => ({
          cardBenefits: state.cardBenefits.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      deleteCardBenefit: (id) =>
        set((state) => ({
          cardBenefits: state.cardBenefits.filter((b) => b.id !== id),
        })),

      saveDebtPlan: (plan) =>
        set((state) => ({
          debtPlans: [
            { ...plan, id: uuidv4(), user_id: USER_ID, created_at: now() },
            ...state.debtPlans,
          ],
        })),

      clearAll: () =>
        set({
          accounts: [],
          incomeSources: [],
          expenses: [],
          cardBenefits: [],
          debtPlans: [],
        }),
    }),
    { name: "moneymap-storage" }
  )
);

function defaultCardProducts(): CardProduct[] {
  return [
    {
      id: "cp-chase-sapphire-preferred",
      issuer: "Chase",
      product_name: "Sapphire Preferred",
      annual_fee: 95,
      reward_categories: [
        { category: "dining", rate: 3, unit: "points" },
        { category: "online_retail", rate: 3, unit: "points" },
        { category: "travel", rate: 2, unit: "points" },
        { category: "everything_else", rate: 1, unit: "points" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-chase-freedom-unlimited",
      issuer: "Chase",
      product_name: "Freedom Unlimited",
      annual_fee: 0,
      reward_categories: [
        { category: "dining", rate: 3, unit: "cash_back" },
        { category: "drugstores", rate: 3, unit: "cash_back" },
        { category: "travel", rate: 5, unit: "cash_back" },
        { category: "everything_else", rate: 1.5, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-amex-gold",
      issuer: "American Express",
      product_name: "Gold Card",
      annual_fee: 250,
      reward_categories: [
        { category: "dining", rate: 4, unit: "points" },
        { category: "groceries", rate: 4, unit: "points" },
        { category: "everything_else", rate: 1, unit: "points" },
      ],
      recurring_benefits: [
        { name: "Uber Cash", amount: 10, frequency: "monthly" },
        { name: "Dining Credit", amount: 10, frequency: "monthly" },
      ],
    },
    {
      id: "cp-amex-platinum",
      issuer: "American Express",
      product_name: "Platinum Card",
      annual_fee: 695,
      reward_categories: [
        { category: "travel", rate: 5, unit: "points" },
        { category: "hotels", rate: 5, unit: "points" },
        { category: "everything_else", rate: 1, unit: "points" },
      ],
      recurring_benefits: [
        { name: "Uber Cash", amount: 15, frequency: "monthly" },
        { name: "Walmart+ Credit", amount: 12.95, frequency: "monthly" },
        { name: "Digital Entertainment", amount: 20, frequency: "monthly" },
        { name: "Saks Credit", amount: 50, frequency: "quarterly" },
        { name: "Airline Fee Credit", amount: 200, frequency: "annual" },
        { name: "Hotel Credit", amount: 200, frequency: "annual" },
      ],
    },
    {
      id: "cp-citi-double-cash",
      issuer: "Citi",
      product_name: "Double Cash",
      annual_fee: 0,
      reward_categories: [
        { category: "everything_else", rate: 2, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-discover-it",
      issuer: "Discover",
      product_name: "it Cash Back",
      annual_fee: 0,
      reward_categories: [
        { category: "everything_else", rate: 1, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-capital-one-savor",
      issuer: "Capital One",
      product_name: "SavorOne",
      annual_fee: 0,
      reward_categories: [
        { category: "dining", rate: 3, unit: "cash_back" },
        { category: "groceries", rate: 3, unit: "cash_back" },
        { category: "online_retail", rate: 3, unit: "cash_back" },
        { category: "everything_else", rate: 1, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-capital-one-venture",
      issuer: "Capital One",
      product_name: "Venture X",
      annual_fee: 395,
      reward_categories: [
        { category: "travel", rate: 10, unit: "miles" },
        { category: "hotels", rate: 10, unit: "miles" },
        { category: "everything_else", rate: 2, unit: "miles" },
      ],
      recurring_benefits: [
        { name: "Travel Credit", amount: 300, frequency: "annual" },
      ],
    },
    {
      id: "cp-bofA-custom-cash",
      issuer: "Bank of America",
      product_name: "Customized Cash Rewards",
      annual_fee: 0,
      reward_categories: [
        { category: "gas", rate: 3, unit: "cash_back" },
        { category: "online_retail", rate: 3, unit: "cash_back" },
        { category: "dining", rate: 2, unit: "cash_back" },
        { category: "everything_else", rate: 1, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
    {
      id: "cp-wells-fargo-active-cash",
      issuer: "Wells Fargo",
      product_name: "Active Cash",
      annual_fee: 0,
      reward_categories: [
        { category: "everything_else", rate: 2, unit: "cash_back" },
      ],
      recurring_benefits: [],
    },
  ];
}
