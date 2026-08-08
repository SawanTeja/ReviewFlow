import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FeedbackHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('Overall Average');

  useEffect(() => {
    api.me.feedbackHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const periodsSet = new Set();
    history.forEach(param => {
      param.scores.forEach(s => periodsSet.add(`${s.year}-${s.month.toString().padStart(2, '0')}`));
    });
    
    const sortedPeriods = Array.from(periodsSet).sort();
    
    const data = sortedPeriods.map(p => {
      const [year, monthStr] = p.split('-');
      const month = parseInt(monthStr, 10);
      const displayPeriod = `${month}/${year}`;
      
      const dataPoint = { period: displayPeriod };
      
      let totalScore = 0;
      let scoreCount = 0;
      
      history.forEach(param => {
        const scoreEntry = param.scores.find(s => s.month === month && s.year === parseInt(year));
        if (scoreEntry) {
          dataPoint[param.parameterName] = scoreEntry.score;
          totalScore += scoreEntry.score;
          scoreCount++;
        }
      });
      
      dataPoint['Overall Average'] = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(2)) : null;
      return dataPoint;
    });
    
    return data;
  }, [history]);

  const metrics = useMemo(() => {
    if (!history) return ['Overall Average'];
    return ['Overall Average', ...history.map(p => p.parameterName)];
  }, [history]);

  if (loading) return <div className="loading">Loading...</div>;
  if (history.length === 0) return <div className="empty">No feedback history yet.</div>;

  return (
    <div>
      <h1 className="page-title">Performance History</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Track your performance trends over time across different parameters.
      </p>

      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Score Trends</h2>
          <select 
            className="form-group" 
            style={{ width: 250, margin: 0, padding: 8 }} 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {metrics.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="var(--primary)" 
                strokeWidth={3}
                dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Raw Data</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Parameter</th>
              {chartData.map(d => <th key={d.period} style={{ textAlign: 'center' }}>{d.period}</th>)}
            </tr>
          </thead>
          <tbody>
            {history.map(param => (
              <tr key={param.parameterId}>
                <td><strong>{param.parameterName}</strong></td>
                {chartData.map(d => {
                  const val = d[param.parameterName];
                  return (
                    <td key={d.period} className="score" style={{ textAlign: 'center', color: val ? scoreColor(val) : 'var(--text-muted)' }}>
                      {val ? val : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ background: '#f8f9fa' }}>
              <td><strong>Overall Average</strong></td>
              {chartData.map(d => (
                <td key={d.period} className="score" style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {d['Overall Average'] || '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function scoreColor(score) {
  if (score >= 4) return 'var(--success)';
  if (score >= 3) return 'var(--warning)';
  return 'var(--danger)';
}
