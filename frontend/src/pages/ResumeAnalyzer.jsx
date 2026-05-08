import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { analysisService } from '../services/analysisService'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, XCircle, Lightbulb, Cpu, Target } from 'lucide-react'

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('upload') // 'upload' | 'text'

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setResult(null) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1
  })

  const analyze = async () => {
    setLoading(true)
    try {
      let res
      if (mode === 'upload' && file) {
        res = await analysisService.uploadFile(file)
      } else if (mode === 'text' && text.trim()) {
        res = await analysisService.analyzeText(text)
      } else {
        return toast.error('Please provide a resume file or text')
      }
      setResult(res.data.data)
      toast.success('Analysis complete!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <h1 className="section-title">Resume Analyzer</h1>
      <p className="section-subtitle">Upload or paste your resume for AI-powered analysis and scoring</p>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {['upload', 'text'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {m === 'upload' ? '📎 Upload File' : '📝 Paste Text'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="glass p-6 space-y-4">
          <h2 className="font-semibold text-white">
            {mode === 'upload' ? 'Upload Resume' : 'Paste Resume Text'}
          </h2>

          {mode === 'upload' ? (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/3'
                } ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-emerald-400" />
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                    <p className="text-emerald-400 text-xs">✓ Ready to analyze</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-slate-500" />
                    <p className="text-slate-300 font-medium">
                      {isDragActive ? 'Drop your resume here!' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-slate-500 text-sm">Supports PDF, DOCX, TXT (max 10MB)</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="textarea-field !min-h-[280px] font-mono text-sm"
              placeholder="Paste your resume text here...&#10;&#10;John Doe&#10;Software Engineer&#10;john@example.com | +1 (555) 123-4567&#10;&#10;EXPERIENCE&#10;..."
            />
          )}

          <button onClick={analyze} disabled={loading || (mode === 'upload' ? !file : !text.trim())} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><LoadingSpinner size="sm" /> Analyzing...</> : <><Cpu className="w-4 h-4" /> Analyze Resume</>}
          </button>
        </div>

        {/* Results panel */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass p-6 flex flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" text="AI is analyzing your resume..." />
              <p className="text-slate-500 text-sm text-center">Checking ATS compatibility, skills, formatting, and more...</p>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 space-y-6">
              <h2 className="font-semibold text-white">Analysis Results</h2>

              {/* Score rings */}
              <div className="flex justify-around flex-wrap gap-4">
                <ScoreRing score={result.overall_score || 0} label="Overall" />
                <ScoreRing score={result.ats_score || 0} label="ATS Score" />
                <ScoreRing score={result.completeness_score || 0} label="Completeness" />
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Score Breakdown</h3>
                <ProgressBar value={result.quality_score || 0} label="Quality" />
                <ProgressBar value={result.ats_score || 0} label="ATS Compatibility" />
                <ProgressBar value={result.completeness_score || 0} label="Completeness" />
              </div>

              {/* Skills found */}
              {result.extracted_skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.extracted_skills.map(s => <span key={s} className="badge-green">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missing_skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map(s => <span key={s} className="badge-red">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Sections found */}
              {result.sections_found && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Sections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.sections_found).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2">
                        {v ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                        <span className={`text-xs capitalize ${v ? 'text-slate-300' : 'text-slate-600'}`}>{k.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {result.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {result.suggestions.slice(0, 6).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-primary-400 font-bold mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary && (
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <p className="text-sm text-primary-300">{result.summary}</p>
                </div>
              )}
            </motion.div>
          )}

          {!result && !loading && (
            <div className="glass p-6 flex flex-col items-center justify-center gap-4 text-center">
              <Target className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400">Upload your resume and click "Analyze" to see detailed AI insights and scores</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
