const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('ce_token');
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Request failed: ${response.status}`);
  return data;
};
export const getProperties = () => apiRequest('/api/properties');
export const createProperty = property => apiRequest('/api/properties', { method: 'POST', body: JSON.stringify(property) });
export const getMyProperties = () => apiRequest('/api/properties/mine');
export const getAdminProperties = () => apiRequest('/api/properties/admin/all');
export const updateProperty = (id, changes) => apiRequest(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
export const deleteProperty = id => apiRequest(`/api/properties/${id}`, { method: 'DELETE' });
export const setPropertyApproval = (id, approvalStatus) => apiRequest(`/api/properties/${id}/approval`, { method: 'PATCH', body: JSON.stringify({ approvalStatus }) });
