import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('user');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    api.hr.employees().then(setEmployees).catch(() => {});
    api.hr.reviewPeriods().then(setPeriods).catch(() => {});
  }, []);

  function showMsg(m) { setMsg(m); setError(null); setTimeout(() => setMsg(null), 3000); }
  function showErr(e) { setError(e); setMsg(null); }

  return (
    <div>
      <h1 className="page-title">Admin Panel</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['user', 'period', 'assignment', 'company'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t === 'user' ? 'Create User' : t === 'period' ? 'Create Period' : t === 'assignment' ? 'Create Assignment' : 'Create Company'}
          </button>
        ))}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {tab === 'company' && <CreateCompany onSuccess={showMsg} onError={showErr} />}
      {tab === 'user' && <CreateUser companyId={user.companyId} employees={employees} onSuccess={(m) => { showMsg(m); api.hr.employees().then(setEmployees); }} onError={showErr} />}
      {tab === 'period' && <CreatePeriod companyId={user.companyId} onSuccess={(m) => { showMsg(m); api.hr.reviewPeriods().then(setPeriods); }} onError={showErr} />}
      {tab === 'assignment' && <CreateAssignment companyId={user.companyId} employees={employees} periods={periods} onSuccess={showMsg} onError={showErr} />}
    </div>
  );
}

function CreateCompany({ onSuccess, onError }) {
  const [name, setName] = useState('');

  async function handle(e) {
    e.preventDefault();
    try {
      const c = await api.admin.createCompany(name);
      onSuccess(`Company "${c.name}" created (ID: ${c.id})`);
      setName('');
    } catch (err) { onError(err.message); }
  }

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: 16 }}>Create Company</h3>
      <form onSubmit={handle}>
        <div className="form-group">
          <label>Company Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

function CreateUser({ companyId, employees, onSuccess, onError }) {
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', role: 'EMPLOYEE', managerId: '' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handle(e) {
    e.preventDefault();
    try {
      const u = await api.admin.createUser({ companyId, ...form, managerId: form.managerId || undefined });
      onSuccess(`User "${u.name}" created`);
      setForm({ name: '', email: '', password: 'password123', role: 'EMPLOYEE', managerId: '' });
    } catch (err) { onError(err.message); }
  }

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: 16 }}>Create User</h3>
      <form onSubmit={handle}>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              <option>EMPLOYEE</option>
              <option>HR</option>
              <option>ADMIN</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Manager (optional)</label>
          <select value={form.managerId} onChange={e => set('managerId', e.target.value)}>
            <option value="">No manager</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create User</button>
      </form>
    </div>
  );
}

function CreatePeriod({ companyId, onSuccess, onError }) {
  const [form, setForm] = useState({ year: 2026, month: 9, status: 'OPEN' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handle(e) {
    e.preventDefault();
    try {
      await api.admin.createReviewPeriod({ companyId, ...form, year: parseInt(form.year), month: parseInt(form.month) });
      onSuccess(`Review period ${form.month}/${form.year} created`);
    } catch (err) { onError(err.message); }
  }

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: 16 }}>Create Review Period</h3>
      <form onSubmit={handle}>
        <div className="form-row">
          <div className="form-group">
            <label>Year</label>
            <input type="number" value={form.year} onChange={e => set('year', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Month (1-12)</label>
            <input type="number" min={1} max={12} value={form.month} onChange={e => set('month', e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option>DRAFT</option>
            <option>OPEN</option>
            <option>CLOSED</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create Period</button>
      </form>
    </div>
  );
}

function CreateAssignment({ companyId, employees, periods, onSuccess, onError }) {
  const [form, setForm] = useState({ reviewPeriodId: '', reviewerId: '', recipientId: '' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handle(e) {
    e.preventDefault();
    try {
      await api.admin.createAssignment({ companyId, ...form });
      onSuccess('Assignment created');
      setForm({ reviewPeriodId: '', reviewerId: '', recipientId: '' });
    } catch (err) { onError(err.message); }
  }

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: 16 }}>Create Feedback Assignment</h3>
      <form onSubmit={handle}>
        <div className="form-group">
          <label>Review Period</label>
          <select value={form.reviewPeriodId} onChange={e => set('reviewPeriodId', e.target.value)} required>
            <option value="">Select period...</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.month}/{p.year} ({p.status})</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Reviewer</label>
            <select value={form.reviewerId} onChange={e => set('reviewerId', e.target.value)} required>
              <option value="">Select reviewer...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Recipient</label>
            <select value={form.recipientId} onChange={e => set('recipientId', e.target.value)} required>
              <option value="">Select recipient...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Create Assignment</button>
      </form>
    </div>
  );
}
