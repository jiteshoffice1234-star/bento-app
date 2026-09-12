import React, { useMemo } from 'react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Sun, CheckCircle, Calendar, Target, Award, ListTodo, Clock3, Activity } from 'lucide-react';
import { useBentoStore } from '../store';
import { TaskItem } from '../components/TaskItem';
import { SectionNav } from '../components/SectionNav';
import './TodayPage.css';

export const TodayPage: React.FC = () => {
  const { settings, tasks, projects, events, habits, completeTask, uncompleteTask, deleteTask, completeHabit } = useBentoStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayDateStr = format(new Date(), 'EEEE, MMMM d');

  const todayTasks = useMemo(() => {
    return tasks.filter(t => 
      t.status !== 'completed' && 
      (t.status === 'today' || (t.dueDate && isToday(parseISO(t.dueDate))))
    );
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => 
      t.status !== 'completed' && 
      t.dueDate && 
      isPast(parseISO(t.dueDate)) && 
      !isToday(parseISO(t.dueDate))
    );
  }, [tasks]);

  const topFocusTasks = useMemo(() => {
    return [...todayTasks, ...overdueTasks]
      .filter(t => t.priority === 'urgent' || t.priority === 'high')
      .slice(0, 3);
  }, [todayTasks, overdueTasks]);

  const todayEvents = useMemo(() => {
    return events.filter(e => isToday(parseISO(e.startDate))).sort((a, b) => {
      if (!a.startTime) return -1;
      if (!b.startTime) return 1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [events]);

  const activeHabits = useMemo(() => {
    return habits.filter(h => h.enabled && (h.frequency === 'daily' || h.frequency === 'weekly' || h.frequency === 'monthly'));
  }, [habits]);

  const stats = useMemo(() => {
    const completedToday = tasks.filter(t => t.status === 'completed' && t.updatedAt && isToday(parseISO(t.updatedAt))).length;
    return { completedToday, upcomingEvents: todayEvents.length, activeHabitsCount: activeHabits.length };
  }, [tasks, todayEvents, activeHabits]);

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (completed) {
      await completeTask(taskId);
    } else {
      await uncompleteTask(taskId);
    }
  };

  const handleHabitComplete = (habitId: string) => {
    completeHabit(habitId, format(new Date(), 'yyyy-MM-dd'));
  };

  const quickSections = [
    { id: 'overview', label: 'Overview', icon: Sun },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'habits', label: 'Habits', icon: Award },
    { id: 'stats', label: 'Stats', icon: Activity },
  ];

  return (
    <div className="today-page">
      <header className="today-header">
        <div className="greeting-section">
          <h1>{greeting}, {settings.userName || 'there'}!</h1>
          <p className="date-subtitle">{todayDateStr}</p>
        </div>
        <div className="header-icon">
          <Sun size={32} className="text-warning" />
        </div>
      </header>

      <SectionNav sections={quickSections} />

      <section id="overview" className="today-section overview-section">
        <div className="quick-stats-row">
          <div className="stat-card">
            <div className="stat-icon bg-success-light text-success"><CheckCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.completedToday}</span>
              <span className="stat-label">Tasks Done</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-primary-light text-primary"><Calendar size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.upcomingEvents}</span>
              <span className="stat-label">Events Today</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-info-light text-info"><Award size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeHabitsCount}</span>
              <span className="stat-label">Habits</span>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="grid-column main-col">
          <section id="focus" className="dashboard-card focus-card today-section">
            <div className="card-header">
              <h2><Target size={18} /> Today's Focus</h2>
            </div>
            <div className="card-content">
              {topFocusTasks.length > 0 ? (
                <div className="task-list">
                  {topFocusTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      project={projects.find(p => p.id === task.projectId)}
                      onComplete={handleTaskComplete}
                      onEdit={() => {}} // Could wire to edit dialog if needed
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-text">No high priority tasks for today. You're all caught up!</p>
              )}
            </div>
          </section>

          <section className="dashboard-card tasks-card today-section">
            <div className="card-header">
              <h2><ListTodo size={18} /> All Today ({todayTasks.length})</h2>
            </div>
            <div className="card-content">
              {todayTasks.length > 0 ? (
                <div className="task-list">
                  {todayTasks.filter(t => !topFocusTasks.find(ft => ft.id === t.id)).map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      project={projects.find(p => p.id === task.projectId)}
                      onComplete={handleTaskComplete}
                      onEdit={() => {}} 
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-text">No more tasks for today.</p>
              )}
            </div>
          </section>

          {overdueTasks.length > 0 && (
            <section className="dashboard-card overdue-card today-section">
              <div className="card-header text-danger">
                <h2>Overdue ({overdueTasks.length})</h2>
              </div>
              <div className="card-content">
                <div className="task-list">
                  {overdueTasks.filter(t => !topFocusTasks.find(ft => ft.id === t.id)).map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      project={projects.find(p => p.id === task.projectId)}
                      onComplete={handleTaskComplete}
                      onEdit={() => {}}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>

        <div id="stats" className="grid-column side-col today-section">
          <section id="schedule" className="dashboard-card schedule-card today-section">
            <div className="card-header">
              <h2><Calendar size={18} /> Schedule</h2>
            </div>
            <div className="card-content">
              {todayEvents.length > 0 ? (
                <div className="event-list">
                  {todayEvents.map(event => (
                    <div key={event.id} className="event-item">
                      <div className="event-time">{event.startTime || 'All Day'}</div>
                      <div className="event-details">
                        <div className="event-title">{event.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No events scheduled today.</p>
              )}
            </div>
          </section>

          <section id="habits" className="dashboard-card habits-card today-section">
            <div className="card-header">
              <h2><Award size={18} /> Habits</h2>
            </div>
            <div className="card-content">
              {activeHabits.length > 0 ? (
                <div className="habit-list">
                  {activeHabits.map(habit => (
                    <div key={habit.id} className="habit-item">
                      <div className="habit-info">
                        <span className="habit-name">{habit.name}</span>
                        <span className="habit-streak">{habit.currentStreak || 0} 🔥</span>
                      </div>
                      <button className="habit-check-btn" onClick={() => handleHabitComplete(habit.id)} type="button" aria-label={`Complete ${habit.name}`}>
                        <CheckCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No habits scheduled for today.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
