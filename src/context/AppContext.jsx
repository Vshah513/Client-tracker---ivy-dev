import { createContext, useContext, useReducer } from 'react';
import { sampleClients } from '../data/sampleData';
import { createActivityLog } from '../data/schema';

const AppContext = createContext(null);
const STORAGE_KEY = 'ivydevs_os_data';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Load failed:', e); }
  return { clients: sampleClients };
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.error('Save failed:', e); }
}

function logActivity(client, type, description, author = 'system') {
  const log = createActivityLog({ type, description, author });
  return [log, ...(client.activityLog || [])];
}

function updateClient(state, clientId, updater, activityType, activityDesc, activityAuthor) {
  return {
    ...state,
    clients: state.clients.map(c => {
      if (c.id !== clientId) return c;
      const updated = typeof updater === 'function' ? updater(c) : { ...c, ...updater };
      updated.updatedAt = new Date().toISOString();
      if (activityType) {
        updated.activityLog = logActivity(c, activityType, activityDesc, activityAuthor);
      }
      return updated;
    }),
  };
}

// Generic sub-entity helpers
function addToArray(client, key, item) { return { ...client, [key]: [...(client[key] || []), item] }; }
function updateInArray(client, key, id, updates) { return { ...client, [key]: (client[key] || []).map(x => x.id === id ? { ...x, ...updates } : x) }; }
function removeFromArray(client, key, id) { return { ...client, [key]: (client[key] || []).filter(x => x.id !== id) }; }
function prependToArray(client, key, item) { return { ...client, [key]: [item, ...(client[key] || [])] }; }

function appReducer(state, action) {
  let newState;
  const { type, payload: p } = action;

  switch (type) {
    // ── Client CRUD ──
    case 'ADD_CLIENT':
      newState = { ...state, clients: [...state.clients, p] };
      break;
    case 'UPDATE_CLIENT':
      newState = updateClient(state, p.id, p);
      break;
    case 'DELETE_CLIENT':
      newState = { ...state, clients: state.clients.filter(c => c.id !== p) };
      break;

    // ── Milestones ──
    case 'ADD_MILESTONE':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'milestones', p.item), 'milestone_completed', `Milestone added: ${p.item.title}`);
      break;
    case 'UPDATE_MILESTONE':
      newState = updateClient(state, p.clientId, c => updateInArray(c, 'milestones', p.item.id, p.item));
      break;
    case 'DELETE_MILESTONE':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'milestones', p.itemId));
      break;

    // ── Tasks ──
    case 'ADD_TASK':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'tasks', p.item));
      break;
    case 'UPDATE_TASK': {
      const oldTask = state.clients.find(c => c.id === p.clientId)?.tasks?.find(t => t.id === p.item.id);
      const completed = oldTask?.status !== 'done' && p.item.status === 'done';
      newState = updateClient(state, p.clientId, c => updateInArray(c, 'tasks', p.item.id, p.item),
        completed ? 'task_completed' : null, completed ? `Task completed: ${oldTask?.title}` : null);
      break;
    }
    case 'DELETE_TASK':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'tasks', p.itemId));
      break;

    // ── Pages ──
    case 'ADD_PAGE':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'pages', p.item));
      break;
    case 'UPDATE_PAGE':
      newState = updateClient(state, p.clientId, c => updateInArray(c, 'pages', p.item.id, { ...p.item, lastUpdated: new Date().toISOString() }));
      break;
    case 'DELETE_PAGE':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'pages', p.itemId));
      break;

    // ── Deliverables ──
    case 'ADD_DELIVERABLE':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'deliverables', p.item));
      break;
    case 'UPDATE_DELIVERABLE': {
      const oldDel = state.clients.find(c => c.id === p.clientId)?.deliverables?.find(d => d.id === p.item.id);
      const approved = !oldDel?.approved && p.item.approved;
      newState = updateClient(state, p.clientId, c => updateInArray(c, 'deliverables', p.item.id, p.item),
        approved ? 'deliverable_approved' : null, approved ? `Deliverable approved: ${oldDel?.title}` : null);
      break;
    }
    case 'DELETE_DELIVERABLE':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'deliverables', p.itemId));
      break;

    // ── Payments ──
    case 'ADD_PAYMENT':
      newState = updateClient(state, p.clientId, c => ({
        ...c,
        financials: { ...c.financials, totalReceived: c.financials.totalReceived + p.item.amount },
        payments: [...c.payments, p.item],
      }), 'payment_received', `Payment received: $${p.item.amount.toLocaleString()}`);
      break;
    case 'DELETE_PAYMENT': {
      const client = state.clients.find(c => c.id === p.clientId);
      const payment = client?.payments.find(x => x.id === p.itemId);
      newState = updateClient(state, p.clientId, c => ({
        ...c,
        financials: { ...c.financials, totalReceived: c.financials.totalReceived - (payment?.amount || 0) },
        payments: c.payments.filter(x => x.id !== p.itemId),
      }));
      break;
    }

    // ── Feedback ──
    case 'ADD_FEEDBACK':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'feedback', p.item), 'feedback_received', `Feedback added: ${p.item.text.substring(0, 50)}`);
      break;
    case 'UPDATE_FEEDBACK':
      newState = updateClient(state, p.clientId, c => updateInArray(c, 'feedback', p.item.id, p.item));
      break;
    case 'DELETE_FEEDBACK':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'feedback', p.itemId));
      break;

    // ── Notes ──
    case 'ADD_NOTE':
      newState = updateClient(state, p.clientId, c => prependToArray(c, 'notes', p.item), 'note_added', `Note added by ${p.item.author}`, p.item.author);
      break;
    case 'DELETE_NOTE':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'notes', p.itemId));
      break;

    // ── Meeting Notes ──
    case 'ADD_MEETING_NOTE':
      newState = updateClient(state, p.clientId, c => prependToArray(c, 'meetingNotes', p.item), 'meeting_logged', `Meeting logged: ${p.item.title}`, p.item.author);
      break;
    case 'DELETE_MEETING_NOTE':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'meetingNotes', p.itemId));
      break;

    // ── Documents ──
    case 'ADD_DOCUMENT':
      newState = updateClient(state, p.clientId, c => addToArray(c, 'documents', p.item));
      break;
    case 'DELETE_DOCUMENT':
      newState = updateClient(state, p.clientId, c => removeFromArray(c, 'documents', p.itemId));
      break;

    // ── Scope ──
    case 'UPDATE_SCOPE':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, ...p.scope } }), p.log ? 'scope_changed' : null, p.log || null);
      break;
    case 'ADD_SCOPE_ITEM':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: [...c.scope.items, p.item] } }));
      break;
    case 'UPDATE_SCOPE_ITEM':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: c.scope.items.map(x => x.id === p.item.id ? { ...x, ...p.item } : x) } }));
      break;
    case 'DELETE_SCOPE_ITEM':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: c.scope.items.filter(x => x.id !== p.itemId) } }));
      break;
    case 'ADD_CHANGE_REQUEST':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, changeRequests: [...c.scope.changeRequests, p.item] } }), 'scope_changed', `Change request: ${p.item.description}`);
      break;
    case 'DELETE_CHANGE_REQUEST':
      newState = updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, changeRequests: c.scope.changeRequests.filter(x => x.id !== p.itemId) } }));
      break;

    // ── Launch Checklist ──
    case 'SET_LAUNCH_CHECKLIST':
      newState = updateClient(state, p.clientId, c => ({ ...c, launchChecklist: p.items }));
      break;
    case 'TOGGLE_LAUNCH_ITEM':
      newState = updateClient(state, p.clientId, c => ({
        ...c,
        launchChecklist: c.launchChecklist.map(x => x.id === p.itemId ? { ...x, checked: !x.checked } : x),
      }));
      break;

    // ── Activity Log ──
    case 'ADD_ACTIVITY':
      newState = updateClient(state, p.clientId, c => prependToArray(c, 'activityLog', p.item));
      break;

    // ── Proposal ──
    case 'UPDATE_PROPOSAL':
      newState = updateClient(state, p.clientId, c => ({ ...c, proposal: { ...c.proposal, ...p.proposal } }));
      break;

    // ── Financials ──
    case 'UPDATE_FINANCIALS':
      newState = updateClient(state, p.clientId, c => ({ ...c, financials: { ...c.financials, ...p.financials } }));
      break;

    // ── System ──
    case 'RESET_DATA':
      newState = { clients: [] };
      break;
    case 'IMPORT_DATA':
      newState = p;
      break;

    default: return state;
  }

  saveState(newState);
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useClients() {
  const { state, dispatch } = useApp();
  return { clients: state.clients, dispatch };
}

export function useClient(id) {
  const { state, dispatch } = useApp();
  return { client: state.clients.find(c => c.id === id), dispatch };
}
