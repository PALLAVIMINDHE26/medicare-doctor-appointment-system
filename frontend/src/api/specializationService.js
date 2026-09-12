import api from './axios';

export const specializationService = {
  getAll: (params) => api.get('/specializations', { params }).then((r) => r.data),
  create: (data) => api.post('/specializations', data).then((r) => r.data),
  update: (id, data) => api.put(`/specializations/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/specializations/${id}`).then((r) => r.data),
};
