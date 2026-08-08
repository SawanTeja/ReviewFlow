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

  const groupedFeedback = received.reduce((acc, r) => {
    const period = `${r.month}/${r.year}`;
    if (!acc[period]) acc[period] = [];
    acc[period].push(r);
    return acc;
  }, {});

  // Sort periods in descending order (e.g., 8/2026 before 7/2026)
  const sortedPeriods = Object.keys(groupedFeedback).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    if (yearA !== yearB) return yearB - yearA;
    return monthB - monthA;
  });

  return (
    <div>
      <h1 className="page-title">Feedback Received</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        View all the performance evaluations you have received, organized by review period.
      </p>

      {sortedPeriods.length === 0 ? (
        <div className="empty">No feedback received yet.</div>
      ) : (
        sortedPeriods.map(period => (
          <div key={period} className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--primary)' }}>Review Period: {period}</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Submitted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedFeedback[period].map(r => (
                  <tr key={r.assignment_id}>
                    <td><strong>{r.reviewer_name}</strong></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/feedback/received/${r.assignment_id}`} className="btn btn-sm btn-outline">
                        Read Full Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
