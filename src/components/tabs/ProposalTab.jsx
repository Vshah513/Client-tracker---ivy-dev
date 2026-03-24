import { useState } from 'react';
import { PIPELINE_STAGES } from '../../data/schema';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FileText, ExternalLink, DollarSign, Calendar, Clock, CheckCircle2, Send, UploadCloud, Loader2, Save } from 'lucide-react';
import { supabase } from '../../utils/supabase';

export default function ProposalTab({ client, dispatch, syncClient }) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const p = client.proposal || {};
  function updateP(updates) { dispatch({ type: 'UPDATE_PROPOSAL', payload: { clientId: client.id, proposal: updates } }); }

  async function handleSave() {
    setSaving(true);
    try {
      if (syncClient) {
        await syncClient(client);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${client.id}-${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage 'proposals' bucket
    const { error: uploadError } = await supabase.storage
      .from('proposals')
      .upload(fileName, file);

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}\n\nPlease ensure a public Storage bucket named "proposals" exists in your Supabase dashboard and accepts inserts.`);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from('proposals').getPublicUrl(fileName);
    if (data && data.publicUrl) {
      const updatedP = { ...p, url: data.publicUrl };
      updateP({ url: data.publicUrl });
      
      // Auto-save to cloud immediately after upload
      if (syncClient) {
        setSaving(true);
        await syncClient({ ...client, proposal: updatedP });
        setSaving(false);
      }
    }
    setUploading(false);
  }

  const STEPS = [
    { value: 'none', label: 'Not Started', icon: Clock },
    { value: 'draft', label: 'Drafting', icon: FileText },
    { value: 'sent', label: 'Sent', icon: Send },
    { value: 'approved', label: 'Approved', icon: CheckCircle2 },
  ];
  const currentIdx = STEPS.findIndex(s => s.value === p.status);

  return (
    <div>
      {/* Stepper */}
      <div className="glass-card-static" style={{ padding: 24, marginBottom: 20 }}>
        <div className="proposal-stepper" style={{ position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.value} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className={`proposal-step ${i <= currentIdx ? 'active' : ''} ${i === currentIdx ? 'current' : ''}`}
                onClick={() => updateP({ status: step.value })}>
                <div className="proposal-step-circle"><step.icon size={14} /></div>
                <span className="proposal-step-label">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--accent)' : 'var(--border)', margin: '0 -4px', marginBottom: 20 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Details */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0 }}>Proposal Details</h4>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleSave} 
              disabled={saving}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-row">
              <div className="input-group"><label className="input-label">Version</label>
                <input className="input-field" type="number" value={p.version || 1} onChange={e => updateP({ version: Number(e.target.value) })} /></div>
              <div className="input-group"><label className="input-label">Amount Proposed</label>
                <input className="input-field" type="number" value={p.amountProposed || ''} onChange={e => updateP({ amountProposed: Number(e.target.value) })} /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label className="input-label">Timeline Proposed</label>
                <input className="input-field" value={p.timelineProposed || ''} onChange={e => updateP({ timelineProposed: e.target.value })} placeholder="e.g. 6-8 weeks" /></div>
              <div className="input-group"><label className="input-label">Deposit Required</label>
                <input className="input-field" type="number" value={p.depositRequired || ''} onChange={e => updateP({ depositRequired: Number(e.target.value) })} /></div>
            </div>
            <div className="input-group"><label className="input-label">Scope Summary</label>
              <textarea className="input-field" value={p.scopeSummary || ''} onChange={e => updateP({ scopeSummary: e.target.value })} placeholder="High-level scope description..." /></div>
            <div className="input-group"><label className="input-label">Proposal URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" value={p.url || ''} onChange={e => updateP({ url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={12} /> Open</a>}
              </div>
              <div style={{ marginTop: 8 }}>
                <input type="file" id="proposal-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                <label 
                  htmlFor="proposal-upload" 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: 'fit-content', cursor: uploading ? 'not-allowed' : 'pointer', pointerEvents: uploading ? 'none' : 'auto' }}
                >
                  {uploading ? (
                    <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : <UploadCloud size={14} />}
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </label>
              </div>
            </div>
            <div className="input-group"><label className="input-label">Notes</label>
              <textarea className="input-field" value={p.notes || ''} onChange={e => updateP({ notes: e.target.value })} /></div>
          </div>
        </div>

        {/* Contract & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Contract Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Signed Date</span>
                <input className="input-field" type="date" style={{ width: 150, padding: '3px 8px', fontSize: '0.75rem' }} value={p.signedDate || ''} onChange={e => updateP({ signedDate: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Final Agreed Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(client.financials?.totalAgreed)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontWeight: 600, color: p.signedDate ? 'var(--accent)' : 'var(--warning)' }}>{p.signedDate ? '✓ Signed' : '⏳ Unsigned'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 14 }}>Pipeline Stage</h4>
            <select className="input-field" value={client.pipelineStage || 'lead'} onChange={e => dispatch({ type: 'UPDATE_CLIENT', payload: { id: client.id, pipelineStage: e.target.value } })}>
              {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
