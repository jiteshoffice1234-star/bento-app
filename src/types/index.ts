// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bento 2 — Core Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'inbox' | 'today' | 'upcoming' | 'completed';
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type RecurrencePattern = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'biweekly' | 'monthly';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TimeFormat = '12h' | '24h';
export type StartOfWeek = 'sunday' | 'monday';
export type FinanceTransactionType = 'income' | 'expense';
export type FinanceAccountType = 'bank' | 'cash' | 'credit_card' | 'loan' | 'investment' | 'wallet' | 'other_asset';
export type BudgetPeriod = 'monthly' | 'yearly';

export const FINANCE_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'] as const;
export const FINANCE_EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Housing', 'Subscriptions', 'Other'] as const;
export const FINANCE_ACCOUNT_TYPES: Array<{ value: FinanceAccountType; label: string }> = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Loan' },
  { value: 'investment', label: 'Investment' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other_asset', label: 'Other Asset' },
];

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  status: TaskStatus;
  projectId: string | null;
  goalId: string | null;
  tags: string[];
  notes: string;
  subtasks: Subtask[];
  recurrence: RecurrencePattern | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  deadline: string | null;
  goalId: string | null;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  targetDate: string | null;
  progress: number;
  status: GoalStatus;
  milestones: Milestone[];
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate: string | null;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  target: number;
  currentStreak: number;
  bestStreak: number;
  completionHistory: HabitCompletion[];
  enabled: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  date: string;
  count: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  actions: RoutineAction[];
  schedule: RecurrencePattern;
  scheduledTime: string | null;
  enabled: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineAction {
  id: string;
  title: string;
  duration: number | null; // minutes
  order: number;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  color: string;
  notes: string;
  taskId: string | null;
  routineId: string | null;
  recurrence: RecurrencePattern | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: ThemeMode;
  timeFormat: TimeFormat;
  startOfWeek: StartOfWeek;
  defaultPriority: Priority;
  defaultTaskStatus: TaskStatus;
  notificationsEnabled: boolean;
  userName: string;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  onboardingCompleted: boolean;
  currency: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  timeFormat: '12h',
  startOfWeek: 'monday',
  defaultPriority: 'none',
  defaultTaskStatus: 'inbox',
  notificationsEnabled: true,
  userName: '',
  aiProvider: '',
  aiApiKey: '',
  aiModel: '',
  onboardingCompleted: false,
  currency: 'INR',
};

export interface FinanceTransaction {
  id: string;
  type: FinanceTransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  notes: string;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceBudget {
  id: string;
  category: string;
  amount: number;
  period: BudgetPeriod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: FinanceAccountType;
  balance: number;
  lastUpdated: string;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Color palette for user-assignable colors
export const BENTO_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
] as const;
