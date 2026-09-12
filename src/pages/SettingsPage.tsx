import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, User, Bell, Key, Database, Info, Download, Upload, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useBentoStore } from '../store';
import { resetAppData } from '../services/resetAppData';
import type { ThemeMode, TimeFormat, StartOfWeek, Priority, TaskStatus } from '../types';
import './SettingsPage.css';

export function SettingsPage() {
  const { settings, updateSettings, tasks, projects, goals, habits, routines, events, conversations } = useBentoStore();
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    await updateSettings(updates);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    const backup = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      settings,
      tasks,
      projects,
      goals,
      habits,
      routines,
      events,
      conversations,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bento_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // Update Zustand state directly — persist handles saving
      useBentoStore.setState({
        tasks: backup.tasks || [],
        projects: backup.projects || [],
        goals: backup.goals || [],
        habits: backup.habits || [],
        routines: backup.routines || [],
        events: backup.events || [],
        conversations: backup.conversations || [],
      });
      if (backup.settings) updateSettings(backup.settings);

      alert('Data imported successfully!');
    } catch (err) {
      alert('Failed to import backup file. Ensure it is a valid JSON export.');
    }
  };

  const handleReset = async () => {
    setResetError(null);
    setResetting(true);

    try {
      await resetAppData();
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset the app completely.');
      setResetting(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1>Settings & Preferences</h1>
          <p className="subtitle">Customize Bento 2 to match your daily workflow</p>
        </div>
        {saveSuccess && (
          <span className="save-badge">
            <Check size={14} /> Saved
          </span>
        )}
      </header>

      <div className="settings-sections">
        {/* Appearance */}
        <div className="settings-card card">
          <div className="card-header-icon">
            <Moon size={20} className="accent-icon" />
            <h3>Appearance</h3>
          </div>
          <div className="setting-row">
            <div>
              <label className="setting-label">Theme</label>
              <p className="setting-desc">Select how Bento looks on your device</p>
            </div>
            <div className="theme-toggle-group">
              <button
                className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleUpdate({ theme: 'light' })}
              >
                <Sun size={16} /> Light
              </button>
              <button
                className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleUpdate({ theme: 'dark' })}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                className={`theme-btn ${settings.theme === 'system' ? 'active' : ''}`}
                onClick={() => handleUpdate({ theme: 'system' })}
              >
                <Monitor size={16} /> System
              </button>
            </div>
          </div>
        </div>

        {/* User Profile & Regional */}
        <div className="settings-card card">
          <div className="card-header-icon">
            <User size={20} className="accent-icon" />
            <h3>Profile & Regional</h3>
          </div>
          <div className="setting-row">
            <div>
              <label className="setting-label">Your Name</label>
              <p className="setting-desc">Used for personal greetings throughout the app</p>
            </div>
            <input
              type="text"
              className="input setting-input"
              placeholder="Enter your name"
              value={settings.userName}
              onChange={(e) => handleUpdate({ userName: e.target.value })}
            />
          </div>

          <div className="setting-row">
            <div>
              <label className="setting-label">Time Format</label>
              <p className="setting-desc">Display time in 12-hour or 24-hour format</p>
            </div>
            <select
              className="select setting-input"
              value={settings.timeFormat}
              onChange={(e) => handleUpdate({ timeFormat: e.target.value as TimeFormat })}
            >
              <option value="12h">12-hour (1:00 PM)</option>
              <option value="24h">24-hour (13:00)</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <label className="setting-label">Start of Week</label>
              <p className="setting-desc">First day of the week in calendar and metrics</p>
            </div>
            <select
              className="select setting-input"
              value={settings.startOfWeek}
              onChange={(e) => handleUpdate({ startOfWeek: e.target.value as StartOfWeek })}
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>

        {/* AI Integration */}
        <div className="settings-card card">
          <div className="card-header-icon">
            <Key size={20} className="accent-icon" />
            <h3>AI Provider Setup</h3>
          </div>
          <div className="setting-row">
            <div>
              <label className="setting-label">Provider</label>
              <p className="setting-desc">Select AI model provider</p>
            </div>
            <select
              className="select setting-input"
              value={settings.aiProvider}
              onChange={(e) => handleUpdate({ aiProvider: e.target.value })}
            >
              <option value="">None (Offline only)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
            </select>
          </div>

          {settings.aiProvider === 'openai' && (
            <>
              <div className="setting-row">
                <div>
                  <label className="setting-label">API Key</label>
                  <p className="setting-desc">Stored locally in your browser/device</p>
                </div>
                <div className="key-input-wrapper">
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="input setting-input"
                    placeholder="sk-..."
                    value={settings.aiApiKey}
                    onChange={(e) => handleUpdate({ aiApiKey: e.target.value })}
                  />
                  <button type="button" className="btn-ghost icon-only" onClick={() => setShowKey(!showKey)}>
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="setting-row">
                <div>
                  <label className="setting-label">Model Name</label>
                  <p className="setting-desc">Default: gpt-4o-mini</p>
                </div>
                <input
                  type="text"
                  className="input setting-input"
                  placeholder="gpt-4o-mini"
                  value={settings.aiModel}
                  onChange={(e) => handleUpdate({ aiModel: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        {/* Data Management */}
        <div className="settings-card card">
          <div className="card-header-icon">
            <Database size={20} className="accent-icon" />
            <h3>Data Management</h3>
          </div>
          <div className="setting-row">
            <div>
              <label className="setting-label">Export Data</label>
              <p className="setting-desc">Download a complete JSON backup of all your Bento data</p>
            </div>
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export JSON
            </button>
          </div>

          <div className="setting-row">
            <div>
              <label className="setting-label">Import Data</label>
              <p className="setting-desc">Restore tasks, goals, habits, and settings from backup</p>
            </div>
            <label className="btn btn-secondary">
              <Upload size={16} /> Import JSON
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="setting-row danger-row">
            <div>
              <label className="setting-label text-danger">Reset App</label>
              <p className="setting-desc">This will permanently delete all your app data and cannot be undone.</p>
            </div>
            <button className="btn btn-danger" onClick={() => setShowResetModal(true)}>
              <Trash2 size={16} /> Start Fresh
            </button>
          </div>
          {resetError && <div className="reset-error">{resetError}</div>}
        </div>

        {/* About */}
        <div className="settings-card card">
          <div className="card-header-icon">
            <Info size={20} className="accent-icon" />
            <h3>About Bento 2</h3>
          </div>
          <p className="about-text">
            Bento 2 is a premium personal operating system and intelligent daily-life planner designed for deep focus, daily clarity, and long-term achievement.
          </p>
          <div className="about-meta">
            <span>Version: 2.0.0</span>
            <span>Stack: React + TypeScript + Capacitor</span>
            <span>Architecture: Offline-First localStorage</span>
          </div>
        </div>
      </div>

      {showResetModal && (
        <div className="reset-modal-backdrop" onClick={() => !resetting && setShowResetModal(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <div className="reset-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 id="reset-modal-title">Reset Everything?</h3>
            <p>
              This will permanently remove all locally stored app data, including your tasks, goals,
              habits, progress, preferences, onboarding state, and cached data.
            </p>
            <p className="reset-modal-warning">This will permanently delete all your app data and cannot be undone.</p>
            <div className="reset-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)} disabled={resetting}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting...' : 'Reset Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
