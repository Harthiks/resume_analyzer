import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { resumeService } from '../services/resumeService'
import { analysisService } from '../services/analysisService'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate, getScoreColor } from '../utils/helpers'
import {
  FileText, Plus, TrendingUp, Target, CheckCircle2,
  ArrowRight, Clock, Zap, Award, BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-dark px-3 py-2 text-sm border border-white/10">
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-primary-400 font-semibold">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [resumes, setResumes] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, resumesRes, analysesRes] = await Promise.all([
          resumeService.dashboardStats(),
          resumeService.list(),
          analysisService.history(),
        ])
        setStats(statsRes.data.data)
        setResumes(resumesRes.data.data?.slice(0, 3) || [])
        setAnalyses(analysesRes.data.data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Build chart data from analyses
  const chartData = analyses.slice(0, 7).reverse().map((a, i) => ({
    name: formatDate(a.created_at).split(' ')[0] || `Day ${i+1}`,
    score: a.overall_score || 0,
    ats: a.ats_score || 0,
  }))

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>

  return (
    <div className="page-wrapper">
      {/* Header */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <h1 className="section-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'} 👋</span>
        </h1>
        <p className="section-subtitle">Here's your resume performance overview</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Resumes Built', value: stats?.total_resumes || 0, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: BarChart3, label: 'Analyses Done', value: stats?.total_analyses || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Award, label: 'Avg Score', value: `${stats?.avg_score || 0}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Zap, label: 'AI Ready', value: 'Active', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <motion.div key={label} variants={itemVariants} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score trend chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 glass p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Resume Score Trend</h2>
              <p className="text-sm text-slate-500">Last {chartData.length} analyses</p>
            </div>
            <span className="badge-purple">Live</span>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="url(#scoreGrad)" strokeWidth={2} name="Overall" dot={{ fill: '#7c3aed', r: 4 }} />
                <Area type="monotone" dataKey="ats" stroke="#3b82f6" fill="url(#atsGrad)" strokeWidth={2} name="ATS" dot={{ fill: '#3b82f6', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <TrendingUp className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-500">Analyze your first resume to see score trends</p>
              <Link to="/dashboard/analyzer" className="text-primary-400 text-sm mt-2 hover:underline">Go to Analyzer →</Link>
            </div>
          )}
        </motion.div>

        {/* Recent analyses */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Scores</h2>
            <Link to="/dashboard/analyzer" className="text-xs text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {analyses.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  a.overall_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                  a.overall_score >= 60 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {a.overall_score || 0}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.filename || 'Text Analysis'}</p>
                  <p className="text-xs text-slate-500">{formatDate(a.created_at)}</p>
                </div>
              </div>
            ))}
            {analyses.length === 0 && (
              <div className="text-center py-6">
                <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No analyses yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* My Resumes + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumes */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Resumes</h2>
            <Link to="/dashboard/builder" className="btn-primary !py-1.5 !px-4 !text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> New
            </Link>
          </div>
          <div className="space-y-3">
            {resumes.map(r => (
              <Link key={r.id} to={`/dashboard/builder/${r.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">{r.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{r.template} template · {formatDate(r.updated_at)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
            {resumes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No resumes yet. Create your first one!</p>
                <Link to="/dashboard/builder" className="btn-primary !py-2 !px-5 !text-sm">
                  <Plus className="w-4 h-4 mr-1 inline" /> Create Resume
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/dashboard/builder', icon: FileText, label: 'Build Resume', color: 'text-primary-400', bg: 'bg-primary-500/10 hover:bg-primary-500/20' },
              { to: '/dashboard/analyzer', icon: Target, label: 'Analyze Resume', color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
              { to: '/dashboard/ats', icon: CheckCircle2, label: 'Check ATS', color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
              { to: '/dashboard/job-match', icon: Zap, label: 'Job Matcher', color: 'text-amber-400', bg: 'bg-amber-500/10 hover:bg-amber-500/20' },
              { to: '/dashboard/interview', icon: Award, label: 'Interview Prep', color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/20' },
              { to: '/dashboard/chat', icon: TrendingUp, label: 'AI Assistant', color: 'text-cyan-400', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20' },
            ].map(({ to, icon: Icon, label, color, bg }) => (
              <Link key={to} to={to}>
                <div className={`${bg} rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-[1.02] cursor-pointer`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                  <p className="text-xs font-medium text-slate-300">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
