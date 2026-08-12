const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Core API Client
 * Wraps fetch to automatically attach JWT tokens and handle 401s.
 */
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('eduguide_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized (e.g. Session Expiry)
  if (response.status === 401) {
    // If we're not already on a login page, trigger a logout
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('eduguide_token');
      localStorage.removeItem('eduguide_user');
      window.location.href = '/'; 
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || 'An API error occurred');
  }

  return data;
}

// Convenience methods
export const api = {
  get: (endpoint, options) => fetchApi(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => fetchApi(endpoint, { method: 'DELETE', ...options }),
};
