import React, { useMemo, useEffect } from 'react';
import { useBentoStore } from '../store';
import { Search, CheckSquare, Target, Activity, Calendar, Zap, LayoutGrid } from 'lucide-react';
import './SearchPage.css';

export const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery, tasks, projects, goals, habits, routines, events } = useBentoStore();

  // Clear query on unmount if you want, or keep it

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const q = searchQuery.toLowerCase();

    return {
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)),
      projects: projects.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)),
      goals: goals.filter(g => g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)),
      habits: habits.filter(h => h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q)),
      routines: routines.filter(r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)),
      events: events.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
    };
  }, [searchQuery, tasks, projects, goals, habits, routines, events]);

  const totalResults = results 
    ? Object.values(results).reduce((acc, curr) => acc + curr.length, 0)
    : 0;

  return (
    <div className="search-page">
      <header className="page-header search-header">
        <div className="search-input-wrapper">
          <Search className="search-icon-large" size={24} />
          <input 
            type="text"
            className="huge-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, projects, goals..."
            autoFocus
          />
        </div>
      </header>

      {!searchQuery.trim() ? (
        <div className="empty-state">
          <Search size={48} className="empty-icon" />
          <h3>Search Bento</h3>
          <p>Type to find anything across your workspace.</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="empty-state">
          <h3>No results found for "{searchQuery}"</h3>
          <p>Try using different keywords.</p>
        </div>
      ) : results ? (
        <div className="search-results">
          {results.tasks.length > 0 && (
            <section className="result-group">
              <h3><CheckSquare size={18} /> Tasks ({results.tasks.length})</h3>
              <div className="result-list">
                {results.tasks.map(t => (
                  <div key={t.id} className="result-item">
                    <span className={`status-dot ${t.status}`}></span>
                    <div className="result-content">
                      <h4>{t.title}</h4>
                      {t.description && <p>{t.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.projects.length > 0 && (
            <section className="result-group">
              <h3><LayoutGrid size={18} /> Projects ({results.projects.length})</h3>
              <div className="result-list">
                {results.projects.map(p => (
                  <div key={p.id} className="result-item">
                    <div className="result-content">
                      <h4>{p.name}</h4>
                      <p>{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.goals.length > 0 && (
            <section className="result-group">
              <h3><Target size={18} /> Goals ({results.goals.length})</h3>
              <div className="result-list">
                {results.goals.map(g => (
                  <div key={g.id} className="result-item">
                    <div className="result-content">
                      <h4>{g.name}</h4>
                      <p>{g.progress}% completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.habits.length > 0 && (
            <section className="result-group">
              <h3><Activity size={18} /> Habits ({results.habits.length})</h3>
              <div className="result-list">
                {results.habits.map(h => (
                  <div key={h.id} className="result-item">
                    <div className="result-content">
                      <h4>{h.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.routines.length > 0 && (
            <section className="result-group">
              <h3><Zap size={18} /> Routines ({results.routines.length})</h3>
              <div className="result-list">
                {results.routines.map(r => (
                  <div key={r.id} className="result-item">
                    <div className="result-content">
                      <h4>{r.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {results.events.length > 0 && (
            <section className="result-group">
              <h3><Calendar size={18} /> Events ({results.events.length})</h3>
              <div className="result-list">
                {results.events.map(e => (
                  <div key={e.id} className="result-item">
                    <div className="result-content">
                      <h4>{e.title}</h4>
                      <p>{e.startDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
};
