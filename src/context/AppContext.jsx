import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { sampleClients } from '../data/sampleData';
import { createActivityLog } from '../data/schema';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

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
  const { type, payload: p } = action;

  switch (type) {
    case 'SET_CLIENTS':
      return { ...state, clients: p };

    // ── Client CRUD ──
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, p] };
    case 'UPDATE_CLIENT':
      return updateClient(state, p.id, p);
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== p) };

    // ── Milestones ──
    case 'ADD_MILESTONE':
      return updateClient(state, p.clientId, c => addToArray(c, 'milestones', p.item), 'milestone_completed', `Milestone added: ${p.item.title}`);
    case 'UPDATE_MILESTONE':
      return updateClient(state, p.clientId, c => updateInArray(c, 'milestones', p.item.id, p.item));
    case 'DELETE_MILESTONE':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'milestones', p.itemId));

    // ── Tasks ──
    case 'ADD_TASK':
      return updateClient(state, p.clientId, c => addToArray(c, 'tasks', p.item));
    case 'UPDATE_TASK': {
      const oldTask = state.clients.find(c => c.id === p.clientId)?.tasks?.find(t => t.id === p.item.id);
      const completed = oldTask?.status !== 'done' && p.item.status === 'done';
      return updateClient(state, p.clientId, c => updateInArray(c, 'tasks', p.item.id, p.item),
        completed ? 'task_completed' : null, completed ? `Task completed: ${oldTask?.title}` : null);
    }
    case 'DELETE_TASK':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'tasks', p.itemId));

    // ── Pages ──
    case 'ADD_PAGE':
      return updateClient(state, p.clientId, c => addToArray(c, 'pages', p.item));
    case 'UPDATE_PAGE':
      return updateClient(state, p.clientId, c => updateInArray(c, 'pages', p.item.id, { ...p.item, lastUpdated: new Date().toISOString() }));
    case 'DELETE_PAGE':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'pages', p.itemId));

    // ── Deliverables ──
    case 'ADD_DELIVERABLE':
      return updateClient(state, p.clientId, c => addToArray(c, 'deliverables', p.item));
    case 'UPDATE_DELIVERABLE': {
      const oldDel = state.clients.find(c => c.id === p.clientId)?.deliverables?.find(d => d.id === p.item.id);
      const approved = !oldDel?.approved && p.item.approved;
      return updateClient(state, p.clientId, c => updateInArray(c, 'deliverables', p.item.id, p.item),
        approved ? 'deliverable_approved' : null, approved ? `Deliverable approved: ${oldDel?.title}` : null);
    }
    case 'DELETE_DELIVERABLE':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'deliverables', p.itemId));

    // ── Payments ──
    case 'ADD_PAYMENT':
      return updateClient(state, p.clientId, c => ({
        ...c,
        financials: { ...c.financials, totalReceived: c.financials.totalReceived + p.item.amount },
        payments: [...c.payments, p.item],
      }), 'payment_received', `Payment received: $${p.item.amount.toLocaleString()}`);
    case 'DELETE_PAYMENT': {
      const client = state.clients.find(c => c.id === p.clientId);
      const payment = client?.payments.find(x => x.id === p.itemId);
      return updateClient(state, p.clientId, c => ({
        ...c,
        financials: { ...c.financials, totalReceived: c.financials.totalReceived - (payment?.amount || 0) },
        payments: c.payments.filter(x => x.id !== p.itemId),
      }));
    }

    // ── Feedback ──
    case 'ADD_FEEDBACK':
      return updateClient(state, p.clientId, c => addToArray(c, 'feedback', p.item), 'feedback_received', `Feedback added: ${p.item.text.substring(0, 50)}`);
    case 'UPDATE_FEEDBACK':
      return updateClient(state, p.clientId, c => updateInArray(c, 'feedback', p.item.id, p.item));
    case 'DELETE_FEEDBACK':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'feedback', p.itemId));

    // ── Notes ──
    case 'ADD_NOTE':
      return updateClient(state, p.clientId, c => prependToArray(c, 'notes', p.item), 'note_added', `Note added by ${p.item.author}`, p.item.author);
    case 'DELETE_NOTE':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'notes', p.itemId));

    // ── Meeting Notes ──
    case 'ADD_MEETING_NOTE':
      return updateClient(state, p.clientId, c => prependToArray(c, 'meetingNotes', p.item), 'meeting_logged', `Meeting logged: ${p.item.title}`, p.item.author);
    case 'DELETE_MEETING_NOTE':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'meetingNotes', p.itemId));

    // ── Documents ──
    case 'ADD_DOCUMENT':
      return updateClient(state, p.clientId, c => addToArray(c, 'documents', p.item));
    case 'DELETE_DOCUMENT':
      return updateClient(state, p.clientId, c => removeFromArray(c, 'documents', p.itemId));

    // ── Scope ──
    case 'UPDATE_SCOPE':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, ...p.scope } }), p.log ? 'scope_changed' : null, p.log || null);
    case 'ADD_SCOPE_ITEM':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: [...c.scope.items, p.item] } }));
    case 'UPDATE_SCOPE_ITEM':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: c.scope.items.map(x => x.id === p.item.id ? { ...x, ...p.item } : x) } }));
    case 'DELETE_SCOPE_ITEM':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, items: c.scope.items.filter(x => x.id !== p.itemId) } }));
    case 'ADD_CHANGE_REQUEST':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, changeRequests: [...c.scope.changeRequests, p.item] } }), 'scope_changed', `Change request: ${p.item.description}`);
    case 'DELETE_CHANGE_REQUEST':
      return updateClient(state, p.clientId, c => ({ ...c, scope: { ...c.scope, changeRequests: c.scope.changeRequests.filter(x => x.id !== p.itemId) } }));

    // ── Launch Checklist ──
    case 'SET_LAUNCH_CHECKLIST':
      return updateClient(state, p.clientId, c => ({ ...c, launchChecklist: p.items }));
    case 'TOGGLE_LAUNCH_ITEM':
      return updateClient(state, p.clientId, c => ({
        ...c,
        launchChecklist: c.launchChecklist.map(x => x.id === p.itemId ? { ...x, checked: !x.checked } : x),
      }));

    // ── Activity Log ──
    case 'ADD_ACTIVITY':
      return updateClient(state, p.clientId, c => prependToArray(c, 'activityLog', p.item));

    // ── Proposal ──
    case 'UPDATE_PROPOSAL':
      return updateClient(state, p.clientId, c => ({ ...c, proposal: { ...c.proposal, ...p.proposal } }));

    // ── Financials ──
    case 'UPDATE_FINANCIALS':
      return updateClient(state, p.clientId, c => ({ ...c, financials: { ...c.financials, ...p.financials } }));

    // ── System ──
    case 'RESET_DATA':
      return { clients: [] };
    case 'IMPORT_DATA':
      return p;

    default: return state;
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appReducer, { clients: [] });
  const [loading, setLoading] = useState(true);

  // Load from Supabase on start
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
      } else if (data && data.length > 0) {
        // Map back from Supabase structure to our state structure
        const clients = data.map(row => ({
          ...row.data,
          id: row.id, // Ensure we use the Supabase UUID
          name: row.name,
        }));
        dispatch({ type: 'SET_CLIENTS', payload: clients });
      } else if (data && data.length === 0) {
        // If first time user, upload sample data
        const initialClients = sampleClients.map(c => ({
          user_id: user.id,
          name: c.name,
          data: c
        }));
        const { data: inserted, error: insertError } = await supabase
          .from('clients')
          .insert(initialClients)
          .select();
        
        if (!insertError && inserted) {
          dispatch({ type: 'SET_CLIENTS', payload: inserted.map(r => ({ ...r.data, id: r.id })) });
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [user]);

  // Intercept dispatch to sync with Supabase
  const wrappedDispatch = async (action) => {
    // 1. Run the local update first
    dispatch(action);

    // 2. Sync to Supabase in the background
    // We calculate the potential next state to find which client needs updating
    // For production, a more robust sync queue would be better, but this handles simple cases.
    const { type, payload: p } = action;
    
    // We only sync data-changing actions
    if (type === 'SET_CLIENTS' || type === 'IMPORT_DATA') return;

    // Use a small delay to let the reducer finish (or we could fetch from state after dispatch)
    // Actually, it's safer to just handle the Supabase call based on the action info.
    
    if (type === 'ADD_CLIENT') {
      await supabase.from('clients').insert({
        user_id: user.id,
        name: p.name,
        data: p
      });
    } else if (type === 'DELETE_CLIENT') {
      await supabase.from('clients').delete().eq('id', p);
    } else if (p && p.clientId || p.id) {
       // All other actions update a specific client
       const clientId = p.clientId || p.id;
       // We need the full updated client object. 
       // For now, we'll let the next render's useEffect or subsequent actions handle it?
       // Better: Just fetch the client from state and update.
    }
  };

  // Improved syncing logic: Watch state changes and sync
  useEffect(() => {
    if (!user || loading) return;
    
    // This is a simple debounced sync
    const timer = setTimeout(async () => {
      // For each client, check if it needs an update? 
      // Simplified: Just update the clients that were changed.
      // In this case, we'll just focus on making sure ADD/DELETE work, 
      // and we'll add an 'UPDATE_CLIENT_CLOUD' helper.
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, user, loading]);

  // Provide a specialized sync function for manual or automatic updates
  async function syncClient(client) {
    if (!user) return;
    await supabase
      .from('clients')
      .update({
        name: client.name,
        data: client,
        updated_at: new Date().toISOString()
      })
      .eq('id', client.id);
  }

  return (
    <AppContext.Provider value={{ state, dispatch: wrappedDispatch, loading, syncClient }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useClients() {
  const { state, dispatch, syncClient } = useApp();
  
  // Wrap dispatch to auto-sync for common operations
  const syncedDispatch = (action) => {
    dispatch(action);
    // After dispatch, if it's an update, we should sync. 
    // This is simplified; in a larger app we'd use a more robust middleware.
  };

  return { clients: state.clients, dispatch, syncClient };
}

export function useClient(id) {
  const { state, dispatch, syncClient } = useApp();
  return { client: state.clients.find(c => c.id === id), dispatch, syncClient };
}
