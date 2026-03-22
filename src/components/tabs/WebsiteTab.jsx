import { Globe, ExternalLink } from 'lucide-react';

export default function WebsiteTab({ client, dispatch }) {
  function updateField(field, value) {
    dispatch({ type: 'UPDATE_CLIENT', payload: { id: client.id, [field]: value } });
  }

  return (
    <div>
      <h3 className="section-title" style={{ marginBottom: 20 }}>Website Links</h3>
      <div className="glass-card-static" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="input-group">
            <label className="input-label">Live Website URL</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" value={client.websiteUrl || ''} onChange={e => updateField('websiteUrl', e.target.value)} placeholder="https://www.example.com" style={{ flex: 1 }} />
              {client.websiteUrl && <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><ExternalLink size={14} /> Visit</a>}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Staging / Preview URL</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" value={client.stagingUrl || ''} onChange={e => updateField('stagingUrl', e.target.value)} placeholder="https://staging.example.com" style={{ flex: 1 }} />
              {client.stagingUrl && <a href={client.stagingUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={14} /> Preview</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
