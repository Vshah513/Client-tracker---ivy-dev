import { useState } from 'react';
import { createPage, PAGE_STATUSES, TEAM_MEMBERS } from '../../data/schema';
import { formatDate, getDaysUntil } from '../../utils/helpers';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Modal } from '../UIComponents';

export default function PagesTab({ client, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [newPage, setNewPage] = useState({ name: '', assignedTo: 'viraj', description: '', dueDate: '' });
  const pages = client.pages || [];

  function addPage() {
    if (!newPage.name) return;
    dispatch({ type: 'ADD_PAGE', payload: { clientId: client.id, page: createPage(newPage) } });
    setNewPage({ name: '', assignedTo: 'viraj', description: '', dueDate: '' });
    setShowModal(false);
  }

  function updatePage(pageId, updates) {
    dispatch({ type: 'UPDATE_PAGE', payload: { clientId: client.id, page: { id: pageId, ...updates } } });
  }

  const virajPages = pages.filter(p => p.assignedTo === 'viraj');
  const ishanPages = pages.filter(p => p.assignedTo === 'ishan');

  function renderPageCard(page) {
    const daysUntil = getDaysUntil(page.dueDate);
    return (
      <div key={page.id} className="glass-card-static" style={{ padding: 16, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: page.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: page.status === 'done' ? 'line-through' : 'none' }}>{page.name}</span>
          <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_PAGE', payload: { clientId: client.id, pageId: page.id } })}><Trash2 size={14} /></button>
        </div>
        {page.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>{page.description}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <select className="input-field" value={page.status} onChange={e => updatePage(page.id, { status: e.target.value, progress: e.target.value === 'done' ? 100 : page.progress })} style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem' }}>
            {PAGE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input-field" value={page.assignedTo} onChange={e => updatePage(page.id, { assignedTo: e.target.value })} style={{ width: 100, padding: '6px 10px', fontSize: '0.75rem' }}>
            {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', width: 30 }}>{page.progress}%</span>
          <input type="range" min="0" max="100" step="5" value={page.progress} onChange={e => updatePage(page.id, { progress: Number(e.target.value), status: Number(e.target.value) === 100 ? 'done' : (Number(e.target.value) > 0 ? 'in_progress' : page.status) })}
            style={{ flex: 1, accentColor: 'var(--accent)' }} />
          {page.dueDate && (
            <span style={{ fontSize: '0.6875rem', color: daysUntil < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
              <Clock size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />{formatDate(page.dueDate)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className="section-title">Page Assignments</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> Add Page</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="avatar avatar-viraj avatar-sm">VS</div>
            <div><div style={{ fontWeight: 700 }}>Viraj</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{virajPages.filter(p=>p.status==='done').length}/{virajPages.length} pages done</div></div>
          </div>
          {virajPages.length === 0 ? <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '12px 0' }}>No pages assigned</p> : virajPages.map(renderPageCard)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="avatar avatar-ishan avatar-sm">IS</div>
            <div><div style={{ fontWeight: 700 }}>Ishan</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{ishanPages.filter(p=>p.status==='done').length}/{ishanPages.length} pages done</div></div>
          </div>
          {ishanPages.length === 0 ? <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '12px 0' }}>No pages assigned</p> : ishanPages.map(renderPageCard)}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Page" footer={
        <><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={addPage}><Plus size={16} /> Add</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Page Name</label><input className="input-field" value={newPage.name} onChange={e => setNewPage({...newPage, name: e.target.value})} placeholder="e.g. Homepage, About, Contact" /></div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Assign To</label><select className="input-field" value={newPage.assignedTo} onChange={e => setNewPage({...newPage, assignedTo: e.target.value})}>{TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Due Date</label><input className="input-field" type="date" value={newPage.dueDate} onChange={e => setNewPage({...newPage, dueDate: e.target.value})} /></div>
          </div>
          <div className="input-group"><label className="input-label">Description</label><textarea className="input-field" value={newPage.description} onChange={e => setNewPage({...newPage, description: e.target.value})} placeholder="What should this page include?" /></div>
        </div>
      </Modal>
    </div>
  );
}
