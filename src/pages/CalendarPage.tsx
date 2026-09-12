import React, { useState, useMemo } from 'react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useBentoStore } from '../store';
import { CalendarEvent } from '../types';
import './CalendarPage.css';

// We'll generate times from 6am to 11pm
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent, tasks } = useBentoStore();
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dialog state
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [notes, setNotes] = useState('');

  const tasksDueToday = tasks.filter((t) => t.dueDate === format(currentDate, 'yyyy-MM-dd') && t.status !== 'completed');

  const nextDay = () => setCurrentDate(addDays(currentDate, view === 'day' ? 1 : 7));
  const prevDay = () => setCurrentDate(subDays(currentDate, view === 'day' ? 1 : 7));
  const goToday = () => setCurrentDate(new Date());

  const openDialog = (event?: CalendarEvent, timeSlot?: string) => {
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setStartDate(event.startDate);
      setStartTime(event.startTime);
      setEndDate(event.endDate);
      setEndTime(event.endTime);
      setAllDay(event.allDay);
      setColor(event.color);
      setNotes(event.notes);
    } else {
      setEditingEvent(null);
      setTitle('');
      setStartDate(format(currentDate, 'yyyy-MM-dd'));
      setStartTime(timeSlot || '09:00');
      setEndDate(format(currentDate, 'yyyy-MM-dd'));
      setEndTime(timeSlot ? String((parseInt(timeSlot.split(':')[0]) + 1)).padStart(2, '0') + ':00' : '10:00');
      setAllDay(false);
      setColor('#6366f1');
      setNotes('');
    }
    setIsEventDialogOpen(true);
  };

  const closeDialog = () => {
    setIsEventDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        startDate,
        startTime,
        endDate,
        endTime,
        allDay,
        color,
        notes,
      });
    } else {
      addEvent({
        title,
        description: '',
        startDate,
        startTime,
        endDate,
        endTime,
        allDay,
        color,
        notes,
        taskId: null,
        routineId: null,
        recurrence: null,
      });
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      closeDialog();
    }
  };

  const currentEvents = useMemo(() => {
    if (view === 'day') {
      return events.filter(e => e.startDate === format(currentDate, 'yyyy-MM-dd'));
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
      return events.filter(e => days.includes(e.startDate));
    }
  }, [events, currentDate, view]);

  const daysInWeek = view === 'week' ? eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  }) : [currentDate];

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="icon-btn" onClick={prevDay}><ChevronLeft size={20} /></button>
          <h2>{format(currentDate, view === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}</h2>
          <button className="icon-btn" onClick={nextDay}><ChevronRight size={20} /></button>
          <button className="today-btn" onClick={goToday}>Today</button>
        </div>
        <div className="calendar-actions">
          <div className="view-toggle desktop-only">
            <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
            <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
          </div>
          <button className="primary-btn" onClick={() => openDialog()}>
            <Plus size={18} /> <span className="desktop-only">Add Event</span>
          </button>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-sidebar desktop-only">
           <MiniCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
           {view === 'day' && tasksDueToday.length > 0 && (
             <div className="tasks-due">
               <h3>Tasks Due Today</h3>
               <ul>
                 {tasksDueToday.map(t => (
                   <li key={t.id}>{t.title}</li>
                 ))}
               </ul>
             </div>
           )}
        </div>

        <div className={`calendar-grid ${view}-view`}>
          {view === 'week' && (
            <div className="grid-header-row">
              <div className="time-col-header"></div>
              {daysInWeek.map(day => (
                <div key={day.toString()} className={`day-col-header ${isToday(day) ? 'is-today' : ''}`}>
                  <div className="day-name">{format(day, 'EEE')}</div>
                  <div className="day-date">{format(day, 'd')}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid-body">
            {HOURS.map(hour => (
              <div key={hour} className="time-row">
                <div className="time-label">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="time-slots">
                  {daysInWeek.map(day => {
                     const dayStr = format(day, 'yyyy-MM-dd');
                     const hourStr = String(hour).padStart(2, '0');
                     const dayEvents = currentEvents.filter(e => e.startDate === dayStr);
                     
                     return (
                       <div 
                         key={`${dayStr}-${hour}`} 
                         className="time-cell"
                         onClick={() => openDialog(undefined, `${hourStr}:00`)}
                       >
                         {dayEvents.map(evt => {
                           const startHour = parseInt(evt.startTime.split(':')[0]);
                           if (startHour === hour) {
                             return (
                               <div 
                                 key={evt.id} 
                                 className="event-block"
                                 style={{ backgroundColor: evt.color, borderColor: evt.color }}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   openDialog(evt);
                                 }}
                               >
                                 <span className="event-title">{evt.title}</span>
                                 {!evt.allDay && <span className="event-time">{evt.startTime}</span>}
                               </div>
                             );
                           }
                           return null;
                         })}
                       </div>
                     )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEventDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h2>{editingEvent ? 'Edit Event' : 'New Event'}</h2>
              <button className="icon-btn" onClick={closeDialog}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  autoFocus 
                  placeholder="Event title"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group checkbox-group" style={{marginTop: 'auto', marginBottom: '10px'}}>
                  <label>
                    <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
                    All Day
                  </label>
                </div>
              </div>
              {!allDay && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6'].map(c => (
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
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={3}
                />
              </div>
              <div className="dialog-footer">
                {editingEvent && (
                  <button type="button" className="danger-btn" onClick={handleDelete}>Delete</button>
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

function MiniCalendar({ currentDate, setCurrentDate }: { currentDate: Date, setCurrentDate: (d: Date) => void }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const rows = [];
  
  let days = [];
  let day = startDate;
  let formattedDate = "";
  
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      days.push(
        <div
          className={`mini-col cell ${!isSameDay(day, monthStart) && day.getMonth() !== monthStart.getMonth() ? "disabled" : ""} ${isSameDay(day, currentDate) ? "selected" : ""} ${isToday(day) ? "today" : ""}`}
          key={day.toString()}
          onClick={() => setCurrentDate(cloneDay)}
        >
          <span className="number">{formattedDate}</span>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="mini-row" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }
  
  return (
    <div className="mini-calendar">
      <div className="mini-header">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={16}/></button>
        <span>{format(currentDate, "MMMM yyyy")}</span>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={16}/></button>
      </div>
      <div className="mini-days">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="mini-body">{rows}</div>
    </div>
  );
}
