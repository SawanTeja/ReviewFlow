import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(email) {
    setEmail(email);
    setPassword('password123');
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ReviewFlow</h1>
        <p className="subtitle">Performance Evaluation Tool</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@ashoka.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password123" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Quick Login:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button className="btn btn-sm btn-outline" onClick={() => quickLogin('priya@ashoka.com')}>Priya (Employee)</button>
          <button className="btn btn-sm btn-outline" onClick={() => quickLogin('rohan@ashoka.com')}>Rohan (HR)</button>
          <button className="btn btn-sm btn-outline" onClick={() => quickLogin('founder@brightpath.com')}>Founder (HR)</button>
          <button className="btn btn-sm btn-outline" onClick={() => quickLogin('emp1@ashoka.com')}>Emp1 Ashoka</button>
          <button className="btn btn-sm btn-outline" onClick={() => quickLogin('emp1@brightpath.com')}>Emp1 BP</button>
        </div>
      </div>
    </div>
  );
}
