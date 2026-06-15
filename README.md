# MoneyMap

All-in-one personal finance app: budgeting, debt payoff planning, and credit card rewards optimization.

## Overview

MoneyMap helps households understand their complete financial picture in one place. It combines:

- **Financial Dashboard** — Net position, total debt, credit utilization, and key alerts at a glance
- **Account Tracking** — Manually track bank accounts, credit cards, mortgages, auto loans, HELOCs, and personal loans
- **Debt Payoff Planner** — Avalanche and snowball calculators with interactive extra-payment slider and payoff timeline charts
- **HELOC Refinance Calculator** — Compare interest-only vs. fixed-rate amortizing loans side-by-side
- **Credit Card Rewards Guide** — Category-by-category "best card to use" recommendations based on your wallet
- **Benefits Tracker** — Track expiring card credits and recurring benefits with reminders
- **Income & Expense Tracking** — Stable vs. variable income, recurring bills with due dates

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + custom design tokens
- **UI Components**: Custom components inspired by shadcn/ui patterns
- **Charts**: [Recharts](https://recharts.org/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Netlify](https://netlify.com/)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   └── (app)/                # App layout with sidebar/bottom nav
│       ├── dashboard/        # Financial overview
│       ├── accounts/         # Account, income, expense management
│       ├── debt-plan/        # Debt payoff + HELOC calculator
│       ├── rewards/          # Card rewards guide + benefits tracker
│       └── settings/         # Theme, export, data management
├── components/
│   ├── nav-shell.tsx         # Responsive navigation (sidebar + bottom tabs)
│   ├── theme-provider.tsx    # Light/dark/system theme
│   └── ui/                   # Reusable UI primitives
└── lib/
    ├── calculations.ts       # Financial calculation engine
    ├── store.ts              # Zustand store with all CRUD operations
    ├── types.ts              # TypeScript type definitions
    └── utils.ts              # Utility functions
```

## Data Privacy

All data is stored locally in your browser's localStorage. Nothing is sent to any server. You can export your data as JSON or CSV from Settings, and delete all data at any time.

## License

Private — not open source.
