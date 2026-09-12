// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bento 2 — Zustand Application Store (with persist)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Task,
  Project,
  Goal,
  Habit,
  Routine,
  CalendarEvent,
  AppSettings,
  TaskStatus,
  AIConversation,
  AIMessage,
  FinanceTransaction,
  FinanceBudget,
  FinanceAccount,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface BentoState {
  // Data
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  habits: Habit[];
  routines: Routine[];
  events: CalendarEvent[];
  conversations: AIConversation[];
  financialTransactions: FinanceTransaction[];
  financialBudgets: FinanceBudget[];
  financialAccounts: FinanceAccount[];
  settings: AppSettings;

  // UI State (not persisted)
  isLoading: boolean;
  searchQuery: string;
  activeView: string;

  // Actions - Tasks
  addTask: (task: Partial<Task>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;

  // Actions - Projects
  addProject: (project: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Partial<Goal>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Actions - Habits
  addHabit: (habit: Partial<Habit>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string, date: string) => void;

  // Actions - Routines
  addRoutine: (routine: Partial<Routine>) => Routine;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;

  // Actions - Events
  addEvent: (event: Partial<CalendarEvent>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Actions - AI
  addConversation: () => AIConversation;
  addMessage: (conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  deleteConversation: (id: string) => void;

  // Actions - Finance
  addTransaction: (transaction: Partial<FinanceTransaction>) => FinanceTransaction;
  updateTransaction: (id: string, updates: Partial<FinanceTransaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Partial<FinanceBudget>) => FinanceBudget;
  updateBudget: (id: string, updates: Partial<FinanceBudget>) => void;
  deleteBudget: (id: string) => void;
  addAccount: (account: Partial<FinanceAccount>) => FinanceAccount;
  updateAccount: (id: string, updates: Partial<FinanceAccount>) => void;
  deleteAccount: (id: string) => void;

  // Actions - Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

const now = () => new Date().toISOString();

export const useBentoStore = create<BentoState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      projects: [],
      goals: [],
      habits: [],
      routines: [],
      events: [],
      conversations: [],
      financialTransactions: [],
      financialBudgets: [],
      financialAccounts: [],
      settings: DEFAULT_SETTINGS,
      isLoading: true,
      searchQuery: '',
      activeView: 'today',

      // ─── Tasks ─────────────────────────────────────
      addTask: (partial) => {
        const task: Task = {
          id: uuidv4(),
          title: partial.title || '',
          description: partial.description || '',
          dueDate: partial.dueDate || null,
          dueTime: partial.dueTime || null,
          priority: partial.priority || get().settings.defaultPriority,
          status: partial.status || get().settings.defaultTaskStatus,
          projectId: partial.projectId || null,
          goalId: partial.goalId || null,
          tags: partial.tags || [],
          notes: partial.notes || '',
          subtasks: partial.subtasks || [],
          recurrence: partial.recurrence || null,
          completedAt: null,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },

      updateTask: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patched } : t)),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      completeTask: (id) => {
        const patched = { status: 'completed' as TaskStatus, completedAt: now(), updatedAt: now() };
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patched } : t)),
        }));
      },

      uncompleteTask: (id) => {
        const patched = { status: 'today' as TaskStatus, completedAt: null, updatedAt: now() };
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patched } : t)),
        }));
      },

      // ─── Projects ──────────────────────────────────
      addProject: (partial) => {
        const project: Project = {
          id: uuidv4(),
          name: partial.name || '',
          description: partial.description || '',
          status: partial.status || 'active',
          progress: partial.progress || 0,
          deadline: partial.deadline || null,
          goalId: partial.goalId || null,
          notes: partial.notes || '',
          color: partial.color || '#d4a053',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return project;
      },

      updateProject: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patched } : p)),
        }));
      },

      deleteProject: (id) => {
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      },

      // ─── Goals ─────────────────────────────────────
      addGoal: (partial) => {
        const goal: Goal = {
          id: uuidv4(),
          name: partial.name || '',
          description: partial.description || '',
          targetDate: partial.targetDate || null,
          progress: partial.progress || 0,
          status: partial.status || 'active',
          milestones: partial.milestones || [],
          notes: partial.notes || '',
          color: partial.color || '#d4a053',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ goals: [...s.goals, goal] }));
        return goal;
      },

      updateGoal: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patched } : g)),
        }));
      },

      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
      },

      // ─── Habits ────────────────────────────────────
      addHabit: (partial) => {
        const habit: Habit = {
          id: uuidv4(),
          name: partial.name || '',
          description: partial.description || '',
          frequency: partial.frequency || 'daily',
          target: partial.target || 1,
          currentStreak: 0,
          bestStreak: 0,
          completionHistory: [],
          enabled: partial.enabled !== false,
          color: partial.color || '#3dd68c',
          icon: partial.icon || 'check',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        return habit;
      },

      updateHabit: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patched } : h)),
        }));
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      },

      completeHabit: (id, date) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return;

        const existing = habit.completionHistory.find((c) => c.date === date);
        let newHistory;
        if (existing) {
          newHistory = habit.completionHistory.map((c) =>
            c.date === date ? { ...c, count: c.count + 1 } : c
          );
        } else {
          newHistory = [...habit.completionHistory, { date, count: 1 }];
        }

        // Calculate streak
        const today = new Date();
        let streak = 0;
        const sortedDates = newHistory
          .filter((c) => c.count >= habit.target)
          .map((c) => c.date)
          .sort()
          .reverse();

        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const checkStr = checkDate.toISOString().split('T')[0];
          if (sortedDates.includes(checkStr)) {
            streak++;
          } else {
            break;
          }
        }

        const bestStreak = Math.max(streak, habit.bestStreak);

        const patched = {
          completionHistory: newHistory,
          currentStreak: streak,
          bestStreak,
          updatedAt: now(),
        };

        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patched } : h)),
        }));
      },

      // ─── Routines ──────────────────────────────────
      addRoutine: (partial) => {
        const routine: Routine = {
          id: uuidv4(),
          name: partial.name || '',
          description: partial.description || '',
          actions: partial.actions || [],
          schedule: partial.schedule || 'daily',
          scheduledTime: partial.scheduledTime || null,
          enabled: partial.enabled !== false,
          color: partial.color || '#06b6d4',
          icon: partial.icon || 'repeat',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ routines: [...s.routines, routine] }));
        return routine;
      },

      updateRoutine: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          routines: s.routines.map((r) => (r.id === id ? { ...r, ...patched } : r)),
        }));
      },

      deleteRoutine: (id) => {
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
      },

      // ─── Events ────────────────────────────────────
      addEvent: (partial) => {
        const event: CalendarEvent = {
          id: uuidv4(),
          title: partial.title || '',
          description: partial.description || '',
          startDate: partial.startDate || new Date().toISOString().split('T')[0],
          startTime: partial.startTime || '09:00',
          endDate: partial.endDate || partial.startDate || new Date().toISOString().split('T')[0],
          endTime: partial.endTime || '10:00',
          allDay: partial.allDay || false,
          color: partial.color || '#5b9cf5',
          notes: partial.notes || '',
          taskId: partial.taskId || null,
          routineId: partial.routineId || null,
          recurrence: partial.recurrence || null,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ events: [...s.events, event] }));
        return event;
      },

      updateEvent: (id, updates) => {
        const patched = { ...updates, updatedAt: now() };
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patched } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
      },

      // ─── Finance ───────────────────────────────────
      addTransaction: (partial) => {
        const transaction: FinanceTransaction = {
          id: uuidv4(),
          type: partial.type || 'expense',
          amount: Number(partial.amount) || 0,
          category: partial.category || 'Other',
          description: partial.description || 'Transaction',
          date: partial.date || new Date().toISOString().split('T')[0],
          notes: partial.notes || '',
          recurring: Boolean(partial.recurring),
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ financialTransactions: [...s.financialTransactions, transaction] }));
        return transaction;
      },

      updateTransaction: (id, updates) => {
        set((s) => ({
          financialTransactions: s.financialTransactions.map((transaction) =>
            transaction.id === id ? { ...transaction, ...updates, updatedAt: now() } : transaction
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((s) => ({
          financialTransactions: s.financialTransactions.filter((transaction) => transaction.id !== id),
        }));
      },

      addBudget: (partial) => {
        const budget: FinanceBudget = {
          id: uuidv4(),
          category: partial.category || 'Other',
          amount: Number(partial.amount) || 0,
          period: partial.period || 'monthly',
          notes: partial.notes || '',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ financialBudgets: [...s.financialBudgets, budget] }));
        return budget;
      },

      updateBudget: (id, updates) => {
        set((s) => ({
          financialBudgets: s.financialBudgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates, updatedAt: now() } : budget
          ),
        }));
      },

      deleteBudget: (id) => {
        set((s) => ({ financialBudgets: s.financialBudgets.filter((budget) => budget.id !== id) }));
      },

      addAccount: (partial) => {
        const account: FinanceAccount = {
          id: uuidv4(),
          name: partial.name || 'Account',
          type: partial.type || 'bank',
          balance: Number(partial.balance) || 0,
          lastUpdated: partial.lastUpdated || new Date().toISOString().split('T')[0],
          notes: partial.notes || '',
          color: partial.color || '#6366f1',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ financialAccounts: [...s.financialAccounts, account] }));
        return account;
      },

      updateAccount: (id, updates) => {
        set((s) => ({
          financialAccounts: s.financialAccounts.map((account) =>
            account.id === id ? { ...account, ...updates, updatedAt: now() } : account
          ),
        }));
      },

      deleteAccount: (id) => {
        set((s) => ({ financialAccounts: s.financialAccounts.filter((account) => account.id !== id) }));
      },

      // ─── AI ────────────────────────────────────────
      addConversation: () => {
        const conversation: AIConversation = {
          id: uuidv4(),
          title: 'New conversation',
          messages: [],
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ conversations: [...s.conversations, conversation] }));
        return conversation;
      },

      addMessage: (conversationId, message) => {
        const fullMessage: AIMessage = {
          id: uuidv4(),
          ...message,
          timestamp: now(),
        };
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (!conv) return;
        const updated = {
          messages: [...conv.messages, fullMessage],
          updatedAt: now(),
        };
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...updated } : c
          ),
        }));
      },

      deleteConversation: (id) => {
        set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) }));
      },

      // ─── Settings ──────────────────────────────────
      updateSettings: (updates) => {
        const newSettings = { ...get().settings, ...updates };
        set({ settings: newSettings });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'bento-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist data, not UI state
        tasks: state.tasks,
        projects: state.projects,
        goals: state.goals,
        habits: state.habits,
        routines: state.routines,
        events: state.events,
        conversations: state.conversations,
        financialTransactions: state.financialTransactions,
        financialBudgets: state.financialBudgets,
        financialAccounts: state.financialAccounts,
        settings: state.settings,
      }),
    }
  )
);
