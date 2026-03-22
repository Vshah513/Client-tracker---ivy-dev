import { useState } from 'react';
import { createPayment, PAYMENT_METHODS } from '../../data/schema';
import { formatCurrency, formatDate, getProfit, getMargin } from '../../utils/helpers';
import { Plus, Trash2, TrendingUp, DollarSign, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function FinancialsTab({ client, dispatch, pending }) {
  const [adding, setAdding] = useState(false);
  const [newPay, setNewPay] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'bank_transfer', notes: '' });
  const fin = client.financials || {};
  const profit = getProfit(client);
  const margin = getMargin(client);
  const pctCollected = fin.totalAgreed ? Math.round((fin.totalReceived / fin.totalAgreed) * 100) : 0;

  function addPayment() {
    if (!newPay.amount) return;
    dispatch({ type: 'ADD_PAYMENT', payload: { clientId: client.id, item: createPayment({ ...newPay, amount: Number(newPay.amount) }) } });
    setNewPay({ amount: '', date: new Date().toISOString().split('T')[0], method: 'bank_transfer', notes: '' }); setAdding(false);
  }

  function updateFin(updates) { dispatch({ type: 'UPDATE_FINANCIALS', payload: { clientId: client.id, financials: updates } }); }

  return (
    <div>
      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">Agreed</span><div className="stat-card-icon" style={{ background: 'rgba(6,214,160,0.1)', color: 'var(--accent)' }}><DollarSign size={16} /></div></div><div className="stat-card-value">{formatCurrency(fin.totalAgreed)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">Received</span><div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}><TrendingUp size={16} /></div></div><div className="stat-card-value" style={{ color: 'var(--accent)' }}>{formatCurrency(fin.totalReceived)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">Outstanding</span><div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}><Clock size={16} /></div></div><div className="stat-card-value" style={{ color: pending > 0 ? 'var(--warning)' : 'var(--accent)' }}>{formatCurrency(pending)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">Est. Profit</span><div className="stat-card-icon" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--accent-secondary)' }}><TrendingUp size={16} /></div></div><div className="stat-card-value" style={{ color: profit >= 0 ? 'var(--accent)' : 'var(--danger)' }}>{formatCurrency(profit)}</div><div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{margin}% margin</div></div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card-static" style={{ padding: 16, marginBottom: 20 }}>
        <div className="flex-between" style={{ marginBottom: 8, fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Collection Progress</span>
          <span style={{ fontWeight: 700 }}>{pctCollected}%</span>
        </div>
        <div className="financial-bar" style={{ height: 10 }}>
          <div className="financial-bar-segment financial-bar-received" style={{ width: `${pctCollected}%` }} />
        </div>
        <div className="financial-legend">
          <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'var(--accent)' }} />Received</div>
          <div className="financial-legend-item"><div className="financial-legend-dot" style={{ background: 'rgba(255,255,255,0.06)' }} />Remaining</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Details */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>Details</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Deposit', value: fin.depositPaid ? `✓ ${formatCurrency(fin.depositAmount)}` : `${formatCurrency(fin.depositAmount)} (pending)`, editable: false },
              { label: 'Internal Cost Est.', field: 'internalCostEstimate', type: 'number' },
              { label: 'Labor Hours Est.', field: 'laborHoursEstimate', type: 'number' },
            ].map(({ label, value, field, type }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                {field ? (
                  <input className="input-field" type={type} style={{ width: 100, padding: '3px 8px', fontSize: '0.75rem', textAlign: 'right' }}
                    value={fin[field] || ''} onChange={e => updateFin({ [field]: Number(e.target.value) })} />
                ) : <span style={{ fontWeight: 600 }}>{value}</span>}
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Payment Schedule</span>
              <input className="input-field" value={fin.paymentSchedule || ''} placeholder="e.g. 30% deposit, 40% at design, 30% at launch"
                onChange={e => updateFin({ paymentSchedule: e.target.value })} style={{ fontSize: '0.75rem' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4 }}>Payment Method</span>
              <select className="input-field" style={{ fontSize: '0.75rem' }} value={fin.paymentMethod || ''} onChange={e => updateFin({ paymentMethod: e.target.value })}>
                <option value="">Select...</option>{PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="glass-card-static" style={{ padding: 20 }}>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Payment History</h4>
            <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={12} /> Log Payment</button>
          </div>
          {(client.payments || []).map(p => (
            <div key={p.id} className="payment-row">
              <div className="payment-amount" style={{ color: 'var(--accent)' }}>+{formatCurrency(p.amount)}</div>
              <div className="payment-details">
                <div className="payment-date">{formatDate(p.date)}</div>
                {p.notes && <div className="payment-note">{p.notes}</div>}
              </div>
              <span className="payment-method">{PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method}</span>
              <button className="btn-ghost btn-icon" onClick={() => dispatch({ type: 'DELETE_PAYMENT', payload: { clientId: client.id, itemId: p.id } })}><Trash2 size={12} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
          ))}
          {(client.payments || []).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No payments recorded</div>}

          {adding && (
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginTop: 8 }}>
              <div className="form-row" style={{ marginBottom: 8 }}>
                <input className="input-field" type="number" placeholder="Amount" value={newPay.amount} onChange={e => setNewPay({...newPay, amount: e.target.value})} autoFocus />
                <input className="input-field" type="date" value={newPay.date} onChange={e => setNewPay({...newPay, date: e.target.value})} />
              </div>
              <div className="form-row" style={{ marginBottom: 8 }}>
                <select className="input-field" value={newPay.method} onChange={e => setNewPay({...newPay, method: e.target.value})}>{PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                <input className="input-field" placeholder="Notes" value={newPay.notes} onChange={e => setNewPay({...newPay, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addPayment}>Log Payment</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
