import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, FileText, Target, CheckCircle, ArrowRight,
  Star, Zap, Shield, BarChart3, MessageSquare, HelpCircle
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'AI Resume Builder', desc: 'Build ATS-optimized resumes with AI-powered suggestions, real-time preview, and multiple templates.' },
  { icon: Target, title: 'Resume Analyzer', desc: 'Upload any resume and get instant AI analysis with scores, improvement tips, and skill gaps.' },
  { icon: CheckCircle, title: 'ATS Checker', desc: 'Ensure your resume passes Applicant Tracking Systems with our smart compatibility checker.' },
  { icon: BarChart3, title: 'Job Matcher', desc: 'Paste any job description and get a semantic match score with missing keywords and AI tips.' },
  { icon: MessageSquare, title: 'AI Career Assistant', desc: 'Chat with our AI assistant for career advice, resume tips, and interview preparation.' },
  { icon: HelpCircle, title: 'Interview Generator', desc: 'Generate role-specific HR, technical, and behavioral interview questions instantly.' },
]

const stats = [
  { value: '10K+', label: 'Resumes Built' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '4.9★', label: 'User Rating' },
  { value: '50+', label: 'Templates' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">ResumeAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary !py-2 !px-5 !text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 text-sm text-primary-400 font-medium mb-6">
            <Zap className="w-4 h-4" />
            Powered by Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight text-balance">
            Build Resumes That{' '}
            <span className="gradient-text">Land Jobs</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            AI-powered resume builder, ATS checker, job matcher, and career assistant — everything you need to get hired faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                Start Building Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-8 mt-16 max-w-2xl mx-auto"
        >
          {stats.map(({ value, label }) => (
            <motion.div key={label} variants={itemVariants} className="text-center">
              <p className="text-3xl font-black gradient-text">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Get Hired</h2>
          <p className="text-slate-400 text-lg">Comprehensive AI tools for every stage of your job search</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={itemVariants}>
              <div className="glass-hover p-6 h-full group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/20 to-violet-600/20 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass p-12 rounded-3xl border border-primary-500/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-slate-400 mb-8">Join thousands of professionals who've already leveled up their careers with ResumeAI.</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-lg px-10 py-4"
            >
              Create Your Free Account
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="font-bold text-white">ResumeAI</span>
        </div>
        <p className="text-slate-500 text-sm">© 2024 ResumeAI. Built with ❤️ using Gemini AI</p>
      </footer>
    </div>
  )
}
