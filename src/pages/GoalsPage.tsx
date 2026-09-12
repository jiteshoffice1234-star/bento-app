import React, { useState, useMemo } from 'react';
import { useBentoStore } from '../store';
import { Goal, Milestone, GoalStatus } from '../types';
import { Target, Plus, CheckCircle2, Circle, X, Trash2, Edit2, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import './GoalsPage.css';

export function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, projects, tasks } = useBentoStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [color, setColor] = useState('#6366f1');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (filter === 'all') return true;
      return g.status === filter;
    });
  }, [goals, filter]);

  const openDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setName(goal.name);
      setDescription(goal.description);
      setTargetDate(goal.targetDate || '');
      setColor(goal.color);
      setMilestones(goal.milestones);
    } else {
      setEditingGoal(null);
      setName('');
      setDescription('');
      setTargetDate(format(new Date(), 'yyyy-MM-dd'));
      setColor('#6366f1');
      setMilestones([]);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
  };

  const handleAddMilestone = () => {
    if (newMilestoneTitle.trim()) {
      setMilestones([...milestones, {
        id: uuidv4(),
        title: newMilestoneTitle.trim(),
        completed: false,
        targetDate: null,
      }]);
      setNewMilestoneTitle('');
    }
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        description,
        targetDate: targetDate || null,
        color,
        milestones,
      });
    } else {
      addGoal({
        name,
        description,
        targetDate: targetDate || null,
        status: 'active',
        progress: 0,
        milestones,
        notes: '',
        color,
      });
    }
    closeDialog();
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    if (selectedGoal?.id === id) {
      setSelectedGoal(null);
    }
    closeDialog();
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = updatedMilestones.length > 0 ? (completedCount / updatedMilestones.length) * 100 : 0;
    
    updateGoal(goalId, { milestones: updatedMilestones, progress });
    if (selectedGoal?.id === goalId) {
      setSelectedGoal({ ...goal, milestones: updatedMilestones, progress });
    }
  };

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div className="header-title">
          <h2>Goals</h2>
          <span className="count-badge">{filteredGoals.length}</span>
        </div>
        <div className="goals-actions">
          <div className="view-toggle">
            <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          </div>
          <button className="primary-btn" onClick={() => openDialog()}>
            <Plus size={18} /> Add Goal
          </button>
        </div>
      </div>

      <div className="goals-content">
        {filteredGoals.length === 0 ? (
          <div className="empty-state">
            <Target size={48} className="empty-icon" />
            <h3>No {filter} goals found</h3>
            <p>Set a new goal to start tracking your progress.</p>
            <button className="primary-btn" onClick={() => openDialog()}>Create Goal</button>
          </div>
        ) : (
          <div className="goals-grid">
            {filteredGoals.map(goal => {
              const daysRemaining = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : null;
              const relatedProjectsCount = projects.filter(p => p.goalId === goal.id).length;
              const relatedTasksCount = tasks.filter(t => t.goalId === goal.id).length;

              return (
                <div 
                  key={goal.id} 
                  className={`goal-card ${selectedGoal?.id === goal.id ? 'selected' : ''}`}
                  style={{ borderLeftColor: goal.color }}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="goal-card-header">
                    <h3>{goal.name}</h3>
                    <div className="status-badge" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                      {goal.status}
                    </div>
                  </div>
                  
                  {goal.description && <p className="goal-description">{goal.description}</p>}
                  
                  <div className="progress-section">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>{Math.round(goal.progress)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                  </div>

                  <div className="goal-meta">
                    {goal.targetDate && (
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span className={daysRemaining && daysRemaining < 0 ? 'overdue' : ''}>
                          {daysRemaining && daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} days overdue` 
                            : `${daysRemaining} days remaining`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="goal-stats">
                    <div className="stat">
                      <span className="stat-val">{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}</span>
                      <span className="stat-label">Milestones</span>
                    </div>
                    <div className="stat">
                      <span className="stat-val">{relatedProjectsCount}</span>
                      <span className="stat-label">Projects</span>
                    </div>
                    <div className="stat">
                      <span className="stat-val">{relatedTasksCount}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedGoal && (
          <div className="goal-detail-panel">
            <div className="panel-header" style={{ borderBottomColor: selectedGoal.color }}>
              <h3>{selectedGoal.name}</h3>
              <div className="panel-actions">
                <button className="icon-btn" onClick={() => openDialog(selectedGoal)}><Edit2 size={18} /></button>
                <button className="icon-btn" onClick={() => setSelectedGoal(null)}><X size={20} /></button>
              </div>
            </div>
            <div className="panel-content">
              <p className="detail-desc">{selectedGoal.description}</p>
              
              <div className="detail-section">
                <h4>Milestones</h4>
                {selectedGoal.milestones.length === 0 ? (
                  <p className="text-muted">No milestones defined.</p>
                ) : (
                  <ul className="milestone-list">
                    {selectedGoal.milestones.map(m => (
                      <li key={m.id} className={m.completed ? 'completed' : ''} onClick={() => toggleMilestone(selectedGoal.id, m.id)}>
                        {m.completed ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} className="text-muted" />}
                        <span>{m.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h2>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button className="icon-btn" onClick={closeDialog}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveGoal}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  autoFocus 
                  placeholder="E.g., Learn Spanish"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is your goal about?"
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Date</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4'].map(c => (
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
              </div>

              <div className="form-group">
                <label>Milestones</label>
                <div className="milestone-input-row">
                  <input 
                    type="text" 
                    value={newMilestoneTitle} 
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                    placeholder="Add a milestone..."
                  />
                  <button type="button" className="secondary-btn" onClick={handleAddMilestone}>Add</button>
                </div>
                <ul className="milestone-edit-list">
                  {milestones.map(m => (
                    <li key={m.id}>
                      <span>{m.title}</span>
                      <button type="button" className="icon-btn danger" onClick={() => handleRemoveMilestone(m.id)}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dialog-footer">
                {editingGoal && (
                  <button type="button" className="danger-btn" onClick={() => handleDeleteGoal(editingGoal.id)}>Delete</button>
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
