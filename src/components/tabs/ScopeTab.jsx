import { useState } from 'react';
import { createScopeItem, createChangeRequest, SCOPE_ITEM_TYPES } from '../../data/schema';
import { getClientReadinessScore } from '../../utils/helpers';
import { ProgressRing } from '../UIComponents';
import { Plus, Trash2, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ScopeTab({ client, dispatch }) {
  const [addingItem, setAddingItem] = useState(false);
  const [addingCR, setAddingCR] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'page', name: '', notes: '' });
  const [newCR, setNewCR] = useState({ description: '', impact: 'low' });
  const scope = client.scope || {};
  const readiness = getClientReadinessScore(client);

  const statusIcon = (s) => {
    if (s === 'done') return <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />;
    if (s === 'in_progress') return <Clock size={14} style={{ color: 'var(--warning)' }} />;
    return <XCircle size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  function addScopeItem() {
    if (!newItem.name) return;
    dispatch({ type: 'ADD_SCOPE_ITEM', payload: { clientId: client.id, item: createScopeItem(newItem) } });
    setNewItem({ type: 'page', name: '', notes: '' }); setAddingItem(false);
  }

  function addCR() {
    if (!newCR.description) return;
    dispatch({ type: 'ADD_CHANGE_REQUEST', payload: { clientId: client.id, item: createChangeRequest(newCR) } });
    setNewCR({ description: '', impact: 'low' }); setAddingCR(false);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Scope Items */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div className="section-header">
            <div><h4 className="section-title">Scope Items</h4><p className="section-subtitle">{scope.items?.length || 0} items ({(scope.items || []).filter(i => i.status === 'done').length} complete)</p></div>
            <button className="btn btn-secondary btn-sm" onClick={() => setAddingItem(true)}><Plus size={12} /> Add</button>
          </div>
          {(scope.items || []).map(item => (
            <div key={item.id} className="scope-item">
              {statusIcon(item.status)}
              <span className={`scope-type-tag scope-type-${item.type}`}>{item.type}</span>
              <span style={{ flex: 1 }}>{item.name}</span>
              <select className="input-field" style={{ width: 110, padding: '4px 8px', fontSize: '0.6875rem' }} value={item.status}
                onChange={e => dispatch({ type: 'UPDATE_SCOPE_ITEM', payload: { clientId: client.id, item: { id: item.id, status: e.target.value } } })}>
                <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="done">Done</option><option value="not_started">Not Started</option>
              </select>
              <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_SCOPE_ITEM', payload: { clientId: client.id, itemId: item.id } })}><Trash2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
          ))}
          {(scope.items || []).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No scope items yet</div>}
          {addingItem && (
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>
              <div className="form-row-3" style={{ marginBottom: 8 }}>
                <select className="input-field" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>{SCOPE_ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                <input className="input-field" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ gridColumn: 'span 2' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingItem(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addScopeItem}>Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Change Requests */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div className="section-header">
            <div><h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> Change Requests</h4></div>
            <button className="btn btn-secondary btn-sm" onClick={() => setAddingCR(true)}><Plus size={12} /> Add</button>
          </div>
          {(scope.changeRequests || []).map(cr => (
            <div key={cr.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{cr.description}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Impact: {cr.impact} • {cr.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className={`btn btn-sm ${cr.approved ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => dispatch({ type: 'ADD_CHANGE_REQUEST', payload: { clientId: client.id, item: { ...cr, approved: !cr.approved } } })}>
                  {cr.approved ? '✓ Approved' : 'Pending'}
                </button>
                <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_CHANGE_REQUEST', payload: { clientId: client.id, itemId: cr.id } })}><Trash2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
            </div>
          ))}
          {(scope.changeRequests || []).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No change requests</div>}
          {addingCR && (
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>
              <input className="input-field" placeholder="Describe the change request" value={newCR.description} onChange={e => setNewCR({...newCR, description: e.target.value})} style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <select className="input-field" style={{ width: 100 }} value={newCR.impact} onChange={e => setNewCR({...newCR, impact: e.target.value})}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingCR(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addCR}>Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Exclusions */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 10 }}>Out of Scope / Exclusions</h4>
          <textarea className="input-field" value={scope.exclusions || ''} placeholder="Document what is NOT included in this project..."
            onChange={e => dispatch({ type: 'UPDATE_SCOPE', payload: { clientId: client.id, scope: { exclusions: e.target.value } } })} />
        </div>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card-static" style={{ padding: 20, textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>Client Readiness</h4>
          <ProgressRing percentage={readiness} size={80} strokeWidth={5} />
          <p style={{ marginTop: 8, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Based on branding, content, scope, and deposit status</p>
        </div>
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>Status</h4>
          {[
            { label: 'Content', value: scope.contentStatus || 'not_started' },
            { label: 'Branding', value: scope.brandingStatus || 'not_started' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <select className="input-field" style={{ width: 130, padding: '3px 6px', fontSize: '0.6875rem' }} value={value}
                onChange={e => dispatch({ type: 'UPDATE_SCOPE', payload: { clientId: client.id, scope: { [`${label.toLowerCase()}Status`]: e.target.value } } })}>
                <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="complete">Complete</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
