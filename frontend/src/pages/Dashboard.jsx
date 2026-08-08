import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [given, setGiven] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    api.me.profile().then(setProfile).catch(() => {});
    api.me.feedbackGiven().then(setGiven).catch(() => {});
    api.me.feedbackReceived().then(setReceived).catch(() => {});
  }, []);

  const pending = given.filter(a => a.status === 'PENDING');
  const drafts = given.filter(a => a.status === 'DRAFT');
  const submitted = given.filter(a => a.status === 'SUBMITTED');

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.name}</h1>

      {profile && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Company</span><br /><strong>{profile.company_name}</strong></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Role</span><br /><span className={`badge badge-${profile.role.toLowerCase()}`}>{profile.role}</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Email</span><br />{profile.email}</div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value warning">{pending.length}</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value primary">{drafts.length}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value success">{submitted.length}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value primary">{received.length}</div>
          <div className="stat-label">Feedback Received</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Reviews</h3>
            <Link to="/feedback/given" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <table>
            <thead><tr><th>Recipient</th><th>Period</th><th>Action</th></tr></thead>
            <tbody>
              {pending.slice(0, 5).map(a => (
                <tr key={a.id}>
                  <td>{a.recipient_name}</td>
                  <td>{a.month}/{a.year}</td>
                  <td><Link to={`/feedback/give/${a.id}`} className="btn btn-sm btn-primary">Give Feedback</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
