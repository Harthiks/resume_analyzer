import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, Save, Loader2, Key } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', location: user?.location || '',
    linkedin: user?.linkedin || '', github: user?.github || '', website: user?.website || '',
    bio: user?.bio || '', title: user?.title || '',
  })
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', form)
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePass = async () => {
    if (!passForm.current_password || !passForm.new_password) return toast.error('Fill both password fields')
    if (passForm.new_password.length < 6) return toast.error('New password must be at least 6 characters')
    setChangingPass(true)
    try {
      await api.put('/auth/change-password', passForm)
      toast.success('Password changed!')
      setPassForm({ current_password: '', new_password: '' })
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally {
      setChangingPass(false)
    }
  }

  return (
    <div className="page-wrapper">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle">Manage your account information</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="glass p-6 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-4xl font-black text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className={`mt-2 inline-block badge ${user?.role === 'admin' ? 'badge-amber' : 'badge-purple'}`}>{user?.role}</span>
          </div>
          <div className="w-full space-y-2 text-left text-sm text-slate-400">
            {user?.title && <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary-400" />{user.title}</p>}
            {user?.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" />{user.location}</p>}
            {user?.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" />{user.phone}</p>}
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 space-y-5">
            <h2 className="font-semibold text-white">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['name', 'Full Name', User, 'John Doe'],
                ['title', 'Job Title', Briefcase, 'Software Engineer'],
                ['phone', 'Phone', Phone, '+1 (555) 000-0000'],
                ['location', 'Location', MapPin, 'New York, USA'],
                ['linkedin', 'LinkedIn URL', Linkedin, 'linkedin.com/in/...'],
                ['github', 'GitHub URL', Github, 'github.com/...'],
                ['website', 'Website', Globe, 'yoursite.dev'],
              ].map(([field, label, Icon, placeholder]) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="input-field !pl-10" placeholder={placeholder} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="textarea-field !min-h-[80px]" placeholder="Tell us about yourself..." />
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>

          {/* Password change */}
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Key className="w-5 h-5 text-primary-400" /> Change Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" value={passForm.current_password} onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))} className="input-field" placeholder="Current password" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" value={passForm.new_password} onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))} className="input-field" placeholder="Min 6 characters" />
              </div>
            </div>
            <button onClick={handleChangePass} disabled={changingPass} className="btn-secondary flex items-center gap-2">
              {changingPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
