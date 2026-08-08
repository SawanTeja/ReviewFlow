import { useState, useEffect, useMemo } from 'react';
import api from '../api';

export default function HRFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [expandedPeriods, setExpandedPeriods] = useState({});

  useEffect(() => {
    Promise.all([api.hr.reviewPeriods(), api.hr.employees()])
      .then(([p, e]) => { setPeriods(p); setEmployees(e); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.hr.feedback(filters).then(setFeedback).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const groupedFeedback = useMemo(() => {
    const groups = {};
    feedback.forEach(fb => {
      if (!groups[fb.recipientName]) {
        groups[fb.recipientName] = {};
      }
      const periodKey = `${fb.month}/${fb.year}`;
      if (!groups[fb.recipientName][periodKey]) {
        groups[fb.recipientName][periodKey] = [];
      }
      groups[fb.recipientName][periodKey].push(fb);
    });
    return groups;
  }, [feedback]);

  const toggleUser = (user) => {
    setExpandedUsers(prev => ({ ...prev, [user]: !prev[user] }));
  };

  const togglePeriod = (user, period) => {
    const key = `${user}-${period}`;
    setExpandedPeriods(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
        Object.keys(groupedFeedback).length === 0 ? <div className="empty">No submitted feedback found.</div> : (
          Object.keys(groupedFeedback).sort().map(recipient => (
            <div className="card" key={recipient} style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
              <div 
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', borderBottom: expandedUsers[recipient] ? '1px solid var(--border-color)' : 'none' }} 
                onClick={() => toggleUser(recipient)}
              >
                <strong style={{ fontSize: 16 }}>{recipient}</strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{expandedUsers[recipient] ? '▲' : '▼'}</span>
              </div>
              
              {expandedUsers[recipient] && (
                <div style={{ padding: '0 20px 16px 20px', background: '#f8f9fa' }}>
                  {Object.keys(groupedFeedback[recipient]).sort((a, b) => b.localeCompare(a)).map(period => (
                    <div key={period} style={{ marginTop: 12, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                      <div 
                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: expandedPeriods[`${recipient}-${period}`] ? '1px solid var(--border-color)' : 'none' }}
                        onClick={() => togglePeriod(recipient, period)}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Review Period: {period}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{expandedPeriods[`${recipient}-${period}`] ? '▲' : '▼'}</span>
                      </div>
                      
                      {expandedPeriods[`${recipient}-${period}`] && (
                        <div style={{ padding: '12px 16px' }}>
                          {groupedFeedback[recipient][period].map(fb => (
                            <div key={fb.assignmentId} style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Reviewed by: <strong>{fb.reviewerName}</strong></div>
                              <table style={{ margin: 0 }}>
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
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}
