import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, Flag, Folder, Target, AlignLeft, Tag, CheckSquare, Trash2, Plus } from 'lucide-react';
import { Task, Project, Goal, Subtask, Priority } from '../types';
import { useBentoStore } from '../store';
import './TaskDialog.css';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSave: (task: Partial<Task>) => void;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, task, onSave }) => {
  const { projects, goals } = useBentoStore();
  
  const defaultState = {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'none' as Priority,
    status: 'inbox' as Task['status'],
    projectId: '',
    goalId: '',
    tags: [] as string[],
    subtasks: [] as Subtask[],
    notes: ''
  };

  const [formData, setFormData] = useState(defaultState);
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate || '',
          dueTime: task.dueTime || '',
          priority: task.priority || 'none',
          status: task.status,
          projectId: task.projectId || '',
          goalId: task.goalId || '',
          tags: task.tags || [],
          subtasks: task.subtasks || [],
          notes: task.notes || ''
        });
      } else {
        setFormData(defaultState);
      }
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrioritySelect = (priority: Priority) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSubtask = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (newSubtask.trim()) {
        const subtask: Subtask = {
          id: `st-${Date.now()}`,
          title: newSubtask.trim(),
          completed: false
        };
        setFormData(prev => ({
          ...prev,
          subtasks: [...prev.subtasks, subtask]
        }));
        setNewSubtask('');
      }
    }
  };

  const toggleSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const removeSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog task-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-content">
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title..."
              className="form-input title-input"
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label><Calendar size={14} /> Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group half">
              <label><Clock size={14} /> Time</label>
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label><Flag size={14} /> Priority</label>
            <div className="priority-selector">
              {(['none', 'low', 'medium', 'high', 'urgent'] as Priority[]).map(p => (
                <div 
                  key={p}
                  className={`priority-chip ${p} ${formData.priority === p ? 'active' : ''}`}
                  onClick={() => handlePrioritySelect(p)}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label><Folder size={14} /> Project</label>
              <select 
                name="projectId" 
                value={formData.projectId} 
                onChange={handleChange}
                className="form-input"
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group half">
              <label><Target size={14} /> Goal</label>
              <select 
                name="goalId" 
                value={formData.goalId} 
                onChange={handleChange}
                className="form-input"
              >
                <option value="">No Goal</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><AlignLeft size={14} /> Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details..."
              className="form-input"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label><CheckSquare size={14} /> Subtasks</label>
            <div className="subtasks-list">
              {formData.subtasks.map(st => (
                <div key={st.id} className="subtask-item">
                  <input 
                    type="checkbox" 
                    checked={st.completed} 
                    onChange={() => toggleSubtask(st.id)} 
                  />
                  <span className={st.completed ? 'completed' : ''}>{st.title}</span>
                  <button type="button" className="icon-btn-small" onClick={() => removeSubtask(st.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <div className="add-subtask">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={handleAddSubtask}
                  placeholder="Add subtask..."
                  className="form-input small"
                />
                <button type="button" className="btn-small secondary" onClick={handleAddSubtask}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label><Tag size={14} /> Tags</label>
            <div className="tags-container">
              {formData.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (press Enter)"
                className="form-input small tag-input"
              />
            </div>
          </div>

        </form>
        
        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save Task</button>
        </div>
      </div>
    </div>
  );
};
