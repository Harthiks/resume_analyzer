import { motion } from 'framer-motion'
import { getScoreBg, getScoreLabel, getScoreColor } from '../../utils/helpers'

export default function ScoreRing({ score, label, size = 120 }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p className={`text-xs font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
        </div>
      )}
    </div>
  )
}
