import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Save, Download, Upload, Trash2, Sparkles, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { dispatch, state } = useApp();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ivydevs-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { dispatch({ type: 'IMPORT_DATA', payload: JSON.parse(reader.result) }); } catch (err) { alert('Invalid file'); } };
    reader.readAsText(file);
  }

  function resetData() { dispatch({ type: 'RESET_DATA' }); setShowConfirm(false); navigate('/'); }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configuration and data management</p>
      </div>

      {/* Team */}
      <div className="settings-section animate-slide-up stagger-1">
        <h4 className="settings-section-title">Team</h4>
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div className="grid-2" style={{ gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar avatar-viraj avatar-lg">VS</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Viraj Shah</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Co-Founder · Full Stack Developer</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar avatar-ishan avatar-lg">IS</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Ishan</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Co-Founder · Full Stack Developer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section animate-slide-up stagger-2">
        <h4 className="settings-section-title">Data Management</h4>
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Export Data</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Download all data as JSON backup</div>
              </div>
              <button className="btn btn-secondary" onClick={exportData}><Download size={14} /> Export</button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Import Data</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Restore from a JSON backup file</div>
              </div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}><Upload size={14} /> Import<input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} /></label>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--danger)' }}>Reset All Data</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Delete all clients, tasks, and settings</div>
              </div>
              {showConfirm ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="btn btn-danger btn-sm" onClick={resetData}>Confirm Reset</button>
                </div>
              ) : (
                <button className="btn btn-danger" onClick={() => setShowConfirm(true)}><Trash2 size={14} /> Reset</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section animate-slide-up stagger-3">
        <h4 className="settings-section-title">About</h4>
        <div className="glass-card-static" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>IVY DEVS OS</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v2.0 · Internal Operating System for Ivy Devs Studio</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Built by Viraj & Ishan</div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="settings-section animate-slide-up stagger-4">
        <h4 className="settings-section-title">Keyboard Shortcuts</h4>
        <div className="glass-card-static" style={{ padding: 20 }}>
          {[
            { shortcut: '⌘K', desc: 'Command Palette / Global Search' },
            { shortcut: 'Esc', desc: 'Close modals and overlays' },
          ].map(({ shortcut, desc }) => (
            <div key={shortcut} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
              <kbd style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 4, fontSize: '0.75rem', fontFamily: 'inherit' }}>{shortcut}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
