import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analysisService } from '../services/analysisService'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, FileCheck, Zap } from 'lucide-react'

export default function ATSChecker() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!text.trim()) return toast.error('Please paste your resume text')
    setLoading(true)
    try {
      const res = await analysisService.checkATS(text)
      setResult(res.data.data)
      toast.success('ATS check complete!')
    } catch (e) {
      toast.error('ATS check failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <h1 className="section-title">ATS Checker</h1>
      <p className="section-subtitle">Check if your resume is compatible with Applicant Tracking Systems</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 space-y-4">
          <h2 className="font-semibold text-white">Paste Resume Text</h2>
          <textarea value={text} onChange={e => setText(e.target.value)} className="textarea-field !min-h-[320px]" placeholder="Paste your entire resume text here..." />
          <button onClick={check} disabled={loading || !text.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><LoadingSpinner size="sm" /> Checking...</> : <><FileCheck className="w-4 h-4" /> Run ATS Check</>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result && !loading ? (
            <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 space-y-5">
              <div className="flex justify-center">
                <ScoreRing score={result.ats_score || 0} label="ATS Score" size={140} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Formatting', val: result.formatting_score },
                  { label: 'Keywords', val: result.keyword_score },
                  { label: 'Structure', val: result.structure_score },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center glass p-3 rounded-xl">
                    <p className="text-lg font-bold text-white">{val || 0}%</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">✅ Passed Checks</h3>
                <div className="space-y-1">
                  {(result.passed_checks || []).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{c.replace('✅ ', '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(result.failed_checks || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2">❌ Failed Checks</h3>
                  <div className="space-y-1">
                    {result.failed_checks.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{c.replace('❌ ', '').replace('⚠️ ', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(result.improvements || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> Improvements</h3>
                  <ul className="space-y-1.5">
                    {result.improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">→</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.keyword_density && Object.keys(result.keyword_density).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Keyword Density</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.keyword_density).slice(0, 12).map(([kw, count]) => (
                      <span key={kw} className="badge-blue">{kw} ×{count}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass p-6 flex flex-col items-center justify-center gap-4 text-center">
              {loading ? <LoadingSpinner size="lg" text="Running ATS analysis..." /> : (
                <>
                  <FileCheck className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-400">Paste your resume text and run the ATS check to see compatibility scores</p>
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
