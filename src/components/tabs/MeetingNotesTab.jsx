import { useState } from 'react';
import { createMeetingNote, TEAM_MEMBERS } from '../../data/schema';
import { formatDate } from '../../utils/helpers';
import { Plus, Trash2, BookOpen, Users, CheckSquare } from 'lucide-react';
import { Modal } from '../UIComponents';

export default function MeetingNotesTab({ client, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], attendees: '', content: '', actionItems: '', author: 'viraj' });
  const meetings = client.meetingNotes || [];

  function addMeeting() {
    if (!form.title && !form.content) return;
    dispatch({
      type: 'ADD_MEETING_NOTE',
      payload: { clientId: client.id, meetingNote: createMeetingNote({ ...form, attendees: form.attendees.split(',').map(a => a.trim()).filter(Boolean) }) }
    });
    setForm({ title: '', date: new Date().toISOString().split('T')[0], attendees: '', content: '', actionItems: '', author: 'viraj' });
    setShowModal(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 className="section-title">Client Meeting Notes</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> Add Meeting</button>
      </div>

      {meetings.length === 0 ? (
        <div className="no-results"><BookOpen size={32} style={{ opacity: 0.4, marginBottom: 8 }} /><p>No meeting notes yet</p></div>
      ) : meetings.map(m => (
        <div key={m.id} className="glass-card-static" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.title || 'Meeting Notes'}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>{formatDate(m.date)}</span>
                <span>by {m.author === 'viraj' ? 'Viraj' : 'Ishan'}</span>
              </div>
            </div>
            <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_MEETING_NOTE', payload: { clientId: client.id, meetingNoteId: m.id } })}><Trash2 size={14} /></button>
          </div>
          {m.attendees && m.attendees.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Users size={12} style={{ color: 'var(--text-muted)' }} />
              {m.attendees.map(a => <span key={a} className="task-page-tag">{a}</span>)}
            </div>
          )}
          {m.content && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{m.content}</div>}
          {m.actionItems && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                <CheckSquare size={12} /> Action Items
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{m.actionItems}</div>
            </div>
          )}
        </div>
      ))}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Meeting Notes" footer={
        <><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={addMeeting}><Plus size={16} /> Save</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group"><label className="input-label">Meeting Title</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Client kickoff, Design review" /></div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Date</label><input className="input-field" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Added By</label><select className="input-field" value={form.author} onChange={e => setForm({...form, author: e.target.value})}>{TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          </div>
          <div className="input-group"><label className="input-label">Attendees (comma-separated)</label><input className="input-field" value={form.attendees} onChange={e => setForm({...form, attendees: e.target.value})} placeholder="Client, Viraj, Ishan" /></div>
          <div className="input-group"><label className="input-label">Notes</label><textarea className="input-field" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="What was discussed..." style={{ minHeight: 120 }} /></div>
          <div className="input-group"><label className="input-label">Action Items</label><textarea className="input-field" value={form.actionItems} onChange={e => setForm({...form, actionItems: e.target.value})} placeholder="- Follow up on design\n- Send invoice" style={{ minHeight: 80 }} /></div>
        </div>
      </Modal>
    </div>
  );
}
