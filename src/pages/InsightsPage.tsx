import React, { useMemo } from 'react';
import { useBentoStore } from '../store';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { CheckSquare, Target, Activity, Zap } from 'lucide-react';
import './InsightsPage.css';

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  none: '#9ca3af',
  urgent: '#7f1d1d'
};

export const InsightsPage: React.FC = () => {
  const { tasks, goals, habits } = useBentoStore();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const activeHabits = habits.filter(h => h.enabled);
    const avgStreak = activeHabits.length ? Math.round(activeHabits.reduce((acc, h) => acc + h.currentStreak, 0) / activeHabits.length) : 0;

    const activeGoals = goals.filter(g => g.status === 'active');
    const avgGoalProgress = activeGoals.length ? Math.round(activeGoals.reduce((acc, g) => acc + g.progress, 0) / activeGoals.length) : 0;

    return { totalTasks, completedTasks, completionRate, activeHabits: activeHabits.length, avgStreak, activeGoals: activeGoals.length, avgGoalProgress };
  }, [tasks, goals, habits]);

  const weeklyActivityData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const completedOnDay = tasks.filter(t => t.status === 'completed' && t.completedAt && isSameDay(new Date(t.completedAt), d)).length;
      data.push({
        name: format(d, 'EEE'),
        completed: completedOnDay
      });
    }
    return data;
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [tasks]);

  const goalProgressData = useMemo(() => {
    return goals.map(g => ({
      name: g.name.length > 15 ? g.name.substring(0, 15) + '...' : g.name,
      progress: g.progress,
      fill: g.color
    }));
  }, [goals]);

  return (
    <div className="insights-page">
      <header className="page-header">
        <h1>Insights</h1>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{stats.totalTasks}</span>
            <span className="stat-sub">{stats.completedTasks} completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Completion Rate</span>
            <span className="stat-value">{stats.completionRate}%</span>
            <span className="stat-sub">Overall productivity</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Habits</span>
            <span className="stat-value">{stats.activeHabits}</span>
            <span className="stat-sub">{stats.avgStreak} day avg streak</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Goals</span>
            <span className="stat-value">{stats.activeGoals}</span>
            <span className="stat-sub">{stats.avgGoalProgress}% avg progress</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Weekly Activity</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Task Priorities</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card col-span-2">
          <h3>Goal Progress</h3>
          <div className="chart-container" style={{ height: '250px' }}>
            {goalProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={100} stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20}>
                    {goalProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No goals available for tracking.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
