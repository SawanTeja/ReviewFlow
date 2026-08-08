import { useState, useEffect } from 'react';
import api from '../api';

export default function FeedbackHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me.feedbackHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (history.length === 0) return <div className="empty">No feedback history yet.</div>;

  const months = [...new Set(history.flatMap(p => p.scores.map(s => `${s.month}/${s.year}`)))];

  return (
    <div>
      <h1 className="page-title">Performance History</h1>
      <div className="card">
        <table className="history-table">
          <thead>
            <tr>
              <th>Parameter</th>
              {months.map(m => <th key={m} style={{ textAlign: 'center' }}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {history.map(param => (
              <tr key={param.parameterId}>
                <td><strong>{param.parameterName}</strong></td>
                {months.map(m => {
                  const entry = param.scores.find(s => `${s.month}/${s.year}` === m);
                  return (
                    <td key={m} className="score" style={{ textAlign: 'center', color: entry ? scoreColor(entry.score) : 'var(--text-muted)' }}>
                      {entry ? entry.score : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 16 }}>Score Trends</h2>
      {history.map(param => (
        <div className="card" key={param.parameterId}>
          <h3 className="card-title" style={{ marginBottom: 12 }}>{param.parameterName}</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 120 }}>
            {param.scores.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  height: `${(s.score / 5) * 80}px`,
                  background: `linear-gradient(180deg, var(--primary), ${scoreColor(s.score)})`,
                  borderRadius: '6px 6px 0 0',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: 4, fontWeight: 700, fontSize: 14, color: 'white',
                  minWidth: 36,
                }}>{s.score}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.month}/{s.year}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function scoreColor(score) {
  if (score >= 4) return 'var(--success)';
  if (score >= 3) return 'var(--warning)';
  return 'var(--danger)';
}
