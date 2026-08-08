import { useState, useEffect } from 'react';
import api from '../api';

export default function HRFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([api.hr.reviewPeriods(), api.hr.employees()])
      .then(([p, e]) => { setPeriods(p); setEmployees(e); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.hr.feedback(filters).then(setFeedback).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <h1 className="page-title">Submitted Feedback</h1>

      <div className="filter-bar">
        <select value={filters.reviewPeriodId || ''} onChange={e => setFilters(f => ({ ...f, reviewPeriodId: e.target.value || undefined }))}>
          <option value="">All Periods</option>
          {periods.map(p => <option key={p.id} value={p.id}>{p.month}/{p.year}</option>)}
        </select>
        <select value={filters.reviewerId || ''} onChange={e => setFilters(f => ({ ...f, reviewerId: e.target.value || undefined }))}>
          <option value="">All Reviewers</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filters.recipientId || ''} onChange={e => setFilters(f => ({ ...f, recipientId: e.target.value || undefined }))}>
          <option value="">All Recipients</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        feedback.length === 0 ? <div className="empty">No submitted feedback found.</div> : (
          feedback.map(fb => (
            <div className="card" key={fb.assignmentId} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === fb.assignmentId ? null : fb.assignmentId)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{fb.reviewerName}</strong> → <strong>{fb.recipientName}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 12 }}>{fb.month}/{fb.year}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{expanded === fb.assignmentId ? '▲' : '▼'}</span>
              </div>
              {expanded === fb.assignmentId && (
                <table style={{ marginTop: 12 }}>
                  <thead><tr><th>Parameter</th><th>Score</th><th>Comment</th></tr></thead>
                  <tbody>
                    {fb.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.parameterName}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.score}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}
