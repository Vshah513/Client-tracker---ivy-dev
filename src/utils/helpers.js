// ─── Formatting ───

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateStr);
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// ─── Progress / Stats ───

export function getClientProgress(client) {
  const pages = client.pages || [];
  if (pages.length === 0) return 0;
  return Math.round(pages.reduce((s, p) => s + (p.progress || 0), 0) / pages.length);
}

export function getPageProgress(client) {
  return getClientProgress(client);
}

export function getMilestoneProgress(client) {
  const ms = client.milestones || [];
  if (ms.length === 0) return 0;
  return Math.round(ms.reduce((s, m) => s + (m.progress || 0), 0) / ms.length);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.blocker).length;
  const overdue = tasks.filter(t => t.deadline && getDaysUntil(t.deadline) < 0 && t.status !== 'done').length;
  return { total, done, inProgress, blocked, overdue, completion: total ? Math.round((done / total) * 100) : 0 };
}

export function getFinancialsPending(client) {
  return (client.financials?.totalAgreed || 0) - (client.financials?.totalReceived || 0);
}

export function getProfit(client) {
  return (client.financials?.totalReceived || 0) - (client.financials?.internalCostEstimate || 0);
}

export function getMargin(client) {
  const received = client.financials?.totalReceived || 0;
  if (received === 0) return 0;
  return Math.round(((received - (client.financials?.internalCostEstimate || 0)) / received) * 100);
}

// ─── Health Scoring ───

export function calculateHealthScore(client) {
  let score = 100;
  const now = new Date();
  // Overdue tasks
  const overdueTasks = (client.tasks || []).filter(t => t.deadline && getDaysUntil(t.deadline) < 0 && t.status !== 'done').length;
  score -= overdueTasks * 10;
  // Blocked tasks
  const blockedTasks = (client.tasks || []).filter(t => t.blocker).length;
  score -= blockedTasks * 15;
  // Target date risk
  if (client.targetDate) {
    const daysLeft = getDaysUntil(client.targetDate);
    const progress = getClientProgress(client);
    if (daysLeft !== null && daysLeft < 7 && progress < 80) score -= 20;
    if (daysLeft !== null && daysLeft < 0) score -= 30;
  }
  // Revision rounds
  if (client.revisionCount > 2) score -= (client.revisionCount - 2) * 5;
  // Outstanding payment
  const pending = getFinancialsPending(client);
  if (pending > 0 && client.financials?.totalAgreed > 0) {
    const pct = pending / client.financials.totalAgreed;
    if (pct > 0.5) score -= 10;
  }
  // Unresolved feedback
  const unresolvedFeedback = (client.feedback || []).filter(f => !f.resolved && f.priority === 'high').length;
  score -= unresolvedFeedback * 5;

  if (score >= 80) return 'on_track';
  if (score >= 60) return 'watchlist';
  if (score >= 40) return 'at_risk';
  return 'delayed';
}

export function getClientReadinessScore(client) {
  let score = 0;
  const scope = client.scope || {};
  if (scope.brandingStatus === 'complete') score += 25;
  else if (scope.brandingStatus === 'in_progress') score += 10;
  if (scope.contentStatus === 'complete') score += 25;
  else if (scope.contentStatus === 'in_progress') score += 10;
  if (scope.items?.length > 0) score += 25;
  if (client.proposal?.status === 'approved') score += 15;
  if (client.financials?.depositPaid) score += 10;
  return Math.min(score, 100);
}

export function getScopeCreepWarning(client) {
  const crs = client.scope?.changeRequests || [];
  const approved = crs.filter(cr => cr.approved).length;
  if (approved >= 4) return 'critical';
  if (approved >= 2) return 'warning';
  return null;
}

// ─── Aggregations ───

export function getBusinessFinancials(clients) {
  const pipeline = clients.filter(c => !['completed', 'archived', 'paused'].includes(c.status))
    .reduce((s, c) => s + (c.financials?.totalAgreed || c.proposal?.amountProposed || 0), 0);
  const totalAgreed = clients.reduce((s, c) => s + (c.financials?.totalAgreed || 0), 0);
  const totalReceived = clients.reduce((s, c) => s + (c.financials?.totalReceived || 0), 0);
  const totalOutstanding = totalAgreed - totalReceived;
  const totalCosts = clients.reduce((s, c) => s + (c.financials?.internalCostEstimate || 0), 0);
  const totalProfit = totalReceived - totalCosts;
  const avgProjectValue = clients.length ? Math.round(totalAgreed / clients.filter(c => c.financials?.totalAgreed > 0).length || 0) : 0;
  return { pipeline, totalAgreed, totalReceived, totalOutstanding, totalCosts, totalProfit, avgProjectValue };
}

export function getOverdueTasks(clients) {
  return clients.flatMap(c =>
    (c.tasks || []).filter(t => t.deadline && getDaysUntil(t.deadline) < 0 && t.status !== 'done')
      .map(t => ({ ...t, clientName: c.name, clientId: c.id }))
  );
}

export function getDueThisWeek(clients) {
  return clients.flatMap(c =>
    (c.deliverables || []).filter(d => {
      const days = getDaysUntil(d.dueDate);
      return days !== null && days >= 0 && days <= 7 && d.status !== 'approved';
    }).map(d => ({ ...d, clientName: c.name, clientId: c.id }))
  );
}

export function getBlockedTasks(clients) {
  return clients.flatMap(c =>
    (c.tasks || []).filter(t => t.blocker).map(t => ({ ...t, clientName: c.name, clientId: c.id }))
  );
}

export function getAtRiskClients(clients) {
  return clients.filter(c => c.health === 'at_risk' || c.health === 'delayed');
}

export function getWaitingOnClient(clients) {
  const items = [];
  clients.forEach(c => {
    (c.deliverables || []).filter(d => d.status === 'submitted' && !d.approved).forEach(d => {
      items.push({ type: 'approval', title: d.title, clientName: c.name, clientId: c.id });
    });
    if (c.scope?.contentStatus === 'not_started' || c.scope?.contentStatus === 'in_progress') {
      items.push({ type: 'content', title: 'Content delivery', clientName: c.name, clientId: c.id });
    }
    if (c.proposal?.status === 'sent') {
      items.push({ type: 'proposal', title: 'Proposal response', clientName: c.name, clientId: c.id });
    }
  });
  return items;
}

export function getRecentActivity(clients, limit = 10) {
  return clients.flatMap(c =>
    (c.activityLog || []).map(a => ({ ...a, clientName: c.name, clientId: c.id }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

export function getMemberStats(clients, memberId) {
  const allTasks = clients.flatMap(c =>
    (c.tasks || []).filter(t => t.assignee === memberId).map(t => ({ ...t, clientName: c.name, clientId: c.id }))
  );
  const allPages = clients.flatMap(c =>
    (c.pages || []).filter(p => p.owner === memberId).map(p => ({ ...p, clientName: c.name, clientId: c.id }))
  );
  const stats = getTaskStats(allTasks);
  const assignedClients = [...new Set(allTasks.map(t => t.clientId).concat(allPages.map(p => p.clientId)))];
  const totalHours = allTasks.reduce((s, t) => s + (t.actualHours || 0), 0);
  const estHours = allTasks.reduce((s, t) => s + (t.estHours || 0), 0);
  const upcomingDeadlines = allTasks.filter(t => {
    const days = getDaysUntil(t.deadline);
    return days !== null && days >= 0 && days <= 7 && t.status !== 'done';
  });
  return { ...stats, tasks: allTasks, pages: allPages, assignedClients: assignedClients.length, totalHours, estHours, upcomingDeadlines };
}

// ─── Search ───

export function searchAll(clients, query) {
  if (!query || query.length < 2) return { clients: [], tasks: [], pages: [] };
  const q = query.toLowerCase();
  const matchedClients = clients.filter(c =>
    c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.contactName?.toLowerCase().includes(q)
  );
  const matchedTasks = clients.flatMap(c =>
    (c.tasks || []).filter(t => t.title.toLowerCase().includes(q)).map(t => ({ ...t, clientName: c.name, clientId: c.id }))
  );
  const matchedPages = clients.flatMap(c =>
    (c.pages || []).filter(p => p.name.toLowerCase().includes(q)).map(p => ({ ...p, clientName: c.name, clientId: c.id }))
  );
  return { clients: matchedClients, tasks: matchedTasks, pages: matchedPages };
}
