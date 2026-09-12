import React, { useState, useMemo } from 'react';
import { useBentoStore } from '../store';
import { Habit, HabitFrequency } from '../types';
import { Plus, X, Flame, Check, Activity, Edit2, Trash2 } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import './HabitsPage.css';

export function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, completeHabit } = useBentoStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [target, setTarget] = useState(1);
  const [color, setColor] = useState('#22c55e');

  const openDialog = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setName(habit.name);
      setDescription(habit.description);
      setFrequency(habit.frequency);
      setTarget(habit.target);
      setColor(habit.color);
    } else {
      setEditingHabit(null);
      setName('');
      setDescription('');
      setFrequency('daily');
      setTarget(1);
      setColor('#22c55e');
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingHabit(null);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name,
        description,
        frequency,
        target,
        color,
      });
    } else {
      addHabit({
        name,
        description,
        frequency,
        target,
        color,
        icon: 'Activity', // Default icon
        currentStreak: 0,
        bestStreak: 0,
        completionHistory: [],
        enabled: true,
      });
    }
    closeDialog();
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateHabit(id, { enabled });
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="habits-page">
      <div className="habits-header">
        <div className="header-title">
          <h2>Habits</h2>
          <span className="count-badge">{habits.length}</span>
        </div>
        <button className="primary-btn" onClick={() => openDialog()}>
          <Plus size={18} /> Add Habit
        </button>
      </div>

      <div className="habits-content">
        {habits.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} className="empty-icon" />
            <h3>No habits yet</h3>
            <p>Create a habit to start building consistency.</p>
            <button className="primary-btn" onClick={() => openDialog()}>Create Habit</button>
          </div>
        ) : (
          <div className="habits-list">
            {habits.map(habit => {
              const todayCompletion = habit.completionHistory.find(h => h.date === todayStr);
              const isCompletedToday = todayCompletion ? todayCompletion.count >= habit.target : false;
              
              // Last 7 days progress
              const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
                const comp = habit.completionHistory.find(h => h.date === date);
                return {
                  date,
                  completed: comp ? comp.count >= habit.target : false
                };
              });

              return (
                <div key={habit.id} className={`habit-card ${!habit.enabled ? 'disabled' : ''}`}>
                  <div className="habit-info">
                    <div className="habit-title-row">
                      <h3>{habit.name}</h3>
                      <span className="frequency-badge">{habit.frequency}</span>
                    </div>
                    {habit.description && <p className="habit-desc">{habit.description}</p>}
                    
                    <div className="habit-stats">
                      <div className="streak-badge">
                        <Flame size={16} className={habit.currentStreak > 0 ? 'active-flame' : ''} />
                        <span>{habit.currentStreak} streak</span>
                      </div>
                      <div className="stat-text">Best: {habit.bestStreak}</div>
                    </div>
                  </div>

                  <div className="habit-actions-section">
                    <div className="weekly-progress">
                      {last7Days.map((day, i) => (
                        <div 
                          key={day.date} 
                          className="day-circle"
                          style={{
                            backgroundColor: day.completed ? habit.color : 'transparent',
                            borderColor: day.completed ? habit.color : 'var(--border-color)'
                          }}
                          title={day.date}
                        />
                      ))}
                    </div>

                    <button 
                      className={`complete-btn ${isCompletedToday ? 'completed' : ''}`}
                      style={{ 
                        backgroundColor: isCompletedToday ? habit.color : 'transparent',
                        borderColor: habit.color,
                        color: isCompletedToday ? 'white' : habit.color
                      }}
                      onClick={() => completeHabit(habit.id, todayStr)}
                      disabled={!habit.enabled}
                    >
                      <Check size={24} />
                    </button>
                    
                    <div className="habit-controls">
                      <button className="icon-btn" onClick={() => openDialog(habit)}><Edit2 size={16} /></button>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={habit.enabled} 
                          onChange={(e) => toggleEnabled(habit.id, e.target.checked)} 
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h2>{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
              <button className="icon-btn" onClick={closeDialog}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveHabit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  autoFocus 
                  placeholder="E.g., Read 30 mins"
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Why is this important?"
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select 
                    value={frequency} 
                    onChange={e => setFrequency(e.target.value as HabitFrequency)}
                    className="form-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Count</label>
                  <input 
                    type="number" 
                    value={target} 
                    onChange={e => setTarget(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`color-btn ${color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="dialog-footer">
                {editingHabit && (
                  <button type="button" className="danger-btn" onClick={() => {
                    deleteHabit(editingHabit.id);
                    closeDialog();
                  }}>Delete</button>
                )}
                <div className="footer-actions">
                  <button type="button" className="secondary-btn" onClick={closeDialog}>Cancel</button>
                  <button type="submit" className="primary-btn">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
