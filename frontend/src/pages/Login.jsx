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
        <select 
          className="form-group" 
          style={{ width: '100%', padding: 8 }} 
          onChange={(e) => {
            if (e.target.value) quickLogin(e.target.value);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a user to login as...</option>
          <optgroup label="Ashoka Textiles">
            <option value="coo@ashoka.com">COO (Admin)</option>
            <option value="rohan@ashoka.com">Rohan (HR / Manager)</option>
            <option value="priya@ashoka.com">Priya (Manager / Employee)</option>
            <option value="emp1@ashoka.com">Employee 1</option>
            <option value="emp2@ashoka.com">Employee 2</option>
            <option value="emp3@ashoka.com">Employee 3</option>
            <option value="emp4@ashoka.com">Employee 4</option>
            <option value="emp5@ashoka.com">Employee 5</option>
            <option value="emp6@ashoka.com">Employee 6</option>
          </optgroup>
          <optgroup label="Bright Path Consulting">
            <option value="founder@brightpath.com">Founder (HR / Manager)</option>
            <option value="emp1@brightpath.com">Employee 1</option>
            <option value="emp2@brightpath.com">Employee 2</option>
            <option value="emp3@brightpath.com">Employee 3</option>
            <option value="emp4@brightpath.com">Employee 4</option>
            <option value="emp5@brightpath.com">Employee 5</option>
            <option value="emp6@brightpath.com">Employee 6</option>
            <option value="emp7@brightpath.com">Employee 7</option>
            <option value="emp8@brightpath.com">Employee 8</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
}
