// Response shapes for the Cashboard JSON API. Declared here (not imported from
// the app) so the tests treat the API as a black box with its own contract.

export interface ProjectionInput {
  startingValue: number;
  monthlyContribution: number;
  annualReturnPct: number;
  years: number;
  startYear: number;
}

export interface ProjectionPoint {
  year: number;
  total: number;
  contributed: number;
}

export interface ProjectionSummary {
  finalYear: number;
  total: number;
  contributed: number;
  growth: number;
}

export interface ProjectionResponse {
  input: ProjectionInput;
  points: ProjectionPoint[];
  summary: ProjectionSummary;
}

export interface ErrorResponse {
  error: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: string;
  currency: string;
  balance: number;
}

export interface AccountsResponse {
  accounts: Account[];
  totals: { bank: number; cash: number; debt: number };
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  lastPrice: number;
  marketValue: number;
  pl: number;
  plPct: number;
}

export interface PortfolioResponse {
  cash: number;
  currency: string;
  asOf: string;
  positions: PortfolioPosition[];
  totals: { value: number; cost: number; pl: number };
}

export interface NetWorthPoint {
  date: string;
  netWorth: number;
}

export interface NetWorthResponse {
  current: number;
  history: NetWorthPoint[];
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface TransactionsResponse {
  count: number;
  transactions: Transaction[];
}

export interface SummaryResponse {
  netWorth: number;
  cash: number;
  investments: number;
  investmentsPL: number;
  spendThisMonth: number;
  incomeThisMonth: number;
  momDelta: number;
  momPct: number;
  asOf: string;
}

export interface HealthResponse {
  status: string;
  asOf: string;
}
