import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-14 h-14' }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-2 border-primary-500/30 border-t-primary-500 rounded-full`}
      />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  )
}
