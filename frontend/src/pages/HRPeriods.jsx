import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function HRPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.hr.reviewPeriods().then(setPeriods).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Review Periods</h1>
      <div className="card">
        <table>
          <thead><tr><th>Period</th><th>Status</th><th>Start</th><th>End</th><th>Action</th></tr></thead>
          <tbody>
            {periods.map(p => (
              <tr key={p.id}>
                <td><strong>{p.month}/{p.year}</strong></td>
                <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.start_date || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.end_date || '—'}</td>
                <td><Link to={`/hr/periods/${p.id}`} className="btn btn-sm btn-outline">View Status</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
