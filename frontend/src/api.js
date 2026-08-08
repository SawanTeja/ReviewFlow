const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(json = true) {
  const h = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function request(method, path, body) {
  const opts = { method, headers: headers() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, message: data?.error || res.statusText, details: data?.details };
  return data;
}

const api = {
  auth: {
    login: (email, password) => request('POST', '/auth/login', { email, password }),
  },
  me: {
    profile: () => request('GET', '/me'),
    feedbackGiven: () => request('GET', '/me/feedback/given'),
    feedbackReceived: () => request('GET', '/me/feedback/received'),
    feedbackHistory: () => request('GET', '/me/feedback/history'),
    receivedDetail: (id) => request('GET', `/me/feedback/received/${id}`),
  },
  feedback: {
    getAssignment: (id) => request('GET', `/feedback/assignments/${id}`),
    saveDraft: (id, items) => request('POST', `/feedback/assignments/${id}/draft`, { items }),
    submit: (id, items) => request('POST', `/feedback/assignments/${id}/submit`, { items }),
  },
  hr: {
    employees: () => request('GET', '/hr/employees'),
    reviewPeriods: () => request('GET', '/hr/review-periods'),
    periodStatus: (id) => request('GET', `/hr/review-periods/${id}/status`),
    pendingAssignments: (id) => request('GET', `/hr/review-periods/${id}/pending`),
    allAssignments: (id) => request('GET', `/hr/review-periods/${id}/assignments`),
    feedback: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.reviewPeriodId) params.set('reviewPeriodId', filters.reviewPeriodId);
      if (filters.reviewerId) params.set('reviewerId', filters.reviewerId);
      if (filters.recipientId) params.set('recipientId', filters.recipientId);
      const qs = params.toString();
      return request('GET', `/hr/feedback${qs ? '?' + qs : ''}`);
    },
  },
  admin: {
    createCompany: (name) => request('POST', '/admin/companies', { name }),
    createUser: (data) => request('POST', '/admin/users', data),
    createReviewPeriod: (data) => request('POST', '/admin/review-periods', data),
    createAssignment: (data) => request('POST', '/admin/feedback-assignments', data),
    reseed: () => request('POST', '/admin/reseed'),
  },
};

export default api;
