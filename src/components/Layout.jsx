import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useClients } from '../context/AppContext';
import CommandPalette from './CommandPalette';
import { getOverdueTasks } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GitBranch, DollarSign, UserCheck,
  Settings, Plus, ChevronLeft, ChevronRight, Search, Command,
  Sparkles, AlertTriangle, LogOut
} from 'lucide-react';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdPalette, setCmdPalette] = useState(false);
  const navigate = useNavigate();
  const { clients } = useClients();
  const { signOut, getDisplayName } = useAuth();

  const overdueTasks = getOverdueTasks(clients);
  const atRiskCount = clients.filter(c => c.health === 'at_risk' || c.health === 'delayed').length;

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
    { to: '/financials', icon: DollarSign, label: 'Financials' },
    { to: '/team', icon: UserCheck, label: 'Team', badge: overdueTasks.length > 0 ? overdueTasks.length : null },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Sparkles size={18} color="white" /></div>
          <div className="sidebar-brand-text">
            <h2>IVY DEVS</h2>
            <span>Operating System</span>
          </div>
        </div>

        {/* Search shortcut */}
        {!collapsed && (
          <div style={{ padding: '10px 8px 4px' }}>
            <button onClick={() => setCmdPalette(true)}
              style={{
                width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-muted)',
                fontSize: '0.75rem', fontFamily: 'inherit', transition: 'all var(--transition-fast)',
              }}>
              <Search size={13} />
              <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
              <kbd style={{ fontSize: '0.5625rem', padding: '2px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>⌘K</kbd>
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={17} />
              <span className="sidebar-nav-label">{item.label}</span>
              {item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
            </NavLink>
          ))}

          {!collapsed && atRiskCount > 0 && (
            <div style={{ margin: '12px 8px', padding: '10px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.6875rem', color: 'var(--danger)' }}>
              <AlertTriangle size={14} />
              <span><strong>{atRiskCount}</strong> project{atRiskCount > 1 ? 's' : ''} at risk</span>
            </div>
          )}
        </nav>

        <button className="sidebar-add-btn" onClick={() => navigate('/clients/new')}>
          <Plus size={16} />
          <span>New Client</span>
        </button>

        <div className="sidebar-footer">
          <div className="team-avatars" onClick={signOut} style={{ cursor: 'pointer' }} title="Click to Logout">
            {getDisplayName() === 'Viraj' ? (
              <div className="avatar avatar-viraj avatar-sm">VS</div>
            ) : getDisplayName() === 'Ishan' ? (
              <div className="avatar avatar-ishan avatar-sm">IS</div>
            ) : (
              <div className="avatar avatar-sm" style={{ background: 'var(--bg-tertiary)' }}>{getDisplayName().substring(0, 2).toUpperCase()}</div>
            )}
          </div>
          {!collapsed && (
            <div className="team-info" style={{ flex: 1 }}>
              <strong>{getDisplayName()}</strong>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                Online
              </span>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={signOut}
              className="btn-ghost btn-icon" 
              title="Logout"
              style={{ padding: 4, color: 'var(--text-muted)' }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <CommandPalette isOpen={cmdPalette} onClose={() => setCmdPalette(false)} />
    </div>
  );
}
