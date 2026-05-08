import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService } from '../services/analysisService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react'

const QUICK_PROMPTS = [
  'How do I improve my ATS score?',
  'What skills should a full-stack developer have?',
  'Write a professional summary for a software engineer',
  'What are common behavioral interview questions?',
  'How do I negotiate salary?',
  'Suggest career paths for a data scientist',
]

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm your AI Career Assistant powered by Gemini. I can help with resume writing, career advice, interview prep, and more. What can I help you with today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (msg = input) => {
    const text = msg.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await aiService.sendChatMessage(text, convId)
      setConvId(res.data.data.conversation_id)
      setMessages(m => [...m, { role: 'assistant', content: res.data.data.response }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: "I'm having trouble connecting right now. Please make sure the backend is running and try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">AI Career Assistant</h1>
          <p className="section-subtitle">Powered by Gemini AI — Ask anything about your career</p>
        </div>
        <button onClick={() => { setMessages([{ role: 'assistant', content: "New conversation started! How can I help you?" }]); setConvId(null) }}
          className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm">
          <Trash2 className="w-4 h-4" /> Clear Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick prompts */}
        <div className="glass p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Questions</p>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="w-full text-left text-xs text-slate-400 hover:text-white bg-white/3 hover:bg-white/8 rounded-lg p-2.5 transition-all">
              {p}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="lg:col-span-3 flex flex-col glass overflow-hidden" style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary-600' : 'bg-gradient-to-br from-violet-600 to-blue-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-4">
            <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                className="input-field flex-1"
                placeholder="Ask about resume tips, career advice, interview prep..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} className="btn-primary !py-2 !px-4">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
