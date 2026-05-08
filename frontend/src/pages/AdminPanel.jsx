import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../services/analysisService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { Users, BarChart3, FileText, Target, Trash2, Shield, RefreshCw } from 'lucide-react'
import { formatDate } from '../utils/helpers'

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('analytics')

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, usersRes] = await Promise.all([adminService.getAnalytics(), adminService.getUsers()])
      setAnalytics(analyticsRes.data.data)
      setUsers(usersRes.data.data)
    } catch (e) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user ${name}?`)) return
    try {
      await adminService.deleteUser(id)
      setUsers(u => u.filter(user => user.id !== id))
      toast.success('User deleted')
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateRole(id, role)
      setUsers(u => u.map(user => user.id === id ? { ...user, role } : user))
      toast.success('Role updated')
    } catch (e) {
      toast.error('Update failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Loading admin panel..." /></div>

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2"><Shield className="w-6 h-6 text-amber-400" /> Admin Panel</h1>
          <p className="section-subtitle">Platform management and analytics</p>
        </div>
        <button onClick={loadData} className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2">
        {[['analytics', 'Analytics'], ['users', 'User Management']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stat grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: analytics.total_users, icon: Users, color: 'text-blue-400' },
              { label: 'Total Resumes', value: analytics.total_resumes, icon: FileText, color: 'text-primary-400' },
              { label: 'Analyses Run', value: analytics.total_analyses, icon: BarChart3, color: 'text-emerald-400' },
              { label: 'Job Matches', value: analytics.total_job_matches, icon: Target, color: 'text-amber-400' },
              { label: 'Interviews Gen', value: analytics.total_interviews, icon: Shield, color: 'text-violet-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <Icon className={`w-6 h-6 ${color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent users */}
          <div className="glass p-6">
            <h2 className="font-semibold text-white mb-4">Recently Joined Users</h2>
            <div className="space-y-3">
              {analytics.recent_users?.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-purple'}`}>{u.role}</span>
                  <p className="text-xs text-slate-600">{formatDate(u.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr>
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-400">{u.email}</td>
                    <td className="table-cell">
                      <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="bg-dark-700 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 cursor-pointer">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="table-cell text-slate-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(u.id, u.name)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
