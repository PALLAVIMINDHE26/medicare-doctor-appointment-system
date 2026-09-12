import api from './axios';

export const patientService = {
  getMyProfile: () => api.get('/patients/me').then((r) => r.data),
  updateMyProfile: (data) => api.put('/patients/me', data).then((r) => r.data),
  getMyDashboardStats: () => api.get('/patients/me/dashboard-stats').then((r) => r.data),

  // Admin management
  adminGetAll: (params) => api.get('/patients/admin/all', { params }).then((r) => r.data),
  adminUpdateStatus: (id, isActive) => api.put(`/patients/${id}/status`, { isActive }).then((r) => r.data),
};
