import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { StickyNote, Plus, Trash2, User, MessageCircle, Send } from 'lucide-react';

export default function TeamBoard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Use a special record in Supabase to sync team notes
  // We'll use a 'clients' row with a specific name for simplicity
  const BOARD_NAME = '_TEAM_CORE_BOARD_';

  useEffect(() => {
    if (!user) return;
    fetchNotes();
    
    // Set up realtime subscription if possible
    const channel = supabase
      .channel('team_notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `name=eq.${BOARD_NAME}` }, fetchNotes)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('clients')
      .select('data')
      .eq('name', BOARD_NAME)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching team notes:', error);
    } else if (data) {
      setNotes(data.data.notes || []);
    }
    setLoading(false);
  }

  async function syncNotes(updatedNotes) {
    setNotes(updatedNotes);
    
    const { data, error } = await supabase
      .from('clients')
      .upsert({
        name: BOARD_NAME,
        user_id: user.id,
        data: { notes: updatedNotes },
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' });

    if (error) console.error('Error syncing notes:', error);
  }

  function addNote() {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      content: newNote,
      author: user.email.split('@')[0],
      authorId: user.id,
      timestamp: new Date().toISOString(),
      color: ['#7c3aed', '#d4af37', '#06d6a0', '#3b82f6'][Math.floor(Math.random() * 4)]
    };
    syncNotes([note, ...notes]);
    setNewNote('');
  }

  function deleteNote(id) {
    syncNotes(notes.filter(n => n.id !== id));
  }

  if (loading) return null;

  return (
    <div className="widget animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <StickyNote size={14} />
          </div>
          <div>
            <span className="widget-title" style={{ fontSize: '0.8125rem', letterSpacing: '0.1em' }}>Intelligence Board</span>
            <div className="widget-subtitle" style={{ fontSize: '0.625rem', opacity: 0.6 }}>Strategic Nodes & Directives</div>
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: 1,
        background: 'var(--border)',
        padding: 1,
        marginTop: 20,
        minHeight: 240
      }}>
        {notes.length === 0 && (
          <div style={{ 
            gridColumn: '1/-1', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            padding: 40
          }}>
            <MessageCircle size={24} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Operational silence</p>
          </div>
        )}
        
        {notes.map(note => (
          <div key={note.id} className="team-note-card" style={{ 
            padding: 24, 
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <button 
              onClick={() => deleteNote(note.id)}
              style={{ 
                position: 'absolute', top: 12, right: 12, 
                background: 'none', border: 'none', color: 'var(--text-muted)', 
                cursor: 'pointer', padding: 4 
              }}
            >
              <Trash2 size={10} />
            </button>

            <div style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {note.content}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{note.author}</span>
              </div>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 1 }}>
        <input 
          className="input-field" 
          placeholder="ENTER DIRECTIVE..." 
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          style={{ flex: 1, height: 48, borderRadius: 0, border: '1px solid var(--border)', background: 'var(--bg-card)', padding: '0 16px', fontSize: '0.75rem', letterSpacing: '0.1em' }}
        />
        <button className="btn btn-primary" onClick={addNote} style={{ width: 48, height: 48, padding: 0, justifyContent: 'center' }}>
          <Send size={14} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .team-note-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .team-note-card:hover {
          background: var(--bg-hover) !important;
          box-shadow: inset 0 0 0 1px var(--accent);
          z-index: 10;
        }
        .input-field:focus {
          outline: none;
          border-color: var(--accent) !important;
        }
      `}} />
    </div>
  );
}
