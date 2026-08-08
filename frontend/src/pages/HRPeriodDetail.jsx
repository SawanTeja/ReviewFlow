import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function HRPeriodDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState([]);
  const [allAssignments, setAll] = useState([]);
  const [managerCompletion, setManagerCompletion] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.hr.periodStatus(id),
      api.hr.pendingAssignments(id),
      api.hr.allAssignments(id),
      api.hr.managerCompletion(id),
    ]).then(([s, p, a, m]) => {
      setStatus(s);
      setPending(p);
      setAll(a);
      setManagerCompletion(m);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!status) return <div className="alert alert-error">Period not found</div>;

  return (
    <div>
      <Link to="/hr/periods" className="back-link">← Back to periods</Link>
      <h1 className="page-title">{status.period.month}/{status.period.year} — Review Status</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value primary">{status.total}</div>
          <div className="stat-label">Total Expected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value success">{status.submitted}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value warning">{status.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: status.completionPercentage === 100 ? 'var(--success)' : 'var(--primary)' }}>
            {status.completionPercentage}%
          </div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn btn-sm ${tab === 'overview' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('overview')}>All Assignments</button>
        <button className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('pending')}>
          Pending ({pending.length})
        </button>
        <button className={`btn btn-sm ${tab === 'managers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('managers')}>
          Manager Completion
        </button>
      </div>

      <div className="card">
        {tab === 'managers' ? (
          <table>
            <thead><tr><th>Manager</th><th>Direct Reports</th><th>Submitted Feedback</th><th>Completion</th></tr></thead>
            <tbody>
              {managerCompletion.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No managers found.</td></tr>
              ) : managerCompletion.map(m => (
                <tr key={m.managerId}>
                  <td><strong>{m.managerName}</strong></td>
                  <td>{m.totalReports}</td>
                  <td>{m.submittedCount}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#eee', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(m.submittedCount / m.totalReports) * 100}%`, background: 'var(--success)', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: 12 }}>{Math.round((m.submittedCount / m.totalReports) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === 'overview' ? (
          <table>
            <thead><tr><th>Reviewer</th><th>Recipient</th><th>Status</th></tr></thead>
            <tbody>
              {allAssignments.map(a => (
                <tr key={a.id}>
                  <td>{a.reviewer_name}</td>
                  <td>{a.recipient_name}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Reviewer</th><th>Recipient</th><th>Status</th></tr></thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>All feedback submitted!</td></tr>
              ) : pending.map(a => (
                <tr key={a.id}>
                  <td>{a.reviewer_name}</td>
                  <td>{a.recipient_name}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
