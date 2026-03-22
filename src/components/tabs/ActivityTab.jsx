import { formatRelativeDate } from '../../utils/helpers';
import { ACTIVITY_TYPES } from '../../data/schema';
import { CheckCircle2, DollarSign, FileText, MessageCircle, Send, Calendar, Rocket, AlertTriangle, StickyNote, Users, GitBranch, Target } from 'lucide-react';

const TYPE_CONFIG = {
  client_created: { icon: Users, color: '#6b7280', label: 'Client' },
  status_changed: { icon: GitBranch, color: '#3b82f6', label: 'Status' },
  proposal_sent: { icon: Send, color: '#818cf8', label: 'Proposal' },
  proposal_approved: { icon: CheckCircle2, color: '#06d6a0', label: 'Proposal' },
  payment_received: { icon: DollarSign, color: '#10b981', label: 'Payment' },
  milestone_completed: { icon: Target, color: '#a78bfa', label: 'Milestone' },
  task_completed: { icon: CheckCircle2, color: '#06d6a0', label: 'Task' },
  deliverable_submitted: { icon: FileText, color: '#3b82f6', label: 'Deliverable' },
  deliverable_approved: { icon: CheckCircle2, color: '#06d6a0', label: 'Deliverable' },
  feedback_received: { icon: MessageCircle, color: '#f59e0b', label: 'Feedback' },
  site_launched: { icon: Rocket, color: '#06d6a0', label: 'Launch' },
  note_added: { icon: StickyNote, color: '#6b7280', label: 'Note' },
  scope_changed: { icon: AlertTriangle, color: '#f97316', label: 'Scope' },
  meeting_logged: { icon: Calendar, color: '#a78bfa', label: 'Meeting' },
};

export default function ActivityTab({ client }) {
  const logs = client.activityLog || [];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h4 className="section-title">Activity Log</h4>
        <span className="section-subtitle">{logs.length} events</span>
      </div>

      {logs.length > 0 ? (
        <div className="timeline">
          {logs.map(log => {
            const config = TYPE_CONFIG[log.type] || { icon: CheckCircle2, color: '#6b7280', label: 'Event' };
            const Icon = config.icon;
            return (
              <div key={log.id} className="timeline-item">
                <div className="timeline-dot" style={{ background: config.color, borderColor: config.color }} />
                <div className="timeline-content">
                  <div className="timeline-time">{formatRelativeDate(log.timestamp)}</div>
                  <div className="timeline-title">{log.description}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: '0.5625rem', padding: '2px 6px', background: `${config.color}15`, color: config.color, borderRadius: 8, fontWeight: 600 }}>{config.label}</span>
                    {log.author && log.author !== 'system' && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>by {log.author}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><h3>No activity yet</h3><p>Events will appear here as you work on this project.</p></div>
      )}
    </div>
  );
}
