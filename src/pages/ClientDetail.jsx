import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClient } from '../context/AppContext';
import { StatusBadge, HealthBadge, PriorityChip, Modal } from '../components/UIComponents';
import { CLIENT_STATUSES, HEALTH_STATUSES, PRIORITY_OPTIONS, PROJECT_TYPES } from '../data/schema';
import { getClientProgress, getMilestoneProgress, getFinancialsPending, formatCurrency } from '../utils/helpers';
import { Edit3, Trash2, Save, Layers, Target, Flag, CheckSquare, Calendar as CalIcon, DollarSign, FileText, FolderOpen, MessageCircle, StickyNote, Activity } from 'lucide-react';
import OverviewTab from '../components/tabs/OverviewTab';
import ScopeTab from '../components/tabs/ScopeTab';
import MilestonesTab from '../components/tabs/MilestonesTab';
import TasksTab from '../components/tabs/TasksTab';
import DeliverablesTab from '../components/tabs/DeliverablesTab';
import FinancialsTab from '../components/tabs/FinancialsTab';
import ProposalTab from '../components/tabs/ProposalTab';
import AssetsTab from '../components/tabs/AssetsTab';
import FeedbackTab from '../components/tabs/FeedbackTab';
import NotesTab from '../components/tabs/NotesTab';
import ActivityTab from '../components/tabs/ActivityTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'scope', label: 'Scope', icon: Target },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'deliverables', label: 'Deliverables', icon: CalIcon },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'proposal', label: 'Proposal', icon: FileText },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, dispatch } = useClient(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  if (!client) return (
    <div className="page"><div className="empty-state"><h3>Client not found</h3><button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/clients')}>Back to Clients</button></div></div>
  );

  function startEdit() { setForm({ ...client, financials: { ...client.financials } }); setEditing(true); }
  function saveEdit() { dispatch({ type: 'UPDATE_CLIENT', payload: form }); setEditing(false); }

  const progress = getClientProgress(client);
  const msProgress = getMilestoneProgress(client);
  const pending = getFinancialsPending(client);

  const tabComponents = {
    overview: <OverviewTab client={client} dispatch={dispatch} progress={progress} msProgress={msProgress} pending={pending} />,
    scope: <ScopeTab client={client} dispatch={dispatch} />,
    milestones: <MilestonesTab client={client} dispatch={dispatch} />,
    tasks: <TasksTab client={client} dispatch={dispatch} />,
    deliverables: <DeliverablesTab client={client} dispatch={dispatch} />,
    financials: <FinancialsTab client={client} dispatch={dispatch} pending={pending} />,
    proposal: <ProposalTab client={client} dispatch={dispatch} />,
    assets: <AssetsTab client={client} dispatch={dispatch} />,
    feedback: <FeedbackTab client={client} dispatch={dispatch} />,
    notes: <NotesTab client={client} dispatch={dispatch} />,
    activity: <ActivityTab client={client} />,
  };

  return (
    <div className="page">
      <div className="detail-breadcrumb animate-fade-in">
        <Link to="/clients">Clients</Link><span>/</span><span style={{ color: 'var(--text-primary)' }}>{client.name}</span>
      </div>

      <div className="detail-header animate-slide-up">
        <div className="detail-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{client.name}</h1>
            <StatusBadge status={client.status} />
            <HealthBadge health={client.health} />
            <PriorityChip priority={client.priority} />
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{client.idea}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            {client.company && <span>{client.company}</span>}
            {client.contactName && <span>· {client.contactName}</span>}
            {client.contactEmail && <span>· {client.contactEmail}</span>}
          </div>
        </div>
        <div className="detail-header-right">
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{progress}%</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Progress</div>
          </div>
          <button className="btn btn-secondary" onClick={startEdit}><Edit3 size={14} /> Edit</button>
          <button className="btn btn-danger" onClick={() => { if (confirm('Delete this client?')) { dispatch({ type: 'DELETE_CLIENT', payload: client.id }); navigate('/clients'); } }}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="tabs animate-slide-up stagger-2" style={{ marginBottom: 24 }}>
        {TABS.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={13} />{tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">{tabComponents[activeTab]}</div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Client" wide footer={
        <><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}><Save size={14} /> Save</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Client Name</label><input className="input-field" value={form.name||''} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Company</label><input className="input-field" value={form.company||''} onChange={e => setForm({...form, company: e.target.value})} /></div>
          </div>
          <div className="form-row-3">
            <div className="input-group"><label className="input-label">Contact</label><input className="input-field" value={form.contactName||''} onChange={e => setForm({...form, contactName: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input-field" value={form.contactEmail||''} onChange={e => setForm({...form, contactEmail: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={form.contactPhone||''} onChange={e => setForm({...form, contactPhone: e.target.value})} /></div>
          </div>
          <div className="form-row-3">
            <div className="input-group"><label className="input-label">Status</label><select className="input-field" value={form.status||'lead'} onChange={e => setForm({...form, status: e.target.value})}>{CLIENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Health</label><select className="input-field" value={form.health||'on_track'} onChange={e => setForm({...form, health: e.target.value})}>{HEALTH_STATUSES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Priority</label><select className="input-field" value={form.priority||'medium'} onChange={e => setForm({...form, priority: e.target.value})}>{PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
          </div>
          <div className="form-row-3">
            <div className="input-group"><label className="input-label">Project Type</label><select className="input-field" value={form.projectType||'website'} onChange={e => setForm({...form, projectType: e.target.value})}>{PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Start Date</label><input className="input-field" type="date" value={form.startDate||''} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Target Delivery</label><input className="input-field" type="date" value={form.targetDate||''} onChange={e => setForm({...form, targetDate: e.target.value})} /></div>
          </div>
          <div className="input-group"><label className="input-label">Idea / One-Liner</label><input className="input-field" value={form.idea||''} onChange={e => setForm({...form, idea: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">Full Description</label><textarea className="input-field" value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Business Goal</label><textarea className="input-field" value={form.businessGoal||''} onChange={e => setForm({...form, businessGoal: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Target Audience</label><textarea className="input-field" value={form.targetAudience||''} onChange={e => setForm({...form, targetAudience: e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Competitors / Inspiration</label><input className="input-field" value={form.competitors||''} onChange={e => setForm({...form, competitors: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Tech Stack</label><input className="input-field" value={form.techStack||''} onChange={e => setForm({...form, techStack: e.target.value})} /></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Total Agreed ($)</label><input className="input-field" type="number" value={form.financials?.totalAgreed||0} onChange={e => setForm({...form, financials:{...form.financials, totalAgreed: Number(e.target.value)}})} /></div>
            <div className="input-group"><label className="input-label">Revision Count</label><input className="input-field" type="number" value={form.revisionCount||0} onChange={e => setForm({...form, revisionCount: Number(e.target.value)})} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
