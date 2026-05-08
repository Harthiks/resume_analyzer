import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analysisService } from '../services/analysisService'
import ProgressBar from '../components/ui/ProgressBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { Target, Zap, CheckCircle, XCircle } from 'lucide-react'

export default function JobMatcher() {
  const [resume, setResume] = useState('')
  const [jd, setJD] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const match = async () => {
    if (!resume.trim() || !jd.trim()) return toast.error('Both fields are required')
    setLoading(true)
    try {
      const res = await analysisService.matchJob(resume, jd)
      setResult(res.data.data)
      toast.success('Match analysis complete!')
    } catch (e) {
      toast.error('Match failed')
    } finally {
      setLoading(false)
    }
  }

  const matchColor = result ? (result.match_percentage >= 80 ? 'text-emerald-400' : result.match_percentage >= 60 ? 'text-blue-400' : result.match_percentage >= 40 ? 'text-amber-400' : 'text-red-400') : ''

  return (
    <div className="page-wrapper">
      <h1 className="section-title">Job Description Matcher</h1>
      <p className="section-subtitle">See how well your resume matches a specific job and get AI recommendations</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <div>
            <label className="label">Your Resume Text</label>
            <textarea value={resume} onChange={e => setResume(e.target.value)} className="textarea-field !min-h-[200px]" placeholder="Paste your resume here..." />
          </div>
          <div>
            <label className="label">Job Description</label>
            <textarea value={jd} onChange={e => setJD(e.target.value)} className="textarea-field !min-h-[200px]" placeholder="Paste the job description here..." />
          </div>
          <button onClick={match} disabled={loading || !resume.trim() || !jd.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><LoadingSpinner size="sm" /> Matching...</> : <><Target className="w-4 h-4" /> Analyze Match</>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result && !loading ? (
            <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 space-y-5">
              {/* Match % big display */}
              <div className="text-center">
                <p className={`text-7xl font-black ${matchColor}`}>{result.match_percentage}%</p>
                <p className="text-slate-400 mt-1">Job Match Score</p>
              </div>

              <ProgressBar value={result.match_percentage} label="Overall Match" />
              <ProgressBar value={result.experience_match || result.match_percentage} label="Experience Match" />

              {result.matched_skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ Matched Skills</h3>
                  <div className="flex flex-wrap gap-2">{result.matched_skills.map(s => <span key={s} className="badge-green">{s}</span>)}</div>
                </div>
              )}

              {result.missing_skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2">❌ Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">{result.missing_skills.map(s => <span key={s} className="badge-red">{s}</span>)}</div>
                </div>
              )}

              {result.missing_keywords?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-2">🔑 Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">{result.missing_keywords.slice(0, 10).map(k => <span key={k} className="badge-amber">{k}</span>)}</div>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> AI Recommendations</h3>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-primary-400 font-bold mt-0.5">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.overall_assessment && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <p className="text-sm text-primary-300">{result.overall_assessment}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass p-6 flex flex-col items-center justify-center gap-4 text-center">
              {loading ? <LoadingSpinner size="lg" text="Running semantic analysis..." /> : (
                <>
                  <Target className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-400">Paste your resume and a job description to see your match percentage and get personalized tips</p>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
