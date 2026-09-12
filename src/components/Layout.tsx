import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, CheckSquare, Calendar, Target, Wallet, Flame, Repeat, 
  Folder, BarChart2, Sparkles, Settings, Menu, Plus, X 
} from 'lucide-react';
import { useBentoStore } from '../store';
import { TaskDialog } from './TaskDialog';
import './Layout.css';

const navItems = [
  { path: '/', label: 'Today', icon: Sun, group: 'main' },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare, group: 'main' },
  { path: '/calendar', label: 'Calendar', icon: Calendar, group: 'main' },
  { path: '/goals', label: 'Goals', icon: Target, group: 'planning' },
  { path: '/finance', label: 'Finance', icon: Wallet, group: 'planning' },
  { path: '/projects', label: 'Projects', icon: Folder, group: 'planning' },
  { path: '/habits', label: 'Habits', icon: Flame, group: 'tracking' },
  { path: '/routines', label: 'Routines', icon: Repeat, group: 'tracking' },
  { path: '/insights', label: 'Insights', icon: BarChart2, group: 'intelligence' },
  { path: '/ai', label: 'AI', icon: Sparkles, group: 'intelligence' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addTask } = useBentoStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickAdd = async (taskData: any) => {
    const payload = {
      ...taskData,
      title: taskData.title?.trim() || 'New task',
      status: taskData.status || 'inbox',
      priority: taskData.priority || 'none',
    };

    await addTask(payload);
    setIsQuickAddOpen(false);
    if (location.pathname !== '/tasks') {
      navigate('/tasks');
    }
  };

  const renderNavLinks = (group: string) => {
    return navItems
      .filter(item => item.group === group)
      .map(item => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ));
  };

  return (
    <div className="layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <span>B</span>
            </div>
            <div className="logo-copy">
              <div className="logo-kicker">Bento 2.1</div>
              <h2>Life OS</h2>
            </div>
          </div>
        </div>
        
        <div className="sidebar-content">
          <div className="nav-group">
            {renderNavLinks('main')}
          </div>
          <div className="nav-separator"></div>
          <div className="nav-group">
            <div className="nav-group-title">Planning</div>
            {renderNavLinks('planning')}
          </div>
          <div className="nav-separator"></div>
          <div className="nav-group">
            <div className="nav-group-title">Tracking</div>
            {renderNavLinks('tracking')}
          </div>
          <div className="nav-separator"></div>
          <div className="nav-group">
            <div className="nav-group-title">Intelligence</div>
            {renderNavLinks('intelligence')}
          </div>
        </div>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Sun size={24} />
          <span>Today</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={24} />
          <span>Tasks</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={24} />
          <span>Calendar</span>
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Target size={24} />
          <span>Goals</span>
        </NavLink>
        <NavLink to="/finance" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={24} />
          <span>Finance</span>
        </NavLink>
        <button 
          className={`mobile-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
          <span>More</span>
        </button>
      </div>

      {/* Mobile More Menu Sheet */}
      {isMobileMenuOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
            <div className="mobile-sheet-header">
              <h3>More</h3>
              <button className="btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-sheet-content">
              {navItems.filter(item => !['main', 'planning'].includes(item.group) || item.label === 'Projects').map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `mobile-sheet-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <NavLink to="/settings" className={({ isActive }) => `mobile-sheet-item ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Settings size={20} />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fab"
        aria-label="Quick Add"
        onClick={() => setIsQuickAddOpen(true)}
        type="button"
      >
        <Plus size={24} />
      </button>

      <TaskDialog
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleQuickAdd}
      />
    </div>
  );
};

export default Layout;
