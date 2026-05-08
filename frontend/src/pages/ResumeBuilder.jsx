import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { resumeService } from '../services/resumeService'
import { aiService } from '../services/analysisService'
import { emptyResume, downloadBlob } from '../utils/helpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Save, Download, Sparkles, Plus, Trash2, ChevronDown, ChevronUp,
  User, GraduationCap, Briefcase, Code, Award, Star, Eye, Loader2, X
} from 'lucide-react'

const STEPS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'projects', label: 'Projects', icon: Code },
  { key: 'skills', label: 'Skills', icon: Star },
  { key: 'certifications', label: 'Certifications', icon: Award },
]

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const tag = input.trim()
    if (tag && !value.includes(tag)) { onChange([...value, tag]); setInput('') }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[42px] bg-dark-800/80 border border-white/10 rounded-xl p-2">
        {value.map(tag => (
          <span key={tag} className="badge-purple flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-red-400">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
          placeholder={value.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-600 min-w-24"
        />
      </div>
      <p className="text-xs text-slate-600">Press Enter or comma to add</p>
    </div>
  )
}

export default function ResumeBuilder() {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(emptyResume())
  const [activeStep, setActiveStep] = useState('personal')
  const [loading, setLoading] = useState(!!resumeId)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (resumeId) {
      resumeService.get(resumeId).then(res => {
        setResume(res.data.data)
        setLoading(false)
      }).catch(() => { toast.error('Resume not found'); navigate('/dashboard/builder') })
    }
  }, [resumeId])

  const update = (path, value) => {
    setResume(prev => {
      const parts = path.split('.')
      const updated = { ...prev }
      let obj = updated
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] }
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (resumeId) {
        await resumeService.update(resumeId, resume)
        toast.success('Resume saved!')
      } else {
        const res = await resumeService.create(resume)
        toast.success('Resume created!')
        navigate(`/dashboard/builder/${res.data.data.id}`, { replace: true })
      }
    } catch (e) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF...')
      let res
      if (resumeId) {
        res = await resumeService.exportPDF(resumeId)
      } else {
        res = await resumeService.exportPDFFromData(resume)
      }
      toast.dismiss()
      downloadBlob(res.data, `${resume.title || 'resume'}.pdf`)
      toast.success('PDF downloaded!')
    } catch (e) {
      toast.dismiss()
      toast.error('Export failed')
    }
  }

  const generateAISummary = async () => {
    setAiLoading(true)
    try {
      const res = await aiService.generateSummary({ personal_info: resume.personal_info, experience: resume.experience, skills: resume.skills, education: resume.education })
      update('summary', res.data.data.summary)
      toast.success('Summary generated!')
    } catch (e) {
      toast.error('AI summary failed')
    } finally {
      setAiLoading(false)
    }
  }

  const addItem = (section, defaultItem) => {
    update(section, [...(resume[section] || []), defaultItem])
  }
  const removeItem = (section, idx) => {
    update(section, resume[section].filter((_, i) => i !== idx))
  }
  const updateItem = (section, idx, field, value) => {
    const updated = [...resume[section]]
    updated[idx] = { ...updated[idx], [field]: value }
    update(section, updated)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Loading resume..." /></div>

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Resume Builder</h1>
          <p className="section-subtitle">Build your ATS-optimized resume with AI assistance</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(p => !p)} className="btn-secondary flex items-center gap-2 !py-2 !px-4">
            <Eye className="w-4 h-4" /> {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2 !py-2 !px-4">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 !py-2 !px-4">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Template & Title */}
      <div className="glass p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-48">
          <label className="label !mb-1">Resume Title</label>
          <input value={resume.title} onChange={e => update('title', e.target.value)} className="input-field !py-2" placeholder="My Resume" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="label !mb-1">Template</label>
          <select value={resume.template} onChange={e => update('template', e.target.value)} className="input-field !py-2">
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="creative">Creative</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Stepper + Form */}
        <div className="xl:col-span-2 space-y-4">
          {/* Step tabs */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveStep(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeStep === key ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass p-6 space-y-5"
            >
              {/* Personal Info */}
              {activeStep === 'personal' && (
                <>
                  <h2 className="font-semibold text-white text-lg">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['personal_info.name', 'Full Name', 'John Doe'],
                      ['personal_info.title', 'Job Title', 'Software Engineer'],
                      ['personal_info.email', 'Email', 'john@example.com'],
                      ['personal_info.phone', 'Phone', '+1 (555) 000-0000'],
                      ['personal_info.location', 'Location', 'New York, USA'],
                      ['personal_info.linkedin', 'LinkedIn URL', 'linkedin.com/in/johndoe'],
                      ['personal_info.github', 'GitHub URL', 'github.com/johndoe'],
                      ['personal_info.website', 'Website/Portfolio', 'johndoe.dev'],
                    ].map(([path, label, placeholder]) => (
                      <div key={path}>
                        <label className="label">{label}</label>
                        <input
                          value={path.split('.').reduce((o, k) => o?.[k] || '', resume)}
                          onChange={e => update(path, e.target.value)}
                          className="input-field"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label !mb-0">Professional Summary</label>
                      <button onClick={generateAISummary} disabled={aiLoading} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generate with AI
                      </button>
                    </div>
                    <textarea
                      value={resume.summary}
                      onChange={e => update('summary', e.target.value)}
                      className="textarea-field"
                      placeholder="Write a compelling summary or click 'Generate with AI'..."
                    />
                  </div>
                </>
              )}

              {/* Education */}
              {activeStep === 'education' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">Education</h2>
                    <button onClick={() => addItem('education', { institution: '', degree: '', field: '', start_date: '', end_date: '', gpa: '', description: '' })} className="btn-primary !py-1.5 !px-3 !text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resume.education.map((edu, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 space-y-3 relative">
                      <button onClick={() => removeItem('education', i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Institution</label><input value={edu.institution} onChange={e => updateItem('education', i, 'institution', e.target.value)} className="input-field" placeholder="MIT" /></div>
                        <div><label className="label">Degree</label><input value={edu.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} className="input-field" placeholder="B.Tech" /></div>
                        <div><label className="label">Field of Study</label><input value={edu.field} onChange={e => updateItem('education', i, 'field', e.target.value)} className="input-field" placeholder="Computer Science" /></div>
                        <div><label className="label">GPA</label><input value={edu.gpa} onChange={e => updateItem('education', i, 'gpa', e.target.value)} className="input-field" placeholder="3.8/4.0" /></div>
                        <div><label className="label">Start Date</label><input value={edu.start_date} onChange={e => updateItem('education', i, 'start_date', e.target.value)} className="input-field" placeholder="Aug 2020" /></div>
                        <div><label className="label">End Date</label><input value={edu.end_date} onChange={e => updateItem('education', i, 'end_date', e.target.value)} className="input-field" placeholder="May 2024" /></div>
                      </div>
                    </div>
                  ))}
                  {resume.education.length === 0 && <p className="text-slate-500 text-center py-6">Click "Add" to add education</p>}
                </>
              )}

              {/* Experience */}
              {activeStep === 'experience' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">Work Experience</h2>
                    <button onClick={() => addItem('experience', { company: '', role: '', location: '', start_date: '', end_date: '', current: false, description: '', technologies: [] })} className="btn-primary !py-1.5 !px-3 !text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 space-y-3 relative">
                      <button onClick={() => removeItem('experience', i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">Company</label><input value={exp.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} className="input-field" placeholder="Google" /></div>
                        <div><label className="label">Role</label><input value={exp.role} onChange={e => updateItem('experience', i, 'role', e.target.value)} className="input-field" placeholder="Software Engineer" /></div>
                        <div><label className="label">Location</label><input value={exp.location} onChange={e => updateItem('experience', i, 'location', e.target.value)} className="input-field" placeholder="Remote / NYC" /></div>
                        <div><label className="label">Start Date</label><input value={exp.start_date} onChange={e => updateItem('experience', i, 'start_date', e.target.value)} className="input-field" placeholder="Jan 2022" /></div>
                        <div>
                          <label className="label">End Date</label>
                          <input value={exp.current ? 'Present' : exp.end_date} onChange={e => updateItem('experience', i, 'end_date', e.target.value)} disabled={exp.current} className="input-field disabled:opacity-50" placeholder="Dec 2023" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input type="checkbox" checked={exp.current} onChange={e => updateItem('experience', i, 'current', e.target.checked)} id={`current-${i}`} className="accent-primary-500" />
                          <label htmlFor={`current-${i}`} className="text-sm text-slate-400">Currently working</label>
                        </div>
                      </div>
                      <div><label className="label">Description (one bullet per line)</label><textarea value={exp.description} onChange={e => updateItem('experience', i, 'description', e.target.value)} className="textarea-field !min-h-[80px]" placeholder="Developed and maintained..." /></div>
                      <div><label className="label">Technologies</label><TagInput value={exp.technologies || []} onChange={v => updateItem('experience', i, 'technologies', v)} placeholder="React, Python, AWS..." /></div>
                    </div>
                  ))}
                  {resume.experience.length === 0 && <p className="text-slate-500 text-center py-6">Click "Add" to add work experience</p>}
                </>
              )}

              {/* Projects */}
              {activeStep === 'projects' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">Projects</h2>
                    <button onClick={() => addItem('projects', { name: '', description: '', technologies: [], github: '', live_url: '' })} className="btn-primary !py-1.5 !px-3 !text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resume.projects.map((proj, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 space-y-3 relative">
                      <button onClick={() => removeItem('projects', i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><label className="label">Project Name</label><input value={proj.name} onChange={e => updateItem('projects', i, 'name', e.target.value)} className="input-field" placeholder="AI Chatbot" /></div>
                        <div><label className="label">GitHub URL</label><input value={proj.github} onChange={e => updateItem('projects', i, 'github', e.target.value)} className="input-field" placeholder="github.com/user/repo" /></div>
                        <div><label className="label">Live URL</label><input value={proj.live_url} onChange={e => updateItem('projects', i, 'live_url', e.target.value)} className="input-field" placeholder="myproject.vercel.app" /></div>
                      </div>
                      <div><label className="label">Description</label><textarea value={proj.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} className="textarea-field !min-h-[80px]" placeholder="Built a..." /></div>
                      <div><label className="label">Technologies</label><TagInput value={proj.technologies || []} onChange={v => updateItem('projects', i, 'technologies', v)} placeholder="Next.js, FastAPI..." /></div>
                    </div>
                  ))}
                  {resume.projects.length === 0 && <p className="text-slate-500 text-center py-6">Click "Add" to add projects</p>}
                </>
              )}

              {/* Skills */}
              {activeStep === 'skills' && (
                <>
                  <h2 className="font-semibold text-white text-lg">Skills</h2>
                  {[
                    ['skills.technical', 'Technical Skills', 'Python, React, Docker...'],
                    ['skills.tools', 'Tools & Platforms', 'Git, AWS, Figma...'],
                    ['skills.soft', 'Soft Skills', 'Leadership, Communication...'],
                    ['skills.languages', 'Languages', 'English, Spanish...'],
                  ].map(([path, label, placeholder]) => (
                    <div key={path}>
                      <label className="label">{label}</label>
                      <TagInput
                        value={path.split('.').reduce((o, k) => o?.[k] || [], resume)}
                        onChange={v => update(path, v)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="label">Key Achievements</label>
                    {resume.achievements.map((a, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={a} onChange={e => { const arr = [...resume.achievements]; arr[i] = e.target.value; update('achievements', arr) }} className="input-field flex-1" placeholder="Achievement..." />
                        <button onClick={() => update('achievements', resume.achievements.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => update('achievements', [...resume.achievements, ''])} className="text-sm text-primary-400 hover:underline flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Achievement
                    </button>
                  </div>
                </>
              )}

              {/* Certifications */}
              {activeStep === 'certifications' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white text-lg">Certifications</h2>
                    <button onClick={() => addItem('certifications', { name: '', issuer: '', date: '', url: '', credential_id: '' })} className="btn-primary !py-1.5 !px-3 !text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resume.certifications.map((cert, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 space-y-3 relative">
                      <button onClick={() => removeItem('certifications', i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><label className="label">Certification Name</label><input value={cert.name} onChange={e => updateItem('certifications', i, 'name', e.target.value)} className="input-field" placeholder="AWS Solutions Architect" /></div>
                        <div><label className="label">Issuing Organization</label><input value={cert.issuer} onChange={e => updateItem('certifications', i, 'issuer', e.target.value)} className="input-field" placeholder="Amazon Web Services" /></div>
                        <div><label className="label">Date</label><input value={cert.date} onChange={e => updateItem('certifications', i, 'date', e.target.value)} className="input-field" placeholder="March 2024" /></div>
                        <div><label className="label">Credential ID</label><input value={cert.credential_id} onChange={e => updateItem('certifications', i, 'credential_id', e.target.value)} className="input-field" placeholder="ABC-1234" /></div>
                        <div><label className="label">URL</label><input value={cert.url} onChange={e => updateItem('certifications', i, 'url', e.target.value)} className="input-field" placeholder="https://..." /></div>
                      </div>
                    </div>
                  ))}
                  {resume.certifications.length === 0 && <p className="text-slate-500 text-center py-6">Click "Add" to add certifications</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden xl:block">
          <div className="glass p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h3>
            <div className="bg-white rounded-lg p-4 text-xs text-gray-800 max-h-[700px] overflow-y-auto" style={{ fontSize: '8px', lineHeight: '1.4' }}>
              <div className="text-center border-b border-gray-300 pb-2 mb-2">
                <p className="text-lg font-bold text-gray-900" style={{ fontSize: '14px' }}>{resume.personal_info.name || 'Your Name'}</p>
                {resume.personal_info.title && <p className="text-purple-700 font-medium" style={{ fontSize: '9px' }}>{resume.personal_info.title}</p>}
                <p className="text-gray-500" style={{ fontSize: '8px' }}>
                  {[resume.personal_info.email, resume.personal_info.phone, resume.personal_info.location].filter(Boolean).join(' | ')}
                </p>
              </div>
              {resume.summary && <div className="mb-2"><p className="font-bold text-gray-900 border-b border-gray-200 mb-1" style={{ fontSize: '9px' }}>SUMMARY</p><p className="text-gray-700">{resume.summary}</p></div>}
              {resume.experience.length > 0 && (
                <div className="mb-2">
                  <p className="font-bold text-gray-900 border-b border-gray-200 mb-1" style={{ fontSize: '9px' }}>EXPERIENCE</p>
                  {resume.experience.map((e, i) => (
                    <div key={i} className="mb-1">
                      <p className="font-semibold">{e.role} — {e.company}</p>
                      <p className="text-gray-500">{e.start_date} – {e.current ? 'Present' : e.end_date}</p>
                    </div>
                  ))}
                </div>
              )}
              {resume.education.length > 0 && (
                <div className="mb-2">
                  <p className="font-bold text-gray-900 border-b border-gray-200 mb-1" style={{ fontSize: '9px' }}>EDUCATION</p>
                  {resume.education.map((e, i) => (
                    <div key={i}><p className="font-semibold">{e.degree} in {e.field}</p><p className="text-gray-500">{e.institution}</p></div>
                  ))}
                </div>
              )}
              {resume.skills.technical.length > 0 && (
                <div><p className="font-bold text-gray-900 border-b border-gray-200 mb-1" style={{ fontSize: '9px' }}>SKILLS</p><p>{resume.skills.technical.join(', ')}</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
