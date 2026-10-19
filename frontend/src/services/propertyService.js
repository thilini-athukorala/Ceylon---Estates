
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('ce_token');

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed: ${response.status}`
    );
  }

  return data;
};

// GET APPROVED PROPERTIES
export const getProperties = () =>
  apiRequest('/api/properties');

// CREATE PROPERTY
export const createProperty = property =>
  apiRequest('/api/properties', {
    method: 'POST',
    body: JSON.stringify(property)
  });

// OWNER PROPERTIES
export const getMyProperties = () =>
  apiRequest('/api/properties/mine');

// ADMIN PROPERTIES
export const getAdminProperties = () =>
  apiRequest('/api/properties/admin/all');

// UPDATE PROPERTY
export const updateProperty = (id, changes) =>
  apiRequest(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(changes)
  });

// DELETE PROPERTY
export const deleteProperty = id =>
  apiRequest(`/api/properties/${id}`, {
    method: 'DELETE'
  });

// ADMIN APPROVAL
export const setPropertyApproval = (id, approvalStatus) =>
  apiRequest(`/api/properties/${id}/approval`, {
    method: 'PATCH',
    body: JSON.stringify({ approvalStatus })
  });

// UPLOAD PROPERTY IMAGES TO CLOUDINARY
export const uploadPropertyImages = async files => {
  const token = localStorage.getItem('ce_token');

  if (!token) {
    throw new Error('Please sign in as a property owner.');
  }

  if (!files || files.length < 1 || files.length > 5) {
    throw new Error('Select between 1 and 5 images.');
  }

  const formData = new FormData();

  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Only JPG, PNG and WebP images are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Each image must be 5 MB or smaller.');
    }

    formData.append('images', file);
  }

  const response = await fetch(`${BASE}/api/upload/properties`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed.');
  }

  return data.images;
};
export const uploadPropertyPhotos = uploadPropertyImages;