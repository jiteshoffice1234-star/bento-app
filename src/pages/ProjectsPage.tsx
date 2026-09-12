import React, { useState } from 'react';
import { useBentoStore } from '../store';
import { Project, ProjectStatus } from '../types';
import { Plus, Edit2, Trash2, Calendar, Target, CheckSquare, Settings2, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import './ProjectsPage.css';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  'active': '#22c55e',
  'on-hold': '#eab308',
  'completed': '#3b82f6',
  'archived': '#6b7280'
};

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, goals, addProject, updateProject, deleteProject } = useBentoStore();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  const handleSave = () => {
    if (editingProject) {
      if (editingProject.id) {
        updateProject(editingProject.id, editingProject);
      } else {
        addProject(editingProject as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setEditingProject(null);
    }
  };

  const MOCK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

  return (
    <div className="projects-page">
      <header className="page-header">
        <h1>Projects</h1>
        <button className="btn-primary" onClick={() => setEditingProject({ name: '', status: 'active', color: MOCK_COLORS[0], progress: 0 })}>
          <Plus size={18} /> Add Project
        </button>
      </header>

      <div className="filters">
        {(['all', 'active', 'on-hold', 'completed', 'archived'] as const).map(f => (
          <button 
            key={f} 
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <Settings2 size={48} className="empty-icon" />
          <h3>No projects found</h3>
          <p>Create a project to organize related tasks toward a specific outcome.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            const relatedGoal = goals.find(g => g.id === project.goalId);
            
            let daysLeft = null;
            if (project.deadline) {
              daysLeft = differenceInDays(new Date(project.deadline), new Date());
            }

            return (
              <div key={project.id} className="project-card" style={{ '--project-color': project.color } as React.CSSProperties}>
                <div className="project-header">
                  <div className="project-title-area">
                    <h3>{project.name}</h3>
                    <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[project.status] }}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="project-actions-btns">
                    <button onClick={() => setEditingProject(project)} className="btn-icon"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProject(project.id)} className="btn-icon text-red"><Trash2 size={16} /></button>
                  </div>
                </div>

                <p className="project-desc">{project.description}</p>

                <div className="project-stats">
                  <div className="stat">
                    <CheckSquare size={14} />
                    <span>{completedTasks}/{projectTasks.length} tasks</span>
                  </div>
                  {project.deadline && (
                    <div className={`stat ${daysLeft !== null && daysLeft < 0 ? 'text-red' : ''}`}>
                      <Calendar size={14} />
                      <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                      {daysLeft !== null && (
                        <span className="days-left">
                          ({daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`})
                        </span>
                      )}
                    </div>
                  )}
                  {relatedGoal && (
                    <div className="stat">
                      <Target size={14} />
                      <span>{relatedGoal.name}</span>
                    </div>
                  )}
                </div>

                <div className="project-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress}%`, backgroundColor: project.color }}></div>
                  </div>
                  <span className="progress-text">{project.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingProject && (
        <div className="dialog-overlay">
          <div className="dialog project-dialog">
            <h2>{editingProject.id ? 'Edit' : 'Add'} Project</h2>
            <div className="dialog-content">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editingProject.name || ''} 
                  onChange={e => setEditingProject({...editingProject, name: e.target.value})} 
                  placeholder="Project Name" 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={editingProject.description || ''} 
                  onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={editingProject.status || 'active'} 
                    onChange={e => setEditingProject({...editingProject, status: e.target.value as ProjectStatus})}
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input 
                    type="date" 
                    value={editingProject.deadline || ''} 
                    onChange={e => setEditingProject({...editingProject, deadline: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Progress (%)</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={editingProject.progress || 0}
                  onChange={e => setEditingProject({...editingProject, progress: parseInt(e.target.value)})}
                />
                <div className="range-val">{editingProject.progress || 0}%</div>
              </div>

              <div className="form-group">
                <label>Related Goal</label>
                <select 
                  value={editingProject.goalId || ''} 
                  onChange={e => setEditingProject({...editingProject, goalId: e.target.value || null})}
                >
                  <option value="">None</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {MOCK_COLORS.map(c => (
                    <button 
                      key={c} 
                      className={`color-btn ${editingProject.color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditingProject({...editingProject, color: c})}
                    />
                  ))}
                </div>
              </div>

            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setEditingProject(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
