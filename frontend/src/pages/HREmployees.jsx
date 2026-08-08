import { useState, useEffect } from 'react';
import api from '../api';

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.hr.employees().then(setEmployees).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Employees</h1>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong></td>
                <td style={{ color: 'var(--text-muted)' }}>{e.email}</td>
                <td><span className={`badge badge-${e.role.toLowerCase()}`}>{e.role}</span></td>
                <td>{e.is_active ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
