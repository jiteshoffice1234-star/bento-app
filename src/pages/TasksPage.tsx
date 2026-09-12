import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useBentoStore } from '../store';
import { TaskItem } from '../components/TaskItem';
import { TaskDialog } from '../components/TaskDialog';
import { Task } from '../types';
import { format, isToday, isPast, parseISO } from 'date-fns';
import './TasksPage.css';

type TabType = 'inbox' | 'today' | 'upcoming' | 'completed';

export const TasksPage: React.FC = () => {
  const { tasks, projects, addTask, updateTask, completeTask, uncompleteTask, deleteTask } = useBentoStore();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeTab === 'completed') return task.status === 'completed';
      if (task.status === 'completed') return false;
      
      const taskDate = task.dueDate ? parseISO(task.dueDate) : null;
      
      switch (activeTab) {
        case 'inbox':
          return task.status === 'inbox' || (!task.dueDate);
        case 'today':
          return task.status === 'today' || (taskDate && isToday(taskDate)) || (taskDate && isPast(taskDate) && !isToday(taskDate));
        case 'upcoming':
          return task.status === 'upcoming' || (taskDate && !isToday(taskDate) && !isPast(taskDate));
        default:
          return true;
      }
    });
  }, [tasks, activeTab]);

  const counts = useMemo(() => {
    return {
      inbox: tasks.filter(t => t.status !== 'completed' && (t.status === 'inbox' || !t.dueDate)).length,
      today: tasks.filter(t => t.status !== 'completed' && (t.status === 'today' || (t.dueDate && (isToday(parseISO(t.dueDate)) || isPast(parseISO(t.dueDate)))))).length,
      upcoming: tasks.filter(t => t.status !== 'completed' && (t.status === 'upcoming' || (t.dueDate && !isToday(parseISO(t.dueDate)) && !isPast(parseISO(t.dueDate))))).length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  }, [tasks]);

  const handleComplete = async (taskId: string, completed: boolean) => {
    if (completed) {
      await completeTask(taskId);
    } else {
      await uncompleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setEditingTask(undefined);
  };

  const handleQuickAdd = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickAddTitle.trim()) {
      await addTask({
        title: quickAddTitle.trim(),
        status: activeTab === 'completed' ? 'inbox' : activeTab as Task['status'],
        priority: 'none'
      });
      setQuickAddTitle('');
    }
  };

  const openNewTask = () => {
    setEditingTask(undefined);
    setIsDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-title">
          <h1>Tasks</h1>
          <span className="task-count">{tasks.filter(t => t.status !== 'completed').length} active</span>
        </div>
        <button className="btn-primary add-btn" onClick={openNewTask}>
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="quick-add-bar">
        <Plus size={18} className="text-muted" />
        <input 
          type="text" 
          placeholder="Quick add task... (Press Enter)" 
          value={quickAddTitle}
          onChange={(e) => setQuickAddTitle(e.target.value)}
          onKeyDown={handleQuickAdd}
        />
      </div>

      <div className="filter-tabs">
        {(['inbox', 'today', 'upcoming', 'completed'] as TabType[]).map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="tab-count">{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className="task-list-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks here</h3>
            <p>Enjoy your free time or add a new task!</p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                project={projects.find(p => p.id === task.projectId)}
                onComplete={handleComplete}
                onEdit={openEditTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};
