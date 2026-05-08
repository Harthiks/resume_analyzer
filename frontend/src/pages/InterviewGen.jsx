import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService } from '../services/analysisService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { HelpCircle, Download, Plus, X } from 'lucide-react'

const LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead']
const CATEGORIES = [
  { key: 'hr_questions', label: 'HR Questions', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'technical_questions', label: 'Technical Questions', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { key: 'project_questions', label: 'Project Questions', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'behavioral_questions', label: 'Behavioral Questions', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
]

export default function InterviewGen() {
  const [form, setForm] = useState({ job_role: '', experience_level: 'mid', skills: [], num_questions: 12 })
  const [skillInput, setSkillInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) { setForm(f => ({ ...f, skills: [...f.skills, s] })); setSkillInput('') }
  }

  const generate = async () => {
    if (!form.job_role.trim()) return toast.error('Please enter the job role')
    setLoading(true)
    try {
      const res = await aiService.generateInterview(form)
      setResult(res.data.data.questions)
      toast.success('Questions generated!')
    } catch (e) {
      toast.error('Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <h1 className="section-title">Interview Question Generator</h1>
      <p className="section-subtitle">Generate personalized interview questions based on your role and skills</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="glass p-6 space-y-5">
          <h2 className="font-semibold text-white">Configuration</h2>
          <div>
            <label className="label">Job Role *</label>
            <input value={form.job_role} onChange={e => setForm(f => ({ ...f, job_role: e.target.value }))} className="input-field" placeholder="Software Engineer" />
          </div>
          <div>
            <label className="label">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setForm(f => ({ ...f, experience_level: l }))}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.experience_level === l ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="input-field flex-1" placeholder="React, Python..." />
              <button onClick={addSkill} className="btn-primary !py-2 !px-3"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => (
                <span key={s} className="badge-purple flex items-center gap-1">
                  {s}
                  <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s) }))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Number of Questions: {form.num_questions}</label>
            <input type="range" min="6" max="20" value={form.num_questions} onChange={e => setForm(f => ({ ...f, num_questions: +e.target.value }))} className="w-full accent-primary-500" />
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><LoadingSpinner size="sm" /> Generating...</> : <><HelpCircle className="w-4 h-4" /> Generate Questions</>}
          </button>
        </div>

        {/* Questions panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8 flex flex-col items-center justify-center gap-4 h-full">
                <LoadingSpinner size="lg" text="AI is generating your questions..." />
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {CATEGORIES.map(({ key, label, color, bg }) => (
                  result[key]?.length > 0 && (
                    <div key={key} className={`glass border ${bg.split(' ')[1]} p-5`}>
                      <h3 className={`font-semibold ${color} mb-3 flex items-center gap-2`}>
                        <HelpCircle className="w-4 h-4" /> {label} ({result[key].length})
                      </h3>
                      <ol className="space-y-2">
                        {result[key].map((q, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className={`${color} font-bold min-w-[1.5rem]`}>{i+1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )
                ))}
              </motion.div>
            ) : (
              <div className="glass p-8 flex flex-col items-center justify-center gap-4 text-center h-full">
                <HelpCircle className="w-12 h-12 text-slate-600" />
                <p className="text-slate-400">Configure your role and skills, then generate tailored interview questions</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
