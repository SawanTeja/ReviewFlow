import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function GiveFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.feedback.getAssignment(id).then(d => {
      setData(d);
      d.items.forEach(item => {
        if (item.score) setScores(s => ({ ...s, [item.parameter_id]: item.score }));
        if (item.comment) setComments(c => ({ ...c, [item.parameter_id]: item.comment }));
      });
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  function buildItems() {
    return data.parameters.map(p => ({
      parameterId: p.id,
      score: scores[p.id] || null,
      comment: comments[p.id] || '',
    }));
  }

  async function handleDraft() {
    setSaving(true); setMsg(null); setError(null);
    try {
      const items = buildItems().filter(i => i.score || i.comment);
      await api.feedback.saveDraft(id, items);
      setMsg('Draft saved!');
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  async function handleSubmit() {
    setSaving(true); setMsg(null); setError(null);
    try {
      await api.feedback.submit(id, buildItems());
      setMsg('Feedback submitted!');
      setTimeout(() => navigate('/feedback/given'), 1000);
    } catch (err) {
      setError(err.details ? err.details.join(', ') : err.message);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !data) return <div className="alert alert-error">{error}</div>;

  const { assignment, parameters } = data;

  return (
    <div>
      <Link to="/feedback/given" className="back-link">← Back to assignments</Link>
      <h1 className="page-title">Feedback for {assignment.recipient_name}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
        Period: {assignment.month}/{assignment.year} · Status: <span className={`badge badge-${assignment.status.toLowerCase()}`}>{assignment.status}</span>
      </p>

      {assignment.status === 'SUBMITTED' && (
        <div className="alert alert-success">This feedback has already been submitted.</div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {parameters.map(p => (
        <div className="param-block" key={p.id}>
          <h4>{p.name}</h4>
          <div className="score-row">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                className={`score-btn ${scores[p.id] === s ? 'selected' : ''}`}
                onClick={() => setScores(prev => ({ ...prev, [p.id]: s }))}
                disabled={assignment.status === 'SUBMITTED'}
              >{s}</button>
            ))}
          </div>
          <textarea
            placeholder={`Why did you give this score for ${p.name}?`}
            value={comments[p.id] || ''}
            onChange={e => setComments(prev => ({ ...prev, [p.id]: e.target.value }))}
            disabled={assignment.status === 'SUBMITTED'}
          />
        </div>
      ))}

      {assignment.status !== 'SUBMITTED' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-outline" onClick={handleDraft} disabled={saving}>Save Draft</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={saving}>Submit Feedback</button>
        </div>
      )}
    </div>
  );
}
