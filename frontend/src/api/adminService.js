import api from './axios';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats').then((r) => r.data),
};
