import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ReceivedDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.me.receivedDetail(id).then(setData).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <Link to="/feedback/received" className="back-link">← Back to received</Link>
      <h1 className="page-title">Feedback from {data.reviewerName}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
        Period: {data.month}/{data.year} · Submitted: {new Date(data.submittedAt).toLocaleDateString()}
      </p>
      {data.items.map((item, i) => (
        <div className="param-block" key={i}>
          <h4>{item.parameter_name}</h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{item.score}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 5</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.comment}</p>
        </div>
      ))}
    </div>
  );
}
