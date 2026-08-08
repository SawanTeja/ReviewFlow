import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function FeedbackReceived() {
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me.feedbackReceived().then(setReceived).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Feedback Received</h1>
      {received.length === 0 ? (
        <div className="empty">No feedback received yet.</div>
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>From</th><th>Period</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>
              {received.map(r => (
                <tr key={r.assignment_id}>
                  <td>{r.reviewer_name}</td>
                  <td>{r.month}/{r.year}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                  <td><Link to={`/feedback/received/${r.assignment_id}`} className="btn btn-sm btn-outline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
