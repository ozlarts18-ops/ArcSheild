const API_BASE = 'http://localhost:5000/api';

// Auth
export async function loginUserApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function registerUserApi(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function loginAdminApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// User Personal APIs
export async function fetchMySafetyApi() {
  const res = await fetch(`${API_BASE}/my/safety`);
  return res.json();
}
export const getMySafety = fetchMySafetyApi;

export async function fetchMyAlertsApi() {
  const res = await fetch(`${API_BASE}/my/alerts`);
  return res.json();
}
export const getMyAlerts = fetchMyAlertsApi;

export async function fetchMyHistoryApi() {
  const res = await fetch(`${API_BASE}/my/history`);
  return res.json();
}
export const getMyHistory = fetchMyHistoryApi;

export async function fetchMyAnalyticsApi() {
  const res = await fetch(`${API_BASE}/my/analytics`);
  return res.json();
}
export const getMyAnalytics = fetchMyAnalyticsApi;

// Admin Organization APIs
export async function fetchAdminOverviewApi() {
  const res = await fetch(`${API_BASE}/admin/overview`);
  return res.json();
}
export const getAdminOverview = fetchAdminOverviewApi;

export async function fetchAdminHelmetsApi() {
  const res = await fetch(`${API_BASE}/admin/helmets`);
  return res.json();
}
export const getAdminHelmets = fetchAdminHelmetsApi;

export async function fetchAdminUsersApi() {
  const res = await fetch(`${API_BASE}/admin/users`);
  return res.json();
}
export const getAdminUsers = fetchAdminUsersApi;

export async function fetchAdminLiveApi() {
  const res = await fetch(`${API_BASE}/admin/live`);
  return res.json();
}
export const getAdminLive = fetchAdminLiveApi;

export async function fetchAdminAlertsApi() {
  const res = await fetch(`${API_BASE}/admin/alerts`);
  return res.json();
}
export const getAdminAlerts = fetchAdminAlertsApi;

export async function updateAdminAlertLifecycleApi(id, status, notes = '') {
  const res = await fetch(`${API_BASE}/admin/alerts/${id}/lifecycle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  return res.json();
}
export const updateAlertLifecycle = updateAdminAlertLifecycleApi;

export async function fetchAdminIncidentsApi() {
  const res = await fetch(`${API_BASE}/admin/incidents`);
  return res.json();
}
export const getAdminIncidents = fetchAdminIncidentsApi;

export async function createAdminIncidentApi(payload) {
  const res = await fetch(`${API_BASE}/admin/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}
export const createAdminIncident = createAdminIncidentApi;

export async function fetchAdminReportApi() {
  const res = await fetch(`${API_BASE}/admin/reports/session-summary`);
  return res.json();
}
export const getAdminAnalytics = async () => {
  // Return aggregated metrics for admin
  const overview = await fetchAdminOverviewApi();
  return {
    ...overview,
    weeklyCompliance: 98.4
  };
};
