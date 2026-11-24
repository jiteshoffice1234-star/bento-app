import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useBentoStore } from './store';
import { migrateFromDexie } from './services/migrate';
import { Layout } from './components/Layout';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { GoalsPage } from './pages/GoalsPage';
import { FinancePage } from './pages/FinancePage';
import { HabitsPage } from './pages/HabitsPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { InsightsPage } from './pages/InsightsPage';
import { AIPage } from './pages/AIPage';
import { SettingsPage } from './pages/SettingsPage';
import { SearchPage } from './pages/SearchPage';
import { Onboarding } from './components/Onboarding';

function ThemeManager() {
  const { settings } = useBentoStore();

  useEffect(() => {
    const applyTheme = (mode: string) => {
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  return null;
}

export function App() {
  const { isLoading, setLoading, settings } = useBentoStore();

  useEffect(() => {
    // One-time migration from Dexie → localStorage
    migrateFromDexie().then(() => {
      setLoading(false);
    });
  }, [setLoading]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-content">
          <div className="app-loading-logo">B</div>
          <div className="app-loading-text">Bento</div>
          <div className="app-loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeManager />
      {!settings.onboardingCompleted && <Onboarding />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="routines" element={<RoutinesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
