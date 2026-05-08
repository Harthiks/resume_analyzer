import { motion } from 'framer-motion'
import { getScoreBg } from '../../utils/helpers'

export default function ProgressBar({ value, max = 100, label, showValue = true, color }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  const barColor = color || (pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500')

  return (
    <div className="w-full space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-slate-400">{label}</span>}
          {showValue && <span className="text-slate-300 font-medium">{pct}%</span>}
        </div>
      )}
      <div className="progress-bar-track">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
