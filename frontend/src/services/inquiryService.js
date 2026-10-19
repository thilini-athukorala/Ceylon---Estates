import { apiRequest } from './propertyService';
export const sendInquiry = payload => apiRequest('/api/inquiries', { method: 'POST', body: JSON.stringify(payload) });
export const getMyInquiries = () => apiRequest('/api/inquiries/mine');
export const getReceivedInquiries = () => apiRequest('/api/inquiries/received');
export const replyToInquiry = (id, reply) => apiRequest(`/api/inquiries/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply }) });
