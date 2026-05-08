// Score color helper
export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

export function getScoreBg(score) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Needs Work'
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

// Truncate text
export function truncate(text, len = 80) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

// Download blob
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Empty resume template
export function emptyResume() {
  return {
    title: 'My Resume',
    template: 'modern',
    personal_info: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', title: '' },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], languages: [], tools: [] },
    certifications: [],
    achievements: [],
  }
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
