import api from './axios';

export const doctorService = {
  search: (params) => api.get('/doctors', { params }).then((r) => r.data),
  getById: (id) => api.get(`/doctors/${id}`).then((r) => r.data),
  getAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }).then((r) => r.data),

  // Doctor self-service
  getMyProfile: () => api.get('/doctors/me').then((r) => r.data),
  updateMyProfile: (data) => api.put('/doctors/me', data).then((r) => r.data),
  updateMyWorkingHours: (workingHours) => api.put('/doctors/me/working-hours', { workingHours }).then((r) => r.data),
  getMyDashboardStats: () => api.get('/doctors/me/dashboard-stats').then((r) => r.data),
  getMyPatients: (params) => api.get('/doctors/me/patients', { params }).then((r) => r.data),

  // Admin management
  adminGetAll: (params) => api.get('/doctors/admin/all', { params }).then((r) => r.data),
  adminCreate: (data) => api.post('/doctors', data).then((r) => r.data),
  adminUpdateStatus: (id, data) => api.put(`/doctors/${id}/status`, data).then((r) => r.data),
  adminDelete: (id) => api.delete(`/doctors/${id}`).then((r) => r.data),
};
