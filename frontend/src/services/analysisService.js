import api from './api'

export const analysisService = {
  uploadFile: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/analyze/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  analyzeText: (text) => api.post('/analyze/text', { text }),
  history: () => api.get('/analyze/history'),
  checkATS: (resume_text) => api.post('/ats/check', { resume_text }),
  matchJob: (resume_text, job_description) => api.post('/jobs/match', { resume_text, job_description }),
  jobHistory: () => api.get('/jobs/history'),
}

export const aiService = {
  getSuggestions: (resume_text, section = null) => api.post('/ai/suggest', { resume_text, section }),
  generateSummary: (data) => api.post('/ai/generate-summary', data),
  generateAchievements: (role, skills) => api.post('/ai/generate-achievements', { role, skills }),
  generateInterview: (data) => api.post('/interview/generate', data),
  interviewHistory: () => api.get('/interview/history'),
  sendChatMessage: (message, conversation_id = null) => api.post('/chat/message', { message, conversation_id }),
  chatHistory: () => api.get('/chat/history'),
}

export const adminService = {
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAnalytics: () => api.get('/admin/analytics'),
}
