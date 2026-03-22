// ─── ID Generator ───
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// ─── ENUMS ───

export const CLIENT_STATUSES = [
  { value: 'lead', label: 'Lead', color: '#f59e0b' },
  { value: 'discovery', label: 'Discovery', color: '#a78bfa' },
  { value: 'proposal', label: 'Proposal', color: '#818cf8' },
  { value: 'active', label: 'Active', color: '#06d6a0' },
  { value: 'review', label: 'Review', color: '#3b82f6' },
  { value: 'revisions', label: 'Revisions', color: '#f97316' },
  { value: 'paused', label: 'Paused', color: '#6b7280' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
  { value: 'archived', label: 'Archived', color: '#475569' },
];

export const HEALTH_STATUSES = [
  { value: 'on_track', label: 'On Track', color: '#06d6a0', icon: '●' },
  { value: 'watchlist', label: 'Watchlist', color: '#f59e0b', icon: '◐' },
  { value: 'at_risk', label: 'At Risk', color: '#f97316', icon: '◑' },
  { value: 'delayed', label: 'Delayed', color: '#ef4444', icon: '○' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const PROJECT_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'webapp', label: 'Web App' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'saas', label: 'SaaS MVP' },
  { value: 'redesign', label: 'Redesign' },
  { value: 'other', label: 'Other' },
];

export const PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead' },
  { value: 'discovery_scheduled', label: 'Discovery Scheduled' },
  { value: 'proposal_drafting', label: 'Proposal Drafting' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'deposit_received', label: 'Deposit Received' },
  { value: 'converted', label: 'Converted to Active' },
];

export const MILESTONE_DEFAULTS = [
  'Discovery', 'Proposal', 'Research', 'Wireframes', 'UI Design',
  'Client Approval', 'Frontend Build', 'Backend / CMS', 'Content Upload',
  'QA / Testing', 'Revisions', 'Launch', 'Post-Launch Support',
];

export const MILESTONE_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
];

export const TASK_STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

export const PAGE_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'designing', label: 'Designing' },
  { value: 'building', label: 'Building' },
  { value: 'review', label: 'In Review' },
  { value: 'revisions', label: 'Revisions' },
  { value: 'done', label: 'Done' },
];

export const DELIVERABLE_TYPES = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'figma', label: 'Figma Design' },
  { value: 'demo', label: 'Demo / Preview' },
  { value: 'live_build', label: 'Live Build' },
  { value: 'revision', label: 'Revision' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'handoff', label: 'Final Handoff' },
];

export const DELIVERABLE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Needs Changes' },
  { value: 'overdue', label: 'Overdue' },
];

export const FEEDBACK_CATEGORIES = [
  { value: 'design', label: 'Design' },
  { value: 'content', label: 'Content' },
  { value: 'functionality', label: 'Functionality' },
  { value: 'bug', label: 'Bug' },
  { value: 'ux', label: 'UX/Flow' },
  { value: 'general', label: 'General' },
];

export const DOCUMENT_CATEGORIES = [
  { value: 'website', label: 'Website Links' },
  { value: 'design', label: 'Design Files' },
  { value: 'code', label: 'Code & Repos' },
  { value: 'hosting', label: 'Hosting & Domain' },
  { value: 'docs', label: 'Documents' },
  { value: 'brand', label: 'Brand Assets' },
  { value: 'credentials', label: 'Credentials' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wise', label: 'Wise' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
];

export const LAUNCH_CHECKLIST_DEFAULTS = [
  { category: 'QA', items: ['Responsive QA (mobile/tablet/desktop)', 'Form testing', 'Cross-browser testing (Chrome, Safari, Firefox)', 'Link checking', 'Image optimization', '404 page'] },
  { category: 'SEO', items: ['Page titles & meta descriptions', 'Open Graph tags', 'Sitemap.xml', 'Robots.txt', 'Structured data', 'Alt text on images'] },
  { category: 'Technical', items: ['Favicon & app icons', 'SSL certificate active', 'Domain connected', 'Analytics installed', 'Performance audit', 'Error monitoring'] },
  { category: 'Content', items: ['All content finalized', 'Legal pages (privacy, terms)', 'Contact info verified', 'CTA buttons working'] },
  { category: 'Handoff', items: ['Client training/walkthrough', 'Documentation prepared', 'Backup configured', 'Credentials shared securely', 'Post-launch monitoring plan'] },
];

export const ACTIVITY_TYPES = [
  'client_created', 'status_changed', 'proposal_sent', 'proposal_approved',
  'payment_received', 'milestone_completed', 'task_completed', 'deliverable_submitted',
  'deliverable_approved', 'feedback_received', 'site_launched', 'note_added',
  'scope_changed', 'meeting_logged',
];

export const TEAM_MEMBERS = [
  { id: 'viraj', name: 'Viraj', initials: 'VS', role: 'Co-Founder', color: 'var(--accent)' },
  { id: 'ishan', name: 'Ishan', initials: 'IS', role: 'Co-Founder', color: 'var(--accent-secondary)' },
];

export const SCOPE_ITEM_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'feature', label: 'Feature' },
  { value: 'integration', label: 'Integration' },
];

// ─── ENTITY FACTORIES ───

export const createClient = (d = {}) => ({
  id: generateId(), name: d.name || '', company: d.company || '',
  contactName: d.contactName || '', contactEmail: d.contactEmail || '',
  contactPhone: d.contactPhone || '', contactWhatsApp: d.contactWhatsApp || '',
  idea: d.idea || '', description: d.description || '',
  projectType: d.projectType || 'website',
  status: d.status || 'lead', priority: d.priority || 'medium',
  health: d.health || 'on_track',
  pipelineStage: d.pipelineStage || 'lead',
  startDate: d.startDate || '', targetDate: d.targetDate || '',
  launchDate: d.launchDate || '',
  businessGoal: d.businessGoal || '', targetAudience: d.targetAudience || '',
  competitors: d.competitors || '',
  revisionCount: d.revisionCount || 0,
  techStack: d.techStack || '',
  // Sub-entities
  financials: { totalAgreed: 0, totalReceived: 0, depositAmount: 0, depositPaid: false, paymentMethod: '', paymentSchedule: '', internalCostEstimate: 0, laborHoursEstimate: 0, ...(d.financials || {}) },
  proposal: { status: 'none', version: 1, amountProposed: 0, timelineProposed: '', scopeSummary: '', depositRequired: 0, signedDate: '', url: '', notes: '', ...(d.proposal || {}) },
  scope: { items: [], changeRequests: [], exclusions: '', contentStatus: 'not_started', brandingStatus: 'not_started', clientReadiness: 0, ...(d.scope || {}) },
  milestones: d.milestones || [],
  tasks: d.tasks || [],
  pages: d.pages || [],
  deliverables: d.deliverables || [],
  payments: d.payments || [],
  feedback: d.feedback || [],
  notes: d.notes || [],
  meetingNotes: d.meetingNotes || [],
  documents: d.documents || [],
  activityLog: d.activityLog || [],
  launchChecklist: d.launchChecklist || [],
  createdAt: d.createdAt || new Date().toISOString(),
  updatedAt: d.updatedAt || new Date().toISOString(),
});

export const createMilestone = (d = {}) => ({
  id: generateId(), title: d.title || '', owner: d.owner || '',
  dueDate: d.dueDate || '', status: d.status || 'not_started',
  progress: d.progress || 0, blockers: d.blockers || '',
  dependencies: d.dependencies || '', notes: d.notes || '',
  deliverables: d.deliverables || [],
  createdAt: new Date().toISOString(),
});

export const createTask = (d = {}) => ({
  id: generateId(), title: d.title || '', description: d.description || '',
  milestoneId: d.milestoneId || '', pageId: d.pageId || '',
  assignee: d.assignee || 'viraj', status: d.status || 'todo',
  priority: d.priority || 'medium',
  estHours: d.estHours || 0, actualHours: d.actualHours || 0,
  deadline: d.deadline || '', progress: d.progress || 0,
  blocker: d.blocker || false, blockerNote: d.blockerNote || '',
  comments: d.comments || '', internalNotes: d.internalNotes || '',
  createdAt: new Date().toISOString(),
});

export const createPage = (d = {}) => ({
  id: generateId(), name: d.name || '', owner: d.owner || 'viraj',
  stage: d.stage || 'not_started', progress: d.progress || 0,
  notes: d.notes || '', lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

export const createDeliverable = (d = {}) => ({
  id: generateId(), title: d.title || '', type: d.type || 'demo',
  owner: d.owner || 'viraj', dueDate: d.dueDate || '',
  submittedDate: d.submittedDate || '', status: d.status || 'pending',
  approved: d.approved || false, clientFeedback: d.clientFeedback || '',
  linkedUrl: d.linkedUrl || '', notes: d.notes || '',
  createdAt: new Date().toISOString(),
});

export const createPayment = (d = {}) => ({
  id: generateId(), amount: d.amount || 0,
  date: d.date || new Date().toISOString().split('T')[0],
  method: d.method || 'bank_transfer', platform: d.platform || '',
  invoiceRef: d.invoiceRef || '', notes: d.notes || '',
});

export const createFeedback = (d = {}) => ({
  id: generateId(), source: d.source || 'client',
  date: d.date || new Date().toISOString().split('T')[0],
  category: d.category || 'general', priority: d.priority || 'medium',
  text: d.text || '', owner: d.owner || '',
  resolved: d.resolved || false, linkedItem: d.linkedItem || '',
  createdAt: new Date().toISOString(),
});

export const createNote = (d = {}) => ({
  id: generateId(), content: d.content || '',
  author: d.author || 'viraj', timestamp: new Date().toISOString(),
});

export const createMeetingNote = (d = {}) => ({
  id: generateId(), title: d.title || '',
  date: d.date || new Date().toISOString().split('T')[0],
  attendees: d.attendees || [], content: d.content || '',
  actionItems: d.actionItems || '', author: d.author || 'viraj',
  createdAt: new Date().toISOString(),
});

export const createDocument = (d = {}) => ({
  id: generateId(), title: d.title || '', url: d.url || '',
  category: d.category || 'other', notes: d.notes || '',
  createdAt: new Date().toISOString(),
});

export const createScopeItem = (d = {}) => ({
  id: generateId(), type: d.type || 'page',
  name: d.name || '', status: d.status || 'pending',
  notes: d.notes || '',
});

export const createChangeRequest = (d = {}) => ({
  id: generateId(), description: d.description || '',
  impact: d.impact || 'low', approved: d.approved || false,
  date: d.date || new Date().toISOString().split('T')[0],
  notes: d.notes || '',
});

export const createLaunchItem = (d = {}) => ({
  id: generateId(), title: d.title || '', category: d.category || '',
  checked: d.checked || false, notes: d.notes || '',
});

export const createActivityLog = (d = {}) => ({
  id: generateId(), type: d.type || 'note_added',
  description: d.description || '', author: d.author || 'system',
  metadata: d.metadata || {}, timestamp: new Date().toISOString(),
});
