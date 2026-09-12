import React from 'react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Check, Calendar, AlertCircle, Clock, Tag } from 'lucide-react';
import { Task, Project } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showProject?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  project,
  onComplete, 
  onEdit, 
  onDelete,
  showProject = true
}) => {
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && task.status !== 'completed';
  const hasDueDate = !!task.dueDate;
  
  const priorityColors = {
    urgent: 'var(--accent-danger, #ef4444)',
    high: 'var(--accent-warning, #f97316)',
    medium: 'var(--accent-info, #eab308)',
    low: 'var(--accent-primary, #3b82f6)',
    none: 'var(--text-muted, #9ca3af)',
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id, task.status !== 'completed');
  };

  const handleContainerClick = () => {
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      onClick={handleContainerClick}
      style={{ borderLeftColor: priorityColors[task.priority || 'none'] }}
    >
      <div className="task-item-checkbox" onClick={handleCheckboxClick}>
        <div className={`checkbox ${task.status === 'completed' ? 'checked' : ''}`}>
          {task.status === 'completed' && <Check size={14} />}
        </div>
      </div>
      
      <div className="task-item-content">
        <div className="task-item-header">
          <h4 className="task-item-title">{task.title}</h4>
          {task.priority && task.priority !== 'none' && (
            <span className={`task-priority-dot ${task.priority}`} title={`Priority: ${task.priority}`} />
          )}
        </div>
        
        <div className="task-item-meta">
          {hasDueDate && (
            <span className={`task-meta-item ${isOverdue ? 'text-danger' : ''}`}>
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              {format(parseISO(task.dueDate!), 'MMM d')}
              {task.dueTime && (
                <>
                  <Clock size={12} className="ml-2" />
                  {task.dueTime}
                </>
              )}
            </span>
          )}
          
          {showProject && project && (
            <span className="task-meta-item project-tag">
              <span className="project-color-dot" style={{ backgroundColor: project.color || 'var(--text-muted)' }} />
              {project.name}
            </span>
          )}

          {task.tags && task.tags.length > 0 && (
            <span className="task-meta-item">
              <Tag size={12} />
              {task.tags[0]}
              {task.tags.length > 1 && ` +${task.tags.length - 1}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
