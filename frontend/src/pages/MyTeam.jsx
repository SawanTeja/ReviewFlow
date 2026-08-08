import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function MyTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initiating, setInitiating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.me.team()
      .then(setTeam)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleInitiateFeedback(employeeId) {
    setInitiating(employeeId);
    setError(null);
    try {
      const result = await api.me.initiateFeedback(employeeId);
      navigate(`/feedback/give/${result.assignmentId}`);
    } catch (err) {
      setError(err.message || 'Failed to initiate feedback. Is there an OPEN review period?');
      setInitiating(null);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">My Team</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        View your direct reports and initiate their monthly performance feedback.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {team.length === 0 ? (
        <div className="empty">You have no direct reports.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => (
                <tr key={member.id}>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleInitiateFeedback(member.id)}
                      disabled={initiating === member.id}
                    >
                      {initiating === member.id ? 'Starting...' : 'Write Feedback'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
