import type { FinanceAccount, FinanceBudget, FinanceTransaction } from '../types';

export type FinancePeriod = 'week' | 'month' | 'year' | 'all';

export function parseMoney(value: number | string | null | undefined): number {
  const parsed = Number(typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDate(dateValue?: string | null): string {
  if (!dateValue) return toISODateString(new Date());

  const candidate = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(candidate.getTime())) {
    return toISODateString(new Date());
  }

  return toISODateString(candidate);
}

export function formatCurrency(value: number, currency = 'INR'): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `₹${safeValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
}

export function getFilteredTransactions(
  transactions: FinanceTransaction[],
  period: FinancePeriod = 'month'
): FinanceTransaction[] {
  const now = new Date();
  const normalized = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (period === 'all') return normalized;

  const daysMap: Record<Exclude<FinancePeriod, 'all'>, number> = {
    week: 7,
    month: 30,
    year: 365,
  };

  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - daysMap[period]);

  return normalized.filter((transaction) => {
    const date = new Date(`${normalizeDate(transaction.date)}T12:00:00`);
    return date >= cutoff;
  });
}

export function calculateFinancialSummary(transactions: FinanceTransaction[]) {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const balance = income - expenses;
  const savings = balance;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  return {
    income,
    expenses,
    balance,
    savings,
    savingsRate,
  };
}

export function getCategoryBreakdown(transactions: FinanceTransaction[]) {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totals = new Map<string, number>();

  expenses.forEach((item) => {
    const current = totals.get(item.category) ?? 0;
    totals.set(item.category, current + Number(item.amount || 0));
  });

  const entries = [...totals.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const totalSpent = entries.reduce((sum, item) => sum + item.value, 0);

  return entries.map((item) => ({
    ...item,
    percent: totalSpent > 0 ? (item.value / totalSpent) * 100 : 0,
  }));
}

export function getBudgetStatus(budgets: FinanceBudget[], transactions: FinanceTransaction[]) {
  return budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const remaining = Number(budget.amount || 0) - spent;
    const used = Number(budget.amount || 0) > 0 ? (spent / Number(budget.amount || 0)) * 100 : 0;

    return {
      ...budget,
      spent,
      remaining,
      used,
    };
  });
}

export function getAccountBalance(accounts: FinanceAccount[]): number {
  return accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
}

export function getMonthlyTrend(transactions: FinanceTransaction[], months = 6) {
  const result: Array<{ label: string; income: number; expense: number }> = [];
  const now = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = monthDate.toLocaleString('en-IN', { month: 'short' });
    const monthTransactions = transactions.filter((transaction) => {
      const d = new Date(`${normalizeDate(transaction.date)}T12:00:00`);
      return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
    });

    const income = monthTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expense = monthTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    result.push({ label, income, expense });
  }

  return result;
}
