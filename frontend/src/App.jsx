import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import MyTeam from './pages/MyTeam';
import FeedbackGiven from './pages/FeedbackGiven';
import FeedbackReceived from './pages/FeedbackReceived';
import FeedbackHistory from './pages/FeedbackHistory';
import GiveFeedback from './pages/GiveFeedback';
import ReceivedDetail from './pages/ReceivedDetail';
import HREmployees from './pages/HREmployees';
import HRPeriods from './pages/HRPeriods';
import HRPeriodDetail from './pages/HRPeriodDetail';
import HRFeedback from './pages/HRFeedback';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="team" element={<MyTeam />} />
            <Route path="feedback/given" element={<FeedbackGiven />} />
            <Route path="feedback/received" element={<FeedbackReceived />} />
            <Route path="feedback/received/:id" element={<ReceivedDetail />} />
            <Route path="feedback/history" element={<FeedbackHistory />} />
            <Route path="feedback/give/:id" element={<GiveFeedback />} />
            <Route path="hr/employees" element={<HREmployees />} />
            <Route path="hr/periods" element={<HRPeriods />} />
            <Route path="hr/periods/:id" element={<HRPeriodDetail />} />
            <Route path="hr/feedback" element={<HRFeedback />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
