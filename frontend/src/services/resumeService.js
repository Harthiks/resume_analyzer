import api from './api'

export const resumeService = {
  list: () => api.get('/resumes/'),
  create: (data) => api.post('/resumes/', data),
  get: (id) => api.get(`/resumes/${id}`),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  dashboardStats: () => api.get('/resumes/dashboard/stats'),
  exportPDF: (id) => api.get(`/export/pdf/${id}`, { responseType: 'blob' }),
  exportPDFFromData: (data) => api.post('/export/pdf', data, { responseType: 'blob' }),
}
