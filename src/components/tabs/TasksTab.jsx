import { useState } from 'react';
import { createTask, TASK_STATUSES, TEAM_MEMBERS, PRIORITY_OPTIONS } from '../../data/schema';
import { formatDate, getDaysUntil } from '../../utils/helpers';
import { AssigneeAvatar, PriorityChip } from '../UIComponents';
import { Plus, Trash2, List, Columns, Filter, Clock, AlertTriangle, Search } from 'lucide-react';

export default function TasksTab({ client, dispatch }) {
  const [view, setView] = useState('kanban');
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignee: 'viraj', priority: 'medium', deadline: '', status: 'todo' });
  const tasks = client.tasks || [];

  const filtered = tasks.filter(t => {
    if (filter === 'viraj' && t.assignee !== 'viraj') return false;
    if (filter === 'ishan' && t.assignee !== 'ishan') return false;
    if (filter === 'blocked' && !t.blocker) return false;
    if (filter === 'overdue' && !(t.deadline && getDaysUntil(t.deadline) < 0 && t.status !== 'done')) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function addTask() {
    if (!newTask.title) return;
    dispatch({ type: 'ADD_TASK', payload: { clientId: client.id, item: createTask(newTask) } });
    setNewTask({ title: '', assignee: 'viraj', priority: 'medium', deadline: '', status: 'todo' }); setAdding(false);
  }

  function updateTask(task, updates) {
    dispatch({ type: 'UPDATE_TASK', payload: { clientId: client.id, item: { id: task.id, ...updates } } });
  }

  function cycleStatus(task) {
    const order = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(task.status);
    updateTask(task, { status: order[(idx + 1) % order.length] });
  }

  const blockedCount = tasks.filter(t => t.blocker).length;
  const overdueCount = tasks.filter(t => t.deadline && getDaysUntil(t.deadline) < 0 && t.status !== 'done').length;

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div><h4 className="section-title">Tasks</h4><p className="section-subtitle">{tasks.filter(t => t.status === 'done').length}/{tasks.length} done</p></div>
          {blockedCount > 0 && <span className="blocker-badge">{blockedCount} blocked</span>}
          {overdueCount > 0 && <span style={{ fontSize: '0.625rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontWeight: 700 }}>{overdueCount} overdue</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 140, paddingLeft: 28, padding: '5px 8px 5px 28px', fontSize: '0.75rem' }} />
          </div>
          <select className="input-field" style={{ width: 100, padding: '5px 8px', fontSize: '0.6875rem' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option><option value="viraj">Viraj</option><option value="ishan">Ishan</option><option value="blocked">Blocked</option><option value="overdue">Overdue</option>
          </select>
          <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}><Columns size={12} /></button>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}><List size={12} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Add</button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {TASK_STATUSES.map(status => {
            const columnTasks = filtered.filter(t => t.status === status.value);
            return (
              <div key={status.value} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{status.label}</span>
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>
                {columnTasks.map(task => {
                  const daysLeft = getDaysUntil(task.deadline);
                  const overdue = daysLeft !== null && daysLeft < 0 && task.status !== 'done';
                  return (
                    <div key={task.id} className="kanban-card" onClick={() => cycleStatus(task)}>
                      <div className="kanban-card-title">{task.title}</div>
                      <div className="kanban-card-meta">
                        <AssigneeAvatar assignee={task.assignee} />
                        <PriorityChip priority={task.priority} />
                        {task.blocker && <span className="blocker-badge">Blocked</span>}
                        {overdue && <span style={{ fontSize: '0.5625rem', color: 'var(--danger)', fontWeight: 700 }}>Overdue</span>}
                        {task.deadline && !overdue && <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>{formatDate(task.deadline)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass-card-static" style={{ overflow: 'hidden' }}>
          {filtered.map(task => {
            const daysLeft = getDaysUntil(task.deadline);
            const overdue = daysLeft !== null && daysLeft < 0 && task.status !== 'done';
            return (
              <div key={task.id} className="task-row">
                <div className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`} onClick={() => updateTask(task, { status: task.status === 'done' ? 'todo' : 'done' })} />
                <AssigneeAvatar assignee={task.assignee} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={`task-title ${task.status === 'done' ? 'completed' : ''}`}>{task.title}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                    <PriorityChip priority={task.priority} />
                    {task.blocker && <span className="blocker-badge">Blocked</span>}
                  </div>
                </div>
                <div className="task-meta">
                  {task.estHours > 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{task.actualHours || 0}/{task.estHours}h</span>}
                  {task.deadline && <span className={`task-due ${overdue ? 'overdue' : ''}`}><Clock size={11} /> {formatDate(task.deadline)}</span>}
                  <select className="input-field" style={{ width: 100, padding: '3px 6px', fontSize: '0.6875rem' }} value={task.status}
                    onChange={e => updateTask(task, { status: e.target.value })}>
                    {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_TASK', payload: { clientId: client.id, itemId: task.id } })}><Trash2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No tasks match your filter</div>}
        </div>
      )}

      {adding && (
        <div className="glass-card-static" style={{ padding: 16, marginTop: 12 }}>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <input className="input-field" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
            <input className="input-field" type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
          </div>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <select className="input-field" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
              {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
              {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addTask}>Add Task</button>
          </div>
        </div>
      )}
    </div>
  );
}
