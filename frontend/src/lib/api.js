import { getFriendlyError } from './helpers';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const handleUnauthorized = () => {
  localStorage.clear();
  window.location.href = '/login';
};

/**
 * Reusable API utility using fetch with global error handling as requested.
 * @param {string} endpoint - The API endpoint (e.g., '/api/users')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @param {function} showToast - Toast function to show errors
 * @param {function} setLoading - State setter for loading
 * @returns {Promise<any>} The parsed JSON data
 */
export const apiFetch = async (endpoint, options = {}, showToast, setLoading) => {
  if (setLoading) setLoading(true);

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}${endpoint.replace('/api', '')}`
      : `http://localhost:5000${endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      handleUnauthorized();
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (showToast) {
        showToast(err.message || 'Something went wrong', 'error');
      }
      throw new Error(err.message || 'API Error');
    }

    // Some endpoints (like delete) might not return JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
    
    return true;

  } catch (err) {
    if (showToast && err.message !== 'API Error') { // Avoid double toasting if caught above
      showToast('Network error. Check your connection.', 'error');
    }
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
};
