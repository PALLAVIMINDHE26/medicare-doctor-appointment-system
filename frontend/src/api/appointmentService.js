import api from './axios';

export const appointmentService = {
  book: (data) => api.post('/appointments', data).then((r) => r.data),
  getById: (id) => api.get(`/appointments/${id}`).then((r) => r.data),
  cancel: (id, cancelReason) => api.put(`/appointments/${id}/cancel`, { cancelReason }).then((r) => r.data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data).then((r) => r.data),

  // Doctor actions
  confirm: (id) => api.put(`/appointments/${id}/confirm`).then((r) => r.data),
  reject: (id, cancelReason) => api.put(`/appointments/${id}/reject`, { cancelReason }).then((r) => r.data),
  complete: (id, doctorNotes) => api.put(`/appointments/${id}/complete`, { doctorNotes }).then((r) => r.data),
  markNoShow: (id) => api.put(`/appointments/${id}/no-show`).then((r) => r.data),

  // Listings
  getMyAsPatient: (params) => api.get('/appointments/patient/me', { params }).then((r) => r.data),
  getMyAsDoctor: (params) => api.get('/appointments/doctor/me', { params }).then((r) => r.data),
  adminGetAll: (params) => api.get('/appointments/admin/all', { params }).then((r) => r.data),
};
