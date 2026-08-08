import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reseeding, setReseeding] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleReseed() {
    if (!confirm('Reset database to seed data? This will wipe all changes.')) return;
    setReseeding(true);
    try {
      await api.admin.reseed();
      alert('Database reseeded! Logging out...');
      handleLogout();
    } catch (err) {
      alert('Reseed failed: ' + (err.message || 'Unknown error'));
    } finally {
      setReseeding(false);
    }
  }

  const isHR = user?.role === 'HR' || user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>ReviewFlow</h2>
          <div className="user-info">{user?.name} · {user?.role}</div>
        </div>

        {isEmployee && (
          <>
            <div className="sidebar-section">Employee</div>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/feedback/given">Feedback to Give</NavLink>
            <NavLink to="/feedback/received">Feedback Received</NavLink>
            <NavLink to="/feedback/history">Performance History</NavLink>
          </>
        )}

        {isHR && (
          <>
            <div className="sidebar-section">HR</div>
            <NavLink to="/hr/employees">Employees</NavLink>
            <NavLink to="/hr/periods">Review Periods</NavLink>
            <NavLink to="/hr/feedback">Submitted Feedback</NavLink>
          </>
        )}

        {isHR && (
          <>
            <div className="sidebar-section">Admin</div>
            <NavLink to="/admin">Manage</NavLink>
          </>
        )}

        <div className="sidebar-footer">
          <button className="btn btn-reseed btn-sm" onClick={handleReseed} disabled={reseeding} style={{ marginBottom: 8 }}>
            {reseeding ? 'Reseeding...' : '⟳ Reset Seed Data'}
          </button>
          <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
