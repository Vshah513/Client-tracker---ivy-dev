import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import { searchAll } from '../utils/helpers';
import { Search, Users, CheckSquare, Layout, Plus, ArrowRight } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { clients } = useClients();
  const inputRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) { setQuery(''); setActiveIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose(); }
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchAll(clients, query);
  const quickActions = [
    { label: 'Add New Client', icon: Plus, action: () => { navigate('/clients/new'); onClose(); } },
    { label: 'Go to Dashboard', icon: Layout, action: () => { navigate('/'); onClose(); } },
    { label: 'Pipeline View', icon: ArrowRight, action: () => { navigate('/pipeline'); onClose(); } },
    { label: 'Team Overview', icon: Users, action: () => { navigate('/team'); onClose(); } },
  ];

  const allItems = [
    ...(query.length < 2 ? quickActions.map(a => ({ type: 'action', ...a })) : []),
    ...results.clients.map(c => ({ type: 'client', label: c.name, desc: c.idea, action: () => { navigate(`/clients/${c.id}`); onClose(); } })),
    ...results.tasks.map(t => ({ type: 'task', label: t.title, desc: t.clientName, action: () => { navigate(`/clients/${t.clientId}`); onClose(); } })),
    ...results.pages.map(p => ({ type: 'page', label: p.name, desc: p.clientName, action: () => { navigate(`/clients/${p.clientId}`); onClose(); } })),
  ];

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => Math.min(prev + 1, allItems.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => Math.max(prev - 1, 0)); }
    if (e.key === 'Enter' && allItems[activeIndex]) { allItems[activeIndex].action(); }
    if (e.key === 'Escape') onClose();
  }

  const iconMap = { client: Users, task: CheckSquare, page: Layout, action: null };

  return (
    <div className="command-palette-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="command-palette">
        <input ref={inputRef} className="command-palette-input" value={query}
          onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
          onKeyDown={handleKeyDown}
          placeholder="Search clients, tasks, pages… or type a command" />
        <div className="command-palette-results">
          {allItems.length === 0 && query.length >= 2 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No results found</div>
          )}
          {allItems.map((item, i) => {
            const Icon = item.icon || iconMap[item.type] || Search;
            return (
              <div key={i} className={`command-palette-item ${i === activeIndex ? 'active' : ''}`}
                onClick={item.action} onMouseEnter={() => setActiveIndex(i)}>
                <div className="command-palette-item-icon"><Icon size={14} /></div>
                <div>
                  <div className="command-palette-item-title">{item.label}</div>
                  {item.desc && <div className="command-palette-item-desc">{item.desc}</div>}
                </div>
                {item.type !== 'action' && <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.type}</span>}
              </div>
            );
          })}
        </div>
        <div className="command-palette-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
