import { useState } from 'react';
import { createDocument, DOCUMENT_CATEGORIES } from '../../data/schema';
import { Plus, Trash2, ExternalLink, Globe, Figma, Github, Server, FileText, Key, Image, FolderOpen, Link2 } from 'lucide-react';

const CATEGORY_ICONS = { website: Globe, design: Figma, code: Github, hosting: Server, docs: FileText, brand: Image, credentials: Key, other: FolderOpen };
const CATEGORY_COLORS = { website: '#06d6a0', design: '#a78bfa', code: '#818cf8', hosting: '#3b82f6', docs: '#f59e0b', brand: '#f97316', credentials: '#ef4444', other: '#6b7280' };

export default function AssetsTab({ client, dispatch }) {
  const [adding, setAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', url: '', category: 'website', notes: '' });
  const docs = client.documents || [];

  function add() {
    if (!newDoc.title) return;
    dispatch({ type: 'ADD_DOCUMENT', payload: { clientId: client.id, item: createDocument(newDoc) } });
    setNewDoc({ title: '', url: '', category: 'website', notes: '' }); setAdding(false);
  }

  const grouped = DOCUMENT_CATEGORIES.reduce((acc, cat) => {
    const items = docs.filter(d => d.category === cat.value);
    if (items.length > 0) acc.push({ ...cat, items });
    return acc;
  }, []);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div><h4 className="section-title">Assets & Links</h4><p className="section-subtitle">{docs.length} items</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Add</button>
      </div>

      {grouped.map(group => {
        const Icon = CATEGORY_ICONS[group.value] || FolderOpen;
        const color = CATEGORY_COLORS[group.value] || '#6b7280';
        return (
          <div key={group.value} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{group.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
              {group.items.map(doc => (
                <div key={doc.id} className="doc-card" onClick={() => doc.url && window.open(doc.url, '_blank')}>
                  <div className="doc-card-icon" style={{ background: `${color}15`, color }}><Icon size={16} /></div>
                  <div className="doc-card-info">
                    <div className="doc-card-title">{doc.title}</div>
                    {doc.url && <div className="doc-card-url">{doc.url}</div>}
                    {doc.notes && <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{doc.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {doc.url && <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />}
                    <button className="btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_DOCUMENT', payload: { clientId: client.id, itemId: doc.id } }); }}>
                      <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {docs.length === 0 && <div className="empty-state"><h3>No assets yet</h3><p>Add links to live site, staging, Figma, GitHub, hosting, credentials, and more.</p></div>}

      {adding && (
        <div className="glass-card-static" style={{ padding: 16, marginTop: 12 }}>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <input className="input-field" placeholder="Title" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} autoFocus />
            <select className="input-field" value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})}>{DOCUMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
          </div>
          <input className="input-field" placeholder="URL" value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={add}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
