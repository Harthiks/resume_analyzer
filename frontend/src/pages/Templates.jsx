import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle, Zap } from 'lucide-react'

const templates = [
  {
    id: 'modern', name: 'Modern', desc: 'Clean and contemporary design with a purple accent sidebar. Perfect for tech roles.',
    tags: ['ATS-Friendly', 'Tech', 'Popular'], preview: 'bg-gradient-to-br from-purple-50 to-white',
  },
  {
    id: 'classic', name: 'Classic', desc: 'Traditional chronological layout that\'s universally accepted by all ATS systems.',
    tags: ['ATS-Friendly', 'Universal', 'Simple'], preview: 'bg-white',
  },
  {
    id: 'minimal', name: 'Minimal', desc: 'Ultra-clean design with maximum whitespace. Perfect for senior positions.',
    tags: ['Minimal', 'Executive', 'Clean'], preview: 'bg-gray-50',
  },
  {
    id: 'creative', name: 'Creative', desc: 'Stand out with a bold two-column layout. Best for design and creative roles.',
    tags: ['Creative', 'Design', 'Two-column'], preview: 'bg-gradient-to-br from-blue-50 to-purple-50',
  },
]

export default function Templates() {
  return (
    <div className="page-wrapper">
      <h1 className="section-title">Resume Templates</h1>
      <p className="section-subtitle">All templates are ATS-optimized and recruiter-approved</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-hover overflow-hidden">
            {/* Preview mockup */}
            <div className={`${t.preview} h-48 relative overflow-hidden flex items-center justify-center border-b border-white/5`}>
              <div className="w-32 bg-white shadow-lg rounded p-2 text-gray-800" style={{ fontSize: '5px' }}>
                <div className={`h-4 ${t.id === 'modern' ? 'bg-purple-600' : t.id === 'creative' ? 'bg-blue-600' : 'bg-gray-800'} rounded mb-1 flex items-center justify-center`}>
                  <span className="text-white font-bold" style={{ fontSize: '6px' }}>YOUR NAME</span>
                </div>
                {['Experience', 'Education', 'Skills'].map(s => (
                  <div key={s} className="mb-1">
                    <div className="h-1 bg-gray-300 rounded w-8 mb-0.5" />
                    <div className="h-0.5 bg-gray-200 rounded w-full mb-0.5" />
                    <div className="h-0.5 bg-gray-200 rounded w-4/5 mb-0.5" />
                  </div>
                ))}
              </div>
              <div className="absolute top-3 right-3 badge-green text-[10px]">
                <CheckCircle className="w-3 h-3" /> ATS-Safe
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                <div className="flex gap-1.5">
                  {t.tags.map(tag => <span key={tag} className="badge bg-white/5 text-slate-400 border border-white/10 text-[10px]">{tag}</span>)}
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">{t.desc}</p>
              <Link to={`/dashboard/builder?template=${t.id}`}>
                <button className="btn-primary w-full !py-2 flex items-center justify-center gap-2 !text-sm">
                  <Zap className="w-4 h-4" /> Use This Template
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-6 text-center mt-4">
        <p className="text-slate-400 mb-2">💡 All templates export to PDF and pass major ATS systems including Workday, Taleo, and Greenhouse</p>
        <p className="text-xs text-slate-600">More templates coming soon — we add new designs every month</p>
      </div>
    </div>
  )
}
