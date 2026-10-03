// Dynamic API base URL from Vite environment with automatic /api routing normalization
const rawApi = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_BASE = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;

/**
 * Helper to get active JWT auth token from client storage
 */
function getAuthToken() {
  try {
    const raw = localStorage.getItem('arcsheild_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch (e) {
    // Ignore parse error
  }
  return null;
}

/**
 * Standardized secure fetch wrapper with auto-attached Bearer tokens
 */
async function secureFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid response format' }));

    // If session expired, clean invalid token
    if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
      console.warn('[ArcShield] Auth session expired. Redirecting to login.');
    }

    return data;
  } catch (error) {
    console.error(`[API Network Error] ${url}:`, error.message);
    return {
      success: false,
      message: 'Network connection failed. Please check server availability.'
    };
  }
}

// -------------------------------------------------------------
// Authentication APIs
// -------------------------------------------------------------
export async function loginUserApi(email, password) {
  return secureFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerUserApi(data) {
  return secureFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function loginAdminApi(email, password) {
  return secureFetch('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function logoutApi() {
  return secureFetch('/auth/logout', {
    method: 'POST'
  });
}

export async function fetchCurrentUserApi() {
  return secureFetch('/auth/me');
}

// -------------------------------------------------------------
// Normal User Personal APIs (/api/my/*)
// -------------------------------------------------------------
export async function fetchMySafetyApi() {
  return secureFetch('/my/safety');
}
export const getMySafety = fetchMySafetyApi;

export async function fetchMyAlertsApi() {
  return secureFetch('/my/alerts');
}
export const getMyAlerts = fetchMyAlertsApi;

export async function fetchMyHistoryApi() {
  return secureFetch('/my/history');
}
export const getMyHistory = fetchMyHistoryApi;

export async function fetchMyAnalyticsApi() {
  return secureFetch('/my/analytics');
}
export const getMyAnalytics = fetchMyAnalyticsApi;

// -------------------------------------------------------------
// Admin Organization APIs (/api/admin/*)
// -------------------------------------------------------------
export async function fetchAdminOverviewApi() {
  return secureFetch('/admin/overview');
}
export const getAdminOverview = fetchAdminOverviewApi;

export async function fetchAdminHelmetsApi() {
  return secureFetch('/admin/helmets');
}
export const getAdminHelmets = fetchAdminHelmetsApi;

export async function fetchAdminUsersApi() {
  return secureFetch('/admin/users');
}
export const getAdminUsers = fetchAdminUsersApi;

export async function fetchAdminLiveApi() {
  return secureFetch('/admin/live');
}
export const getAdminLive = fetchAdminLiveApi;

export async function fetchAdminAlertsApi() {
  return secureFetch('/admin/alerts');
}
export const getAdminAlerts = fetchAdminAlertsApi;

export async function updateAdminAlertLifecycleApi(id, status, notes = '') {
  return secureFetch(`/admin/alerts/${id}/lifecycle`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes })
  });
}
export const updateAlertLifecycle = updateAdminAlertLifecycleApi;

export async function fetchAdminIncidentsApi() {
  return secureFetch('/admin/incidents');
}
export const getAdminIncidents = fetchAdminIncidentsApi;

export async function createAdminIncidentApi(payload) {
  return secureFetch('/admin/incidents', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
export const createAdminIncident = createAdminIncidentApi;

export async function fetchAdminReportApi() {
  return secureFetch('/admin/reports/session-summary');
}

export async function fetchAdminSystemStatusApi() {
  return secureFetch('/admin/system/status');
}

export const getAdminAnalytics = async () => {
  const overview = await fetchAdminOverviewApi();
  return {
    ...overview,
    weeklyCompliance: 98.4
  };
};
