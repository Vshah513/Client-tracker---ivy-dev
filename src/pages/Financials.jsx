import { useClients } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getBusinessFinancials, formatCurrency, getFinancialsPending, getProfit, getMargin, getClientProgress } from '../utils/helpers';
import { StatCard, StatusBadge, HealthBadge, ProgressRing } from '../components/UIComponents';
import { DollarSign, TrendingUp, AlertTriangle, ArrowRight, Clock, Users, PieChart } from 'lucide-react';

export default function Financials() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const biz = getBusinessFinancials(clients);
  const clientsWithRev = clients.filter(c => c.financials?.totalAgreed > 0);

  return (
    <div className="page">
      <div className="page-header animate-slide-up">
        <h1 className="page-title">Financials</h1>
        <p className="page-subtitle">Revenue, profit, and payment tracking across all clients</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid animate-slide-up stagger-1" style={{ marginBottom: 24 }}>
        <StatCard icon={DollarSign} label="Total Agreed" value={formatCurrency(biz.totalAgreed)} color="var(--accent)" />
        <StatCard icon={TrendingUp} label="Total Received" value={formatCurrency(biz.totalReceived)} color="var(--success)" delay={1} />
        <StatCard icon={Clock} label="Outstanding" value={formatCurrency(biz.totalOutstanding)} color={biz.totalOutstanding > 0 ? 'var(--warning)' : 'var(--accent)'} delay={2} />
        <StatCard icon={PieChart} label="Net Profit" value={formatCurrency(biz.totalProfit)} color={biz.totalProfit >= 0 ? 'var(--accent)' : 'var(--danger)'} delay={3} />
      </div>

      {/* Revenue Chart */}
      <div className="glass-card-static animate-slide-up stagger-2" style={{ padding: 20, marginBottom: 20 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 14 }}>Revenue by Client</h4>
        {clientsWithRev.length > 0 ? (
          <div className="chart-container" style={{ height: 160 }}>
            {clientsWithRev.map(c => {
              const maxVal = Math.max(...clientsWithRev.map(cl => cl.financials?.totalAgreed || 0));
              return (
                <div key={c.id} className="chart-bar-wrapper" style={{ cursor: 'pointer' }} onClick={() => navigate(`/clients/${c.id}`)}>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ height: `${(c.financials.totalReceived / maxVal) * 100}%`, flex: 1 }} title={`Received: ${formatCurrency(c.financials.totalReceived)}`} />
                    <div className="chart-bar chart-bar-secondary" style={{ height: `${(c.financials.totalAgreed / maxVal) * 100}%`, flex: 1, opacity: 0.3 }} title={`Agreed: ${formatCurrency(c.financials.totalAgreed)}`} />
                  </div>
                  <span className="chart-label">{c.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No financial data yet</div>
        )}
        <div className="financial-legend" style={{ justifyContent: 'center', marginTop: 12 }}>
          <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'var(--accent)' }} />Received</div>
          <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'var(--accent-secondary)' }} />Agreed</div>
        </div>
      </div>

      {/* Client Financial Table */}
      <div className="glass-card-static animate-slide-up stagger-3" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr>
            <th>Client</th><th>Status</th><th>Agreed</th><th>Received</th><th>Outstanding</th><th>Profit</th><th>Margin</th><th>Progress</th>
          </tr></thead>
          <tbody>
            {clientsWithRev.sort((a, b) => (b.financials?.totalAgreed || 0) - (a.financials?.totalAgreed || 0)).map(c => {
              const pending = getFinancialsPending(c);
              const profit = getProfit(c);
              const margin = getMargin(c);
              const progress = getClientProgress(c);
              return (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
                  <td><div style={{ fontWeight: 600 }}>{c.name}</div></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.financials?.totalAgreed)}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(c.financials?.totalReceived)}</td>
                  <td style={{ color: pending > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{formatCurrency(pending)}</td>
                  <td style={{ color: profit >= 0 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{formatCurrency(profit)}</td>
                  <td>{margin}%</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className="progress-bar" style={{ flex: 1, minWidth: 50 }}><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{progress}%</span></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clientsWithRev.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No financial data</div>}
      </div>

      {/* Business Metrics */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="glass-card-static animate-slide-up stagger-4" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Collection Summary</h4>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ProgressRing percentage={biz.totalAgreed ? Math.round((biz.totalReceived / biz.totalAgreed) * 100) : 0} size={100} strokeWidth={6} />
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatCurrency(biz.totalReceived)} collected of {formatCurrency(biz.totalAgreed)} total
          </p>
        </div>
        <div className="glass-card-static animate-slide-up stagger-5" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Key Metrics</h4>
          {[
            { label: 'Active Pipeline Value', value: formatCurrency(biz.pipeline) },
            { label: 'Avg Project Value', value: formatCurrency(biz.avgProjectValue) },
            { label: 'Total Costs', value: formatCurrency(biz.totalCosts) },
            { label: 'Profit Margin', value: biz.totalReceived ? `${Math.round(((biz.totalReceived - biz.totalCosts) / biz.totalReceived) * 100)}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
