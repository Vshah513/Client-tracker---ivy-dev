import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createClient, CLIENT_STATUSES, PROJECT_TYPES, PRIORITY_OPTIONS, PIPELINE_STAGES } from '../data/schema';
import { Save, ArrowLeft } from 'lucide-react';

export default function ClientForm() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    name: '', company: '', contactName: '', contactEmail: '', contactPhone: '',
    idea: '', description: '', businessGoal: '', targetAudience: '', competitors: '',
    projectType: 'website', techStack: '', status: 'lead', health: 'on_track', priority: 'medium',
    pipelineStage: 'lead', startDate: '', targetDate: '',
    totalAgreed: 0, depositAmount: 0,
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return;
    const newClient = createClient({
      ...form,
      financials: { totalAgreed: Number(form.totalAgreed), depositAmount: Number(form.depositAmount), totalReceived: 0, depositPaid: false, totalInvoiced: 0, internalCostEstimate: 0, laborHoursEstimate: 0, paymentSchedule: '', paymentMethod: '' },
    });
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    navigate(`/clients/${newClient.id}`);
  }

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="page-header animate-slide-up">
        <button className="btn btn-ghost" onClick={() => navigate('/clients')} style={{ marginBottom: 8 }}><ArrowLeft size={14} /> Back</button>
        <h1 className="page-title">New Client</h1>
        <p className="page-subtitle">Create a new client project</p>
      </div>

      <form onSubmit={handleSubmit} className="animate-slide-up stagger-2">
        <div className="glass-card-static" style={{ padding: 24, marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Basic Information</h4>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="input-group"><label className="input-label">Client / Project Name *</label><input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} required autoFocus /></div>
            <div className="input-group"><label className="input-label">Company</label><input className="input-field" value={form.company} onChange={e => set('company', e.target.value)} /></div>
          </div>
          <div className="form-row-3" style={{ marginBottom: 16 }}>
            <div className="input-group"><label className="input-label">Contact Name</label><input className="input-field" value={form.contactName} onChange={e => set('contactName', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input-field" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} /></div>
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}><label className="input-label">The Idea (one-liner)</label><input className="input-field" value={form.idea} onChange={e => set('idea', e.target.value)} placeholder="What are we building?" /></div>
          <div className="input-group"><label className="input-label">Full Description</label><textarea className="input-field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed project description..." /></div>
        </div>

        <div className="glass-card-static" style={{ padding: 24, marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Project Details</h4>
          <div className="form-row-3" style={{ marginBottom: 16 }}>
            <div className="input-group"><label className="input-label">Type</label><select className="input-field" value={form.projectType} onChange={e => set('projectType', e.target.value)}>{PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Priority</label><select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>{PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Pipeline Stage</label><select className="input-field" value={form.pipelineStage} onChange={e => set('pipelineStage', e.target.value)}>{PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="input-group"><label className="input-label">Start Date</label><input className="input-field" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Target Delivery</label><input className="input-field" type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Business Goal</label><textarea className="input-field" value={form.businessGoal} onChange={e => set('businessGoal', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Target Audience</label><textarea className="input-field" value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)} /></div>
          </div>
        </div>

        <div className="glass-card-static" style={{ padding: 24, marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Financials</h4>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Total Agreed ($)</label><input className="input-field" type="number" value={form.totalAgreed} onChange={e => set('totalAgreed', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Deposit Amount ($)</label><input className="input-field" type="number" value={form.depositAmount} onChange={e => set('depositAmount', e.target.value)} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Save size={14} /> Create Client</button>
        </div>
      </form>
    </div>
  );
}
