import React, { useState } from 'react';
import { useBentoStore } from '../store';
import { Routine, RoutineAction, RecurrencePattern } from '../types';
import { Plus, Edit2, Trash2, Clock, Calendar, CheckSquare, Settings2, Check } from 'lucide-react';
import './RoutinesPage.css';

const MOCK_ICONS = ['repeat', 'sun', 'moon', 'coffee', 'briefcase', 'book', 'heart', 'activity'];
const MOCK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export const RoutinesPage: React.FC = () => {
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useBentoStore();
  const [editingRoutine, setEditingRoutine] = useState<Partial<Routine> | null>(null);

  const handleAddAction = () => {
    if (editingRoutine) {
      setEditingRoutine({
        ...editingRoutine,
        actions: [
          ...(editingRoutine.actions || []),
          { id: Math.random().toString(), title: '', duration: 5, order: (editingRoutine.actions?.length || 0), completed: false }
        ]
      });
    }
  };

  const handleSave = () => {
    if (editingRoutine) {
      if (editingRoutine.id) {
        updateRoutine(editingRoutine.id, editingRoutine);
      } else {
        addRoutine(editingRoutine as Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setEditingRoutine(null);
    }
  };

  const toggleAction = (routineId: string, actionId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      const actions = routine.actions.map(a => 
        a.id === actionId ? { ...a, completed: !a.completed } : a
      );
      updateRoutine(routineId, { actions });
    }
  };

  return (
    <div className="routines-page">
      <header className="page-header">
        <h1>Routines</h1>
        <button className="btn-primary" onClick={() => setEditingRoutine({ name: '', actions: [], schedule: 'daily', color: MOCK_COLORS[0], icon: MOCK_ICONS[0], enabled: true })}>
          <Plus size={18} /> Add Routine
        </button>
      </header>

      {routines.length === 0 ? (
        <div className="empty-state">
          <Settings2 size={48} className="empty-icon" />
          <h3>No routines yet</h3>
          <p>Create routines for your daily habits and repeatable processes.</p>
        </div>
      ) : (
        <div className="routines-grid">
          {routines.map(routine => {
            const completedCount = routine.actions.filter(a => a.completed).length;
            const totalCount = routine.actions.length;
            const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

            return (
              <div key={routine.id} className={`routine-card ${!routine.enabled ? 'disabled' : ''}`} style={{ '--accent-color': routine.color } as React.CSSProperties}>
                <div className="routine-header">
                  <div className="routine-title">
                    <span className="color-dot" style={{ backgroundColor: routine.color }}></span>
                    <h3>{routine.name}</h3>
                  </div>
                  <div className="routine-actions-btns">
                    <button onClick={() => updateRoutine(routine.id, { enabled: !routine.enabled })} className="btn-icon" title={routine.enabled ? 'Disable' : 'Enable'}>
                      {routine.enabled ? <CheckSquare size={16} /> : <Settings2 size={16} />}
                    </button>
                    <button onClick={() => setEditingRoutine(routine)} className="btn-icon"><Edit2 size={16} /></button>
                    <button onClick={() => deleteRoutine(routine.id)} className="btn-icon text-red"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="routine-meta">
                  {routine.schedule && <span className="badge"><Calendar size={12} /> {routine.schedule}</span>}
                  {routine.scheduledTime && <span className="badge"><Clock size={12} /> {routine.scheduledTime}</span>}
                </div>

                <div className="routine-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: routine.color }}></div>
                  </div>
                  <span className="progress-text">{completedCount} / {totalCount}</span>
                </div>

                <ul className="routine-actions-list">
                  {routine.actions.map(action => (
                    <li key={action.id} className={`action-item ${action.completed ? 'completed' : ''}`}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={action.completed}
                          onChange={() => toggleAction(routine.id, action.id)}
                          disabled={!routine.enabled}
                        />
                        <span className="action-title">{action.title}</span>
                      </label>
                      {action.duration && <span className="action-duration">{action.duration}m</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {editingRoutine && (
        <div className="dialog-overlay">
          <div className="dialog routine-dialog">
            <h2>{editingRoutine.id ? 'Edit' : 'Add'} Routine</h2>
            <div className="dialog-content">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editingRoutine.name || ''} 
                  onChange={e => setEditingRoutine({...editingRoutine, name: e.target.value})} 
                  placeholder="Morning Routine" 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Schedule</label>
                  <select 
                    value={editingRoutine.schedule || 'daily'} 
                    onChange={e => setEditingRoutine({...editingRoutine, schedule: e.target.value as RecurrencePattern})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time (optional)</label>
                  <input 
                    type="time" 
                    value={editingRoutine.scheduledTime || ''} 
                    onChange={e => setEditingRoutine({...editingRoutine, scheduledTime: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {MOCK_COLORS.map(c => (
                    <button 
                      key={c} 
                      className={`color-btn ${editingRoutine.color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditingRoutine({...editingRoutine, color: c})}
                    />
                  ))}
                </div>
              </div>

              <div className="actions-editor">
                <h4>Actions</h4>
                {editingRoutine.actions?.map((action, i) => (
                  <div key={action.id} className="action-edit-row">
                    <input 
                      type="text" 
                      value={action.title} 
                      onChange={e => {
                        const newActions = [...(editingRoutine.actions || [])];
                        newActions[i].title = e.target.value;
                        setEditingRoutine({...editingRoutine, actions: newActions});
                      }}
                      placeholder="Action title"
                      className="flex-1"
                    />
                    <input 
                      type="number" 
                      value={action.duration || ''} 
                      onChange={e => {
                        const newActions = [...(editingRoutine.actions || [])];
                        newActions[i].duration = parseInt(e.target.value) || null;
                        setEditingRoutine({...editingRoutine, actions: newActions});
                      }}
                      placeholder="min"
                      className="w-20"
                    />
                    <button 
                      onClick={() => {
                        const newActions = editingRoutine.actions?.filter((_, idx) => idx !== i);
                        setEditingRoutine({...editingRoutine, actions: newActions});
                      }}
                      className="btn-icon text-red"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button className="btn-secondary add-action-btn" onClick={handleAddAction}>
                  <Plus size={16} /> Add Action
                </button>
              </div>

            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setEditingRoutine(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
