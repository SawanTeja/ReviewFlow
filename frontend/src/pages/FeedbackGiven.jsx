import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function FeedbackGiven() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me.feedbackGiven().then(setAssignments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const grouped = {};
  assignments.forEach(a => {
    const key = `${a.month}/${a.year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  return (
    <div>
      <h1 className="page-title">Feedback to Give</h1>
      {Object.entries(grouped).map(([period, items]) => (
        <div className="card" key={period}>
          <h3 className="card-title" style={{ marginBottom: 12 }}>{period}</h3>
          <table>
            <thead><tr><th>Recipient</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id}>
                  <td>{a.recipient_name}</td>
                  <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td>
                    <Link
                      to={`/feedback/give/${a.id}`}
                      className={`btn btn-sm ${a.status !== 'SUBMITTED' ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {a.status === 'SUBMITTED' ? 'View' : (a.status === 'DRAFT' ? 'Continue' : 'Start')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {assignments.length === 0 && <div className="empty">No feedback assignments found.</div>}
    </div>
  );
}
