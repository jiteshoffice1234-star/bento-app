import React, { useMemo, useState } from 'react';
import {
  ArrowUp,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useBentoStore } from '../store';
import {
  getFilteredTransactions,
  calculateFinancialSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getBudgetStatus,
  formatCurrency,
  normalizeDate,
  parseMoney,
} from '../utils/finance';
import { FINANCE_EXPENSE_CATEGORIES, FINANCE_INCOME_CATEGORIES } from '../types';
import './FinancePage.css';

export function FinancePage() {
  const {
    financialTransactions = [],
    financialBudgets = [],
    financialAccounts = [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    addAccount,
    settings,
  } = useBentoStore();

  const [status, setStatus] = useState<string>('');
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', date: normalizeDate(new Date()), notes: '' });

  const filtered = useMemo(() => getFilteredTransactions(financialTransactions, period), [financialTransactions, period]);
  const summary = useMemo(() => calculateFinancialSummary(filtered), [filtered]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(filtered), [filtered]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(financialTransactions, 6), [financialTransactions]);
  const budgetStatus = useMemo(() => getBudgetStatus(financialBudgets, filtered), [financialBudgets, filtered]);
  const accountBalance = useMemo(() => financialAccounts.reduce((s, a) => s + Number(a.balance || 0), 0), [financialAccounts]);

  function resetForm() {
    setForm({ type: 'expense', amount: '', category: '', description: '', date: normalizeDate(new Date()), notes: '' });
    setEditingId(null);
  }

  function openAdd() {
    resetForm();
    setShowAdd(true);
  }

  function openEdit(id: string) {
    const tx = financialTransactions.find((t) => t.id === id);
    if (!tx) return;
    setForm({ type: tx.type, amount: String(tx.amount), category: tx.category, description: tx.description, date: normalizeDate(tx.date), notes: tx.notes });
    setEditingId(id);
    setShowAdd(true);
  }

  function validateForm() {
    const amt = parseMoney(form.amount);
    if (!(amt > 0)) return 'Amount must be a number greater than zero';
    if (!form.category) return 'Category is required';
    if (!form.date) return 'Date is required';
    return null;
  }

  function handleSave() {
    const err = validateForm();
    if (err) {
      setStatus(err);
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    const payload = {
      type: form.type as any,
      amount: parseMoney(form.amount),
      category: form.category,
      description: form.description || form.category,
      date: normalizeDate(form.date),
      notes: form.notes || '',
    };

    if (editingId) {
      updateTransaction(editingId, { ...payload, updatedAt: new Date().toISOString() });
      setStatus('Transaction updated');
    } else {
      addTransaction(payload);
      setStatus('Transaction added');
    }

    setShowAdd(false);
    resetForm();

    setTimeout(() => setStatus(''), 2500);
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete transaction? This cannot be undone.')) return;
    deleteTransaction(id);
    setStatus('Transaction deleted');
    setTimeout(() => setStatus(''), 2000);
  }

  return (
    <div className="finance-page">
      <header className="finance-header">
        <div>
          <p className="eyebrow">Life + Work + Money</p>
          <h1>Financial Overview</h1>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`ghost-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>Week</button>
              <button className={`ghost-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Month</button>
              <button className={`ghost-btn ${period === 'year' ? 'active' : ''}`} onClick={() => setPeriod('year')}>Year</button>
              <button className={`ghost-btn ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>All</button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary-btn compact-btn" onClick={openAdd} type="button">
            <Sparkles size={16} /> Add Transaction
          </button>
        </div>
      </header>

      {status && <div className="finance-status-banner">{status}</div>}

      <section className="finance-summary">
        <div className={`summary-card tone-primary`}>
          <div className="summary-topline">
            <span className="summary-label">Balance</span>
            <div className="summary-icon"><Wallet size={18} /></div>
          </div>
          <div className="summary-value">{formatCurrency(summary.balance, settings.currency)}</div>
          <div className="summary-delta">
            <ArrowUp size={14} /> {formatCurrency(summary.income, settings.currency)}
          </div>
        </div>

        <div className={`summary-card tone-green`}>
          <div className="summary-topline">
            <span className="summary-label">Income</span>
            <div className="summary-icon"><TrendingUp size={18} /></div>
          </div>
          <div className="summary-value">{formatCurrency(summary.income, settings.currency)}</div>
          <div className="summary-delta">{summary.income > 0 ? `↑ ${((summary.income / (summary.income + summary.expenses || 1)) * 100).toFixed(0)}%` : '—'}</div>
        </div>

        <div className={`summary-card tone-amber`}>
          <div className="summary-topline">
            <span className="summary-label">Expenses</span>
            <div className="summary-icon"><CreditCard size={18} /></div>
          </div>
          <div className="summary-value">{formatCurrency(summary.expenses, settings.currency)}</div>
          <div className="summary-delta">{summary.expenses > 0 ? `↓ ${((summary.expenses / (summary.income || 1)) * 100).toFixed(0)}%` : '—'}</div>
        </div>

        <div className={`summary-card tone-primary`}>
          <div className="summary-topline">
            <span className="summary-label">Savings</span>
            <div className="summary-icon"><PiggyBank size={18} /></div>
          </div>
          <div className="summary-value">{formatCurrency(summary.savings, settings.currency)}</div>
          <div className="summary-delta">{summary.savingsRate.toFixed(1)}%</div>
        </div>
      </section>

      <section className="finance-grid">
        <div className="finance-panel large-panel">
          <div className="panel-header">
            <h2>Monthly cash flow</h2>
            <span className="chip positive">{formatCurrency(summary.balance, settings.currency)}</span>
          </div>

          <div className="flow-chart" aria-label="Cash flow chart">
            {monthlyTrend.map((m) => (
              <div key={m.label} className="chart-bar-wrap">
                <span className="chart-bar" style={{ height: `${Math.min(100, Math.max(6, (m.income - m.expense) / (m.income + 1) * 100))}%` }} />
                <small>{m.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="finance-panel">
          <div className="panel-header">
            <h2>Portfolio mix</h2>
          </div>

          <div className="donut-wrap">
            {financialAccounts.length === 0 ? (
              <div style={{ padding: 12 }}>No accounts yet. Add an account to track balances.</div>
            ) : (
              <>
                <div className="donut-chart">
                  <div className="donut-center">
                    <strong>{formatCurrency(accountBalance, settings.currency)}</strong>
                    <span>Portfolio</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {financialAccounts.map((acc) => (
                    <div key={acc.id} className="legend-row">
                      <span className="legend-dot" style={{ background: acc.color }} />
                      <span>{acc.name}</span>
                      <strong>{formatCurrency(acc.balance, settings.currency)}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="finance-lower-grid">
        <div className="finance-panel">
          <div className="panel-header">
            <h2>Accounts</h2>
            <button className="ghost-btn" onClick={() => addAccount({ name: 'New Account', balance: 0, type: 'bank' })} type="button">Add</button>
          </div>
          <div className="account-list">
            {financialAccounts.length === 0 ? (
              <div>No accounts yet.</div>
            ) : (
              financialAccounts.map((account) => (
                <div key={account.id} className="account-row">
                  <div className="account-meta">
                    <div className="account-icon">
                      {account.type === 'credit_card' ? <CreditCard size={16} /> : account.type === 'investment' ? <Landmark size={16} /> : <Wallet size={16} />}
                    </div>
                    <div>
                      <strong>{account.name}</strong>
                      <small>{account.type}</small>
                    </div>
                  </div>
                  <div className="account-balance">
                    <strong>{formatCurrency(account.balance, settings.currency)}</strong>
                    <span className={account.balance >= 0 ? 'positive' : 'negative'}>Updated {account.lastUpdated}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="finance-panel">
          <div className="panel-header">
            <h2>Budget health</h2>
            <span className="chip neutr">{financialBudgets.length === 0 ? 'No budgets' : 'Budgets'}</span>
          </div>

          <div className="budget-list">
            {budgetStatus.length === 0 ? (
              <div>No budgets yet.</div>
            ) : (
              budgetStatus.map((budget) => (
                <div key={budget.id} className="budget-row">
                  <div className="budget-row-head">
                    <strong>{budget.category}</strong>
                    <span>{`${formatCurrency(budget.spent || 0, settings.currency)} / ${formatCurrency(budget.amount, settings.currency)}`}</span>
                  </div>
                  <div className="progress-line">
                    <span style={{ width: `${Math.min(100, Math.max(0, (budget.used || 0)))}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="finance-lower-grid">
        <div className="finance-panel">
          <div className="panel-header">
            <h2>Transactions</h2>
            <button className="ghost-btn" onClick={openAdd} type="button">+ Add</button>
          </div>

          <div className="transaction-list">
            {filtered.length === 0 ? (
              <div>No transactions for this period. Add your first income or expense.</div>
            ) : (
              filtered.map((entry) => (
                <div key={entry.id} className="transaction-row">
                  <div className="transaction-ident">
                    <div className={`transaction-bullet ${entry.type === 'income' ? 'income' : 'expense'}`} />
                    <div>
                      <strong>{entry.description}</strong>
                      <small>{entry.category}</small>
                    </div>
                  </div>
                  <div className="transaction-meta">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="ghost-btn small-btn" onClick={() => openEdit(entry.id)}><Edit3 size={14} /></button>
                      <button className="ghost-btn small-btn" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></button>
                    </div>
                    <strong className={entry.type === 'income' ? 'positive' : 'negative'}>{formatCurrency(entry.amount, settings.currency)}</strong>
                    <small>{entry.date}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="finance-panel">
          <div className="panel-header">
            <h2>Savings goals</h2>
          </div>

          <div className="goal-list">
            <div>No savings goals yet.</div>
          </div>
        </div>
      </section>

      {showAdd && (
        <div className="reset-modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <h3>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: String(e.target.value) }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label>Amount</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>

              <div>
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">Select</option>
                  {(form.type === 'income' ? FINANCE_INCOME_CATEGORIES : FINANCE_EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>

              <div>
                <label>Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              <div>
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
