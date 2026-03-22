import { useState } from 'react';
import { createNote, createMeetingNote, TEAM_MEMBERS } from '../../data/schema';
import { formatRelativeDate, formatDate } from '../../utils/helpers';
import { AssigneeAvatar } from '../UIComponents';
import { Plus, Trash2, StickyNote, MessageCircle, Users } from 'lucide-react';

export default function NotesTab({ client, dispatch }) {
  const [tab, setTab] = useState('notes');
  const [addingNote, setAddingNote] = useState(false);
  const [addingMeeting, setAddingMeeting] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', author: 'viraj' });
  const [newMeeting, setNewMeeting] = useState({ title: '', date: new Date().toISOString().split('T')[0], content: '', actionItems: '', attendees: [], author: 'viraj' });

  function addNote() {
    if (!newNote.content) return;
    dispatch({ type: 'ADD_NOTE', payload: { clientId: client.id, item: createNote(newNote) } });
    setNewNote({ content: '', author: 'viraj' }); setAddingNote(false);
  }

  function addMeeting() {
    if (!newMeeting.title) return;
    dispatch({ type: 'ADD_MEETING_NOTE', payload: { clientId: client.id, item: createMeetingNote(newMeeting) } });
    setNewMeeting({ title: '', date: new Date().toISOString().split('T')[0], content: '', actionItems: '', attendees: [], author: 'viraj' }); setAddingMeeting(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn btn-sm ${tab === 'notes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('notes')}><StickyNote size={12} /> Notes</button>
        <button className={`btn btn-sm ${tab === 'meetings' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('meetings')}><Users size={12} /> Meetings</button>
      </div>

      {tab === 'notes' && (
        <>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="section-subtitle">{(client.notes || []).length} notes</p>
            <button className="btn btn-primary btn-sm" onClick={() => setAddingNote(true)}><Plus size={12} /> Add Note</button>
          </div>
          {addingNote && (
            <div className="glass-card-static" style={{ padding: 16, marginBottom: 12 }}>
              <textarea className="input-field" placeholder="Write a note..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} autoFocus style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <select className="input-field" style={{ width: 100 }} value={newNote.author} onChange={e => setNewNote({...newNote, author: e.target.value})}>{TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAddingNote(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={addNote}>Save</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(client.notes || []).map(note => (
              <div key={note.id} className="glass-card-static" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <AssigneeAvatar assignee={note.author} size="sm" />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{note.content}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{formatRelativeDate(note.timestamp)}</span>
                    <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_NOTE', payload: { clientId: client.id, itemId: note.id } })}><Trash2 size={12} style={{ color: 'var(--text-muted)' }} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(client.notes || []).length === 0 && !addingNote && <div className="empty-state" style={{ padding: 32 }}><p>No notes yet. Add internal notes to keep track of decisions and context.</p></div>}
        </>
      )}

      {tab === 'meetings' && (
        <>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="section-subtitle">{(client.meetingNotes || []).length} meetings</p>
            <button className="btn btn-primary btn-sm" onClick={() => setAddingMeeting(true)}><Plus size={12} /> Log Meeting</button>
          </div>
          {addingMeeting && (
            <div className="glass-card-static" style={{ padding: 16, marginBottom: 12 }}>
              <div className="form-row" style={{ marginBottom: 8 }}>
                <input className="input-field" placeholder="Meeting title" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} autoFocus />
                <input className="input-field" type="date" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} />
              </div>
              <textarea className="input-field" placeholder="Meeting notes..." value={newMeeting.content} onChange={e => setNewMeeting({...newMeeting, content: e.target.value})} style={{ marginBottom: 8 }} />
              <textarea className="input-field" placeholder="Action items (one per line)..." value={newMeeting.actionItems} onChange={e => setNewMeeting({...newMeeting, actionItems: e.target.value})} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingMeeting(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addMeeting}>Save</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(client.meetingNotes || []).map(meeting => (
              <div key={meeting.id} className="glass-card-static" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{meeting.title}</h5>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{formatDate(meeting.date)} · By {TEAM_MEMBERS.find(m => m.id === meeting.author)?.name}</div>
                  </div>
                  <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_MEETING_NOTE', payload: { clientId: client.id, itemId: meeting.id } })}><Trash2 size={12} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
                {meeting.attendees?.length > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Attendees: {meeting.attendees.join(', ')}</div>}
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{meeting.content}</p>
                {meeting.actionItems && (
                  <div style={{ padding: '10px 12px', background: 'rgba(6,214,160,0.05)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>Action Items</div>
                    <pre style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>{meeting.actionItems}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
          {(client.meetingNotes || []).length === 0 && !addingMeeting && <div className="empty-state" style={{ padding: 32 }}><p>No meeting notes. Log meetings with action items.</p></div>}
        </>
      )}
    </div>
  );
}
