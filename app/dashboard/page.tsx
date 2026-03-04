'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadMultipleToCloudinary } from '@/lib/cloudinary'
import { FEATURE_CATEGORIES, COLORS, BODY_TYPES, MAKES, FUEL_TYPES, TRANSMISSIONS } from '@/lib/vehicle-features'
import { useRouter } from 'next/navigation'
import {
  Car, Users, Image as ImageIcon, Plus, Edit, Trash2, X,
  Upload, Check, Loader2, CreditCard, Eye, Phone, Mail,
  TrendingUp, CheckCircle, Clock, XCircle, AlertCircle, FileText,
  Search, ChevronDown, BarChart3, MessageSquare, InboxIcon,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRow { id: string; email: string; full_name: string; role: 'admin' | 'agent' }
interface Vehicle  { id: string; make: string; model: string; year: number; price: number; status: string; images: string[]; created_at: string }
interface HeroSlide { id: string; title: string; subtitle: string; image_url: string; order_index: number; active: boolean }
interface ContactSubmission {
  id: string; name: string; email: string; phone: string | null
  subject: string; message: string; replied: boolean; replied_at: string | null; created_at: string
}
interface FinanceApp {
  id: string; full_name: string; email: string; phone: string; whatsapp: string | null
  vehicle_details: string | null; vehicle_price: number | null; loan_amount_requested: number | null
  deposit_amount: number; preferred_term_months: number; gross_monthly_income: number
  net_monthly_income: number; employment_status: string; employer_name: string | null
  business_name: string | null; decl_has_been_blacklisted: boolean; decl_has_judgements: boolean
  decl_under_debt_review: boolean; decl_ever_sequestrated: boolean; decl_ever_insolvent: boolean
  pre_approval_status: string; estimated_monthly_payment: number | null
  estimated_monthly_stressed: number | null; max_loan_estimate: number | null
  disposable_income_calc: number | null; dti_ratio: number | null; pre_approval_notes: string | null
  status: string; admin_notes: string | null; documents_complete: boolean
  submitted_to_bank_at: string | null; bank_reference: string | null; doc_id_front: string | null
  doc_proof_of_residence: string[] | null; doc_payslip_month1: string | null
  doc_bank_statement_month1: string | null; doc_bank_statement_month2: string | null
  doc_bank_statement_month3: string | null; created_at: string
}

// ─── Status configs ───────────────────────────────────────────────────────────
const APP_STATUS: Record<string, { label: string; bg: string; text: string; Icon: any }> = {
  new:                { label: 'New',               bg: 'bg-blue-100',   text: 'text-blue-800',   Icon: Clock },
  documents_pending:  { label: 'Docs Pending',      bg: 'bg-amber-100',  text: 'text-amber-800',  Icon: FileText },
  documents_received: { label: 'Docs Received',     bg: 'bg-purple-100', text: 'text-purple-800', Icon: CheckCircle },
  contacted:          { label: 'Contacted',          bg: 'bg-indigo-100', text: 'text-indigo-800', Icon: Phone },
  in_review:          { label: 'In Review',          bg: 'bg-amber-100',  text: 'text-amber-800',  Icon: Eye },
  submitted_to_bank:  { label: 'Submitted to Bank', bg: 'bg-cyan-100',   text: 'text-cyan-800',   Icon: TrendingUp },
  approved:           { label: 'Approved',           bg: 'bg-green-100',  text: 'text-green-800',  Icon: CheckCircle },
  declined:           { label: 'Declined',           bg: 'bg-red-100',    text: 'text-red-800',    Icon: XCircle },
  withdrawn:          { label: 'Withdrawn',          bg: 'bg-gray-100',   text: 'text-gray-600',   Icon: X },
}
const PA_STATUS: Record<string, { label: string; bg: string; text: string; Icon: any }> = {
  strong:   { label: 'Strong Profile', bg: 'bg-green-100', text: 'text-green-800', Icon: CheckCircle },
  review:   { label: 'Needs Review',   bg: 'bg-blue-100',  text: 'text-blue-800',  Icon: Clock },
  manual:   { label: 'Manual Assess.', bg: 'bg-amber-100', text: 'text-amber-800', Icon: Eye },
  declined: { label: 'Pre-Declined',   bg: 'bg-red-100',   text: 'text-red-800',   Icon: XCircle },
  pending:  { label: 'Pending',        bg: 'bg-gray-100',  text: 'text-gray-600',  Icon: Clock },
}

// ─── WhatsApp message templates per status ────────────────────────────────────
function buildWhatsAppMessage(status: string, app: FinanceApp): string {
  const name    = app.full_name
  const vehicle = app.vehicle_details || 'your selected vehicle'

  const messages: Record<string, string> = {
    contacted: `Hi ${name}, this is IC Cars. We tried to reach you regarding your finance application for ${vehicle}. Please give us a call or reply here when you get a chance. 😊`,
    in_review: `Hi ${name}, good news — your finance application for ${vehicle} is currently under review by our team. We'll be in touch within 1-2 business days with an update. IC Cars 🚗`,
    documents_pending: `Hi ${name}, IC Cars here. To process your finance application for ${vehicle}, we still need the following documents:\n\n📄 SA ID (front)\n📄 Proof of residence (not older than 3 months)\n📄 Latest payslip\n📄 3 months bank statements\n\nPlease send them here or bring them to our offices. Thank you!`,
    documents_received: `Hi ${name}, IC Cars here. We've received your documents for your finance application on ${vehicle}. Your file is now complete and we're preparing it for bank submission. We'll keep you updated! 👍`,
    submitted_to_bank: `Hi ${name}, IC Cars here. Your finance application for ${vehicle} has been submitted to the bank for assessment. The bank typically takes 24-48 hours. We'll contact you as soon as we hear back! 🏦`,
    approved: `Hi ${name}, GREAT NEWS from IC Cars! 🎉 Your finance application for ${vehicle} has been APPROVED! Our team will contact you shortly to finalise everything and get you behind the wheel. Congratulations! 🚗✨`,
    declined: `Hi ${name}, IC Cars here. Unfortunately your finance application for ${vehicle} was not successful this time. Please don't be discouraged — there are options we can explore such as a larger deposit or a more affordable vehicle. Please contact us to discuss. We're here to help! 💪`,
    withdrawn: `Hi ${name}, IC Cars here. We're confirming that your finance application has been closed. Should your circumstances change or you'd like to reapply in future, please don't hesitate to contact us. Thank you! 🙏`,
  }

  return messages[status] || `Hi ${name}, IC Cars here. There's an update on your finance application. Please contact us for more information. Thank you!`
}

function openWhatsApp(phone: string, message: string) {
  const number = phone.replace(/\D/g, '').replace(/^0/, '27')
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

const WA_TRIGGER_STATUSES = new Set([
  'contacted', 'in_review', 'documents_pending', 'documents_received',
  'submitted_to_bank', 'approved', 'declined', 'withdrawn',
])

type Tab = 'vehicles' | 'finance' | 'messages' | 'users' | 'hero'

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser]           = useState<any>(null)
  const [userRole, setUserRole]   = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('vehicles')
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data) setUserRole(data.role)
    const { count } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('replied', false)
    setUnreadMessages(count || 0)
    setLoading(false)
  }

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; Icon: any; adminOnly?: boolean; badge?: number }[] = [
    { id: 'vehicles', label: 'Vehicles',      Icon: Car },
    { id: 'finance',  label: 'Finance Apps',  Icon: CreditCard },
    { id: 'messages', label: 'Messages',      Icon: MessageSquare, badge: unreadMessages },
    { id: 'users',    label: 'Users',         Icon: Users,     adminOnly: true },
    { id: 'hero',     label: 'Hero Carousel', Icon: ImageIcon, adminOnly: true },
  ]

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display text-white mb-1">Dashboard</h1>
            <p className="text-gray-400 text-sm">
              {user?.email}
              {userRole && <span className="ml-2 px-2 py-0.5 bg-gold text-black text-xs font-bold uppercase">{userRole}</span>}
            </p>
          </div>
          <BarChart3 className="w-10 h-10 text-gold/30" />
        </div>
      </div>

      <div className="border-b-2 border-gray-100 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, Icon, adminOnly, badge }) => {
              if (adminOnly && userRole !== 'admin') return null
              const active = activeTab === id
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-[3px] ${
                    active ? 'text-gold border-gold' : 'text-gray-500 border-transparent hover:text-dark hover:border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />{label}
                  {badge ? (
                    <span className="absolute top-2.5 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'vehicles' && <VehiclesTab userRole={userRole} userId={user?.id} />}
        {activeTab === 'finance'  && <FinanceTab />}
        {activeTab === 'messages' && <MessagesTab onBadgeChange={setUnreadMessages} />}
        {activeTab === 'users'    && userRole === 'admin' && <UsersTab />}
        {activeTab === 'hero'     && userRole === 'admin' && <HeroTab />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function MessagesTab({ onBadgeChange }: { onBadgeChange: (n: number) => void }) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<ContactSubmission | null>(null)
  const [filter, setFilter]           = useState<'all' | 'unread' | 'replied'>('all')
  const [search, setSearch]           = useState('')

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('contact_submissions').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setSubmissions(data)
      onBadgeChange(data.filter(s => !s.replied).length)
    }
    setLoading(false)
  }

  const markReplied = async (id: string) => {
    await supabase.from('contact_submissions').update({ replied: true, replied_at: new Date().toISOString() }).eq('id', id)
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, replied: true, replied_at: new Date().toISOString() } : s))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, replied: true } : prev)
    onBadgeChange(submissions.filter(s => s.id !== id && !s.replied).length)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_submissions').delete().eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
    onBadgeChange(submissions.filter(s => s.id !== id && !s.replied).length)
  }

  const filtered = submissions.filter(s => {
    if (filter === 'unread'  && s.replied)  return false
    if (filter === 'replied' && !s.replied) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.name?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q) && !s.subject?.toLowerCase().includes(q)) return false
    }
    return true
  })

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',   value: submissions.length,                    color: 'border-gray-200' },
          { label: 'Unread',  value: submissions.filter(s => !s.replied).length, color: 'border-red-300' },
          { label: 'Replied', value: submissions.filter(s => s.replied).length,  color: 'border-green-300' },
        ].map(s => (
          <div key={s.label} className={`border-2 ${s.color} bg-white rounded-lg p-5`}>
            <div className="text-3xl font-bold text-dark mb-1">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 py-2 text-sm w-full" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded overflow-hidden border-2 border-dark-light">
          {(['all', 'unread', 'replied'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${filter === f ? 'bg-gold text-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <InboxIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{submissions.length === 0 ? 'No messages yet.' : 'No messages match this filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {filtered.map(sub => (
              <button key={sub.id} onClick={() => setSelected(sub)}
                className={`w-full text-left p-4 border-2 transition-all card-angled ${
                  selected?.id === sub.id ? 'border-gold bg-gold/5' : 'border-dark-light bg-white hover:border-gold/50'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!sub.replied && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />}
                      <span className="font-bold text-dark text-sm truncate">{sub.name}</span>
                      {sub.replied && <span className="flex-shrink-0 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">REPLIED</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{sub.subject}</p>
                    <p className="text-xs text-gray-400 truncate">{sub.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                    {new Date(sub.created_at).toLocaleDateString('en-ZA')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="card-angled border-2 border-dark-light bg-white p-6 h-fit sticky top-24">
              <div className="flex items-start justify-between mb-5 gap-3">
                <div>
                  <h3 className="text-lg font-display text-dark mb-0.5">{selected.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{selected.email}</span>
                    {selected.phone && <span>{selected.phone}</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-dark p-1"><X className="w-4 h-4" /></button>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Subject</div>
                <p className="text-sm font-semibold text-dark">{selected.subject}</p>
              </div>

              <div className="mb-5">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Message</div>
                <div className="bg-gray-50 border border-gray-100 rounded p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-5">
                Received {new Date(selected.created_at).toLocaleString('en-ZA')}
                {selected.replied && selected.replied_at && (
                  <span> · Replied {new Date(selected.replied_at).toLocaleString('en-ZA')}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${selected.phone?.replace(/\D/g, '').replace(/^0/, '27')}?text=${encodeURIComponent(`Hi ${selected.name}, thanks for contacting IC Cars regarding "${selected.subject}". `)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 btn-filled btn-filled-gold text-sm py-2 ${!selected.phone ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <Phone className="w-4 h-4" /> Reply on WhatsApp
                </a>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(`Hi ${selected.name},\n\n`)}`}
                  className="flex items-center gap-2 btn-hollow btn-hollow-gold text-sm py-2"
                >
                  <Mail className="w-4 h-4" /> Open in Email
                </a>
                {!selected.replied && (
                  <button onClick={() => markReplied(selected.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Mark Replied
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-12 text-gray-400 text-sm">
              Select a message to view
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE TAB
// ═══════════════════════════════════════════════════════════════════════════════
function FinanceTab() {
  const [apps, setApps]           = useState<FinanceApp[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<FinanceApp | null>(null)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [filterPA, setFilterPA]   = useState('all')

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    const { data, error } = await supabase.from('finance_applications').select('*').order('created_at', { ascending: false })
    if (!error && data) setApps(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('finance_applications').update({ status }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  const saveNotes = async (id: string, admin_notes: string) => {
    const { error } = await supabase.from('finance_applications').update({ admin_notes }).eq('id', id)
    if (!error) {
      setApps(prev => prev.map(a => a.id === id ? { ...a, admin_notes } : a))
      setSelected(prev => prev?.id === id ? { ...prev, admin_notes } : prev)
    } else alert('Failed to save notes: ' + error.message)
  }

  const filtered = apps.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterPA !== 'all' && a.pre_approval_status !== filterPA) return false
    if (search) {
      const s = search.toLowerCase()
      if (!a.full_name?.toLowerCase().includes(s) && !a.email?.toLowerCase().includes(s) && !a.phone?.includes(s)) return false
    }
    return true
  })

  const stats = {
    total:       apps.length,
    new:         apps.filter(a => a.status === 'new').length,
    preApproved: apps.filter(a => a.pre_approval_status === 'strong').length,
    inReview:    apps.filter(a => a.status === 'in_review').length,
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total,       color: 'border-gray-200' },
          { label: 'New / Unread',        value: stats.new,         color: 'border-blue-300' },
          { label: 'Strong Profiles',     value: stats.preApproved, color: 'border-green-300' },
          { label: 'In Review',           value: stats.inReview,    color: 'border-amber-300' },
        ].map(s => (
          <div key={s.label} className={`border-2 ${s.color} bg-white rounded-lg p-5`}>
            <div className="text-3xl font-bold text-dark mb-1">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9 py-2 text-sm w-full" placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="input-field py-2 pr-8 text-sm appearance-none" value={filterStatus} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="input-field py-2 pr-8 text-sm appearance-none" value={filterPA} onChange={e => setFilterPA(e.target.value)}>
            <option value="all">All Pre-Approvals</option>
            {Object.entries(PA_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {apps.length === 0 ? 'No finance applications yet.' : 'No applications match these filters.'}
        </div>
      ) : (
        <div className="card-angled border-2 border-dark-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Applicant', 'Vehicle / Loan', 'Pre-Approval', 'Affordability', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(app => {
                  const pa = PA_STATUS[app.pre_approval_status] || PA_STATUS.pending
                  const st = APP_STATUS[app.status] || APP_STATUS.new
                  const PaI = pa.Icon; const StI = st.Icon
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-dark text-sm">{app.full_name}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                        <div className="text-xs text-gray-400">{app.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-gray-500 mb-0.5">{app.vehicle_details || 'No specific vehicle'}</div>
                        <div className="font-semibold text-dark text-sm">R {(app.loan_amount_requested || 0).toLocaleString('en-ZA')}</div>
                        <div className="text-xs text-gray-400">{app.preferred_term_months}mo · dep R {(app.deposit_amount || 0).toLocaleString('en-ZA')}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-sm ${pa.bg} ${pa.text}`}>
                          <PaI className="w-3 h-3" />{pa.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {app.max_loan_estimate && app.loan_amount_requested ? (
                          app.loan_amount_requested <= app.max_loan_estimate ? (
                            <span className="flex items-center gap-1 text-green-700 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" />Affordable</span>
                          ) : (
                            <div className="text-xs">
                              <span className="flex items-center gap-1 text-red-600 font-semibold"><AlertCircle className="w-3.5 h-3.5" />Over budget</span>
                              <span className="text-gray-400 mt-0.5 block">Max ~R {Math.round(app.max_loan_estimate).toLocaleString('en-ZA')}</span>
                            </div>
                          )
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-sm ${st.bg} ${st.text}`}>
                          <StI className="w-3 h-3" />{st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString('en-ZA')}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelected(app)} className="p-2 text-gold hover:bg-gold/10 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <FinanceDetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
          onSaveNotes={saveNotes}
        />
      )}
    </div>
  )
}

// ─── WhatsApp Confirm Modal ───────────────────────────────────────────────────
function WhatsAppConfirmModal({ app, newStatus, onConfirm, onSkip, onCancel }: {
  app: FinanceApp; newStatus: string
  onConfirm: (msg: string) => void; onSkip: () => void; onCancel: () => void
}) {
  const st = APP_STATUS[newStatus]; const StI = st.Icon
  const [message, setMessage] = useState(() => buildWhatsAppMessage(newStatus, app))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-gold max-w-lg w-full card-angled">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-display text-dark mb-1">Send WhatsApp Update?</h3>
            <p className="text-sm text-gray-500">
              Status → <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 text-xs rounded ${st.bg} ${st.text}`}><StI className="w-3 h-3" />{st.label}</span>
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-dark p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-1">WhatsApp message to <strong>{app.full_name}</strong></p>
          <p className="text-xs text-gray-400 mb-3">{app.whatsapp || app.phone}</p>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Message (editable)</label>
          <textarea
            className="input-field resize-none text-sm w-full" rows={6}
            value={message} onChange={e => setMessage(e.target.value)}
          />
          <div className="flex gap-3 mt-5">
            <button onClick={() => onConfirm(message)}
              className="flex-1 btn-filled btn-filled-gold flex items-center justify-center gap-2 text-sm">
              <Phone className="w-4 h-4" /> Open WhatsApp + Update
            </button>
            <button onClick={onSkip} className="btn-hollow btn-hollow-gold text-sm px-4">Update Only</button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">"Update Only" saves the status without opening WhatsApp.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Finance Detail Modal ─────────────────────────────────────────────────────
function FinanceDetailModal({ app, onClose, onStatusChange, onSaveNotes }: {
  app: FinanceApp; onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onSaveNotes: (id: string, notes: string) => void
}) {
  const [notes, setNotes]                 = useState(app.admin_notes || '')
  const [saving, setSaving]               = useState(false)
  const [currentStatus, setCurrentStatus] = useState(app.status)
  const [docsComplete, setDocsComplete]   = useState(app.documents_complete || false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const pa = PA_STATUS[app.pre_approval_status] || PA_STATUS.pending; const PaI = pa.Icon

  const handleStatusClick = (newStatus: string) => {
    if (newStatus === currentStatus) return
    WA_TRIGGER_STATUSES.has(newStatus) ? setPendingStatus(newStatus) : applyStatusChange(newStatus, false, '')
  }

  const applyStatusChange = (status: string, sendWA: boolean, message: string) => {
    setCurrentStatus(status)
    onStatusChange(app.id, status)
    setPendingStatus(null)
    if (sendWA) {
      const phone = app.whatsapp || app.phone
      if (phone) openWhatsApp(phone, message)
    }
  }

  const handleSaveNotes = async () => {
    setSaving(true); await onSaveNotes(app.id, notes); setSaving(false)
  }

  return (
    <>
      {pendingStatus && (
        <WhatsAppConfirmModal
          app={app} newStatus={pendingStatus}
          onConfirm={msg => applyStatusChange(pendingStatus, true, msg)}
          onSkip={() => applyStatusChange(pendingStatus, false, '')}
          onCancel={() => setPendingStatus(null)}
        />
      )}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-gold max-w-4xl w-full max-h-[92vh] flex flex-col card-angled">
          <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0 gap-4">
            <div>
              <h2 className="text-2xl font-display text-dark">{app.full_name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{app.email}</span>
                <span className="text-sm text-gray-500">{app.phone}</span>
                {app.whatsapp && (
                  <a href={`https://wa.me/${app.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 hover:bg-green-200 transition-colors">WhatsApp ↗</a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${pa.bg} ${pa.text}`}><PaI className="w-3.5 h-3.5" />{pa.label}</span>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Pre-approval banner */}
            <div className={`rounded-lg p-5 border ${pa.bg}`}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                <h3 className={`font-bold text-base ${pa.text}`}>Pre-Approval Assessment</h3>
                {app.max_loan_estimate && app.loan_amount_requested ? (
                  app.loan_amount_requested <= app.max_loan_estimate
                    ? <span className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm"><CheckCircle className="w-3.5 h-3.5" />Within affordable range</span>
                    : <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm"><AlertCircle className="w-3.5 h-3.5" />Vehicle too expensive</span>
                ) : null}
              </div>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {app.pre_approval_status === 'strong'   && 'Profile looks healthy. Proceed to document collection and bank submission.'}
                {app.pre_approval_status === 'review'   && 'Needs consultant review. Check income vs loan amount.'}
                {app.pre_approval_status === 'manual'   && 'Requires manual assessment. Contact applicant to discuss alternatives.'}
                {app.pre_approval_status === 'declined' && 'Hard block detected. Contact applicant to explain and explore options.'}
                {(!app.pre_approval_status || app.pre_approval_status === 'pending') && 'Assessment pending.'}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{app.pre_approval_notes || '—'}</p>
              {(app.estimated_monthly_payment || app.max_loan_estimate) ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Est. Monthly', val: `R ${(app.estimated_monthly_payment || 0).toLocaleString('en-ZA')}`,  color: 'text-gold' },
                    { label: 'Stress Test',  val: `R ${(app.estimated_monthly_stressed || 0).toLocaleString('en-ZA')}`, color: 'text-amber-600' },
                    { label: 'Max Loan',     val: `R ${(app.max_loan_estimate || 0).toLocaleString('en-ZA')}`,          color: 'text-gold' },
                    { label: 'DTI Ratio',    val: `${((app.dti_ratio || 0) * 100).toFixed(1)}%`,
                      color: (app.dti_ratio || 0) > 0.4 ? 'text-red-600' : (app.dti_ratio || 0) > 0.3 ? 'text-amber-600' : 'text-green-600' },
                  ].map(m => (
                    <div key={m.label} className="bg-white rounded p-3 text-center border border-gray-100">
                      <div className="text-xs text-gray-500 mb-0.5">{m.label}</div>
                      <div className={`text-base font-bold ${m.color}`}>{m.val}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoSection title="Personal & Contact" rows={[
                ['Email', app.email], ['Phone', app.phone], ['WhatsApp', app.whatsapp || '—'],
                ['Employment', app.employment_status],
                ['Employer', app.employer_name || (app.business_name ? `${app.business_name} (self-employed)` : '—')],
              ]} />
              <InfoSection title="Loan Request" rows={[
                ['Vehicle',       app.vehicle_details || 'Not specified'],
                ['Vehicle Price', `R ${(app.vehicle_price || 0).toLocaleString('en-ZA')}`],
                ['Deposit',       `R ${(app.deposit_amount || 0).toLocaleString('en-ZA')}`],
                ['Loan Amount',   `R ${(app.loan_amount_requested || 0).toLocaleString('en-ZA')}`],
                ['Term',          `${app.preferred_term_months} months`],
              ]} />
              <InfoSection title="Income" rows={[
                ['Gross Monthly', `R ${(app.gross_monthly_income || 0).toLocaleString('en-ZA')}`],
                ['Net Monthly',   `R ${(app.net_monthly_income  || 0).toLocaleString('en-ZA')}`],
              ]} />
              <div>
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Credit Flags</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Previously Blacklisted', val: app.decl_has_been_blacklisted },
                    { label: 'Judgements / Adverse',   val: app.decl_has_judgements },
                    { label: 'Under Debt Review',      val: app.decl_under_debt_review },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{f.label}</span>
                      {f.val
                        ? <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-sm"><AlertCircle className="w-3 h-3" />YES</span>
                        : <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-sm">No</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status changer */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">Update Status</h4>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />Green border = opens WhatsApp</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(APP_STATUS).map(([k, v]) => {
                  const Ic = v.Icon; const active = currentStatus === k; const wa = WA_TRIGGER_STATUSES.has(k)
                  return (
                    <button key={k} onClick={() => handleStatusClick(k)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-2 transition-all rounded-sm ${
                        active ? 'bg-gold text-black border-gold'
                        : wa    ? 'border-green-400 text-gray-600 hover:border-green-600 hover:text-dark bg-white'
                        :         'border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                      }`}>
                      <Ic className="w-3.5 h-3.5" />{v.label}
                      {wa && !active && <Phone className="w-2.5 h-2.5 text-green-500 ml-0.5" />}
                      {active && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Documents checklist + downloads */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-dark uppercase tracking-wide">Documents</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={docsComplete}
                    onChange={async e => {
                      setDocsComplete(e.target.checked)
                      await supabase.from('finance_applications').update({ documents_complete: e.target.checked }).eq('id', app.id)
                    }} className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold text-dark">Mark All Complete</span>
                </label>
              </div>

              <div className="space-y-2">
                {/* SA ID */}
                <DocRow label="SA ID" url={app.doc_id_front} />

                {/* Proof of Residence — can be multiple */}
                {(app.doc_proof_of_residence && app.doc_proof_of_residence.length > 0)
                  ? app.doc_proof_of_residence.map((url, i) => (
                      <DocRow key={i} label={`Proof of Residence${app.doc_proof_of_residence!.length > 1 ? ` (${i + 1})` : ''}`} url={url} />
                    ))
                  : <DocRow label="Proof of Residence" url={null} />
                }

                {/* Payslip */}
                <DocRow label="Payslip" url={app.doc_payslip_month1} />

                {/* Bank statements */}
                <DocRow label="Bank Statement (Month 1)" url={app.doc_bank_statement_month1} />
                <DocRow label="Bank Statement (Month 2)" url={app.doc_bank_statement_month2} />
                <DocRow label="Bank Statement (Month 3)" url={app.doc_bank_statement_month3} />
              </div>

              {app.submitted_to_bank_at && (
                <p className="text-xs text-gray-400 mt-3">
                  Submitted: {new Date(app.submitted_to_bank_at).toLocaleString('en-ZA')}
                  {app.bank_reference && ` · Ref: ${app.bank_reference}`}
                </p>
              )}
            </div>

            {/* Admin notes */}
            <div>
              <h4 className="text-sm font-bold text-dark uppercase tracking-wide mb-1">Admin Notes</h4>
              <p className="text-xs text-gray-400 mb-2">Internal only — never shown to the customer.</p>
              <textarea rows={4} className="input-field resize-none text-sm w-full" value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Internal notes about this application..." />
              <button onClick={handleSaveNotes} disabled={saving}
                className="btn-filled btn-filled-gold mt-2 text-sm py-2 flex items-center gap-2 disabled:opacity-50">
                {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : <><Check className="w-3.5 h-3.5" />Save Notes</>}
              </button>
            </div>

            {/* Contact shortcuts */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              <a href={`tel:${app.phone}`} className="btn-hollow btn-hollow-gold text-sm flex items-center gap-2 py-2"><Phone className="w-4 h-4" />Call</a>
              <a href={`mailto:${app.email}?subject=Your Finance Application – IC Cars`} className="btn-hollow btn-hollow-gold text-sm flex items-center gap-2 py-2"><Mail className="w-4 h-4" />Email</a>
              <a href={`https://wa.me/${(app.whatsapp || app.phone).replace(/\D/g, '').replace(/^0/, '27')}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-hollow btn-hollow-gold text-sm flex items-center gap-2 py-2"><Phone className="w-4 h-4" />WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function VehiclesTab({ userRole, userId }: { userRole: string | null; userId: string }) {
  const [vehicles, setVehicles]      = useState<Vehicle[]>([])
  const [loading, setLoading]        = useState(true)
  const [showModal, setShowModal]    = useState(false)
  const [editingVehicle, setEditing] = useState<any>(null)

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (!error && data) setVehicles(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    fetchVehicles()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-dark">Manage Vehicles</h2>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-filled btn-filled-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? <EmptyState message="No vehicles yet. Add your first listing!" /> : (
        <div className="card-angled border-2 border-dark-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Vehicle', 'Year', 'Price', 'Status', 'Images', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark">{v.make} {v.model}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{v.year}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">R {new Intl.NumberFormat('en-ZA').format(v.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-sm ${
                        v.status === 'available' ? 'bg-green-100 text-green-800' :
                        v.status === 'sold' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 items-center">
                        {v.images?.length > 0 ? (
                          <>
                            <img src={v.images[0]} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                            {v.images.length > 1 && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">+{v.images.length - 1}</span>}
                          </>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(v); setShowModal(true) }} className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <VehicleModal vehicle={editingVehicle} userId={userId}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { fetchVehicles(); setShowModal(false); setEditing(null) }} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers]         = useState<UserRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('users').delete().eq('id', id)
    fetchUsers()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-dark">Manage Users</h2>
        <button onClick={() => setShowModal(true)} className="btn-filled btn-filled-gold flex items-center gap-2"><Plus className="w-4 h-4" />Add User</button>
      </div>
      {users.length === 0 ? <EmptyState message="No users found." /> : (
        <div className="card-angled border-2 border-dark-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Name', 'Email', 'Role', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark">{u.full_name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-sm ${u.role === 'admin' ? 'bg-gold text-black' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showModal && <UserModal onClose={() => setShowModal(false)} onSuccess={() => { fetchUsers(); setShowModal(false) }} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO TAB
// ═══════════════════════════════════════════════════════════════════════════════
function HeroTab() {
  const [slides, setSlides]        = useState<HeroSlide[]>([])
  const [loading, setLoading]      = useState(true)
  const [showModal, setShowModal]  = useState(false)
  const [editingSlide, setEditing] = useState<any>(null)

  useEffect(() => { fetchSlides() }, [])

  const fetchSlides = async () => {
    const { data, error } = await supabase.from('hero_carousel').select('*').order('order_index', { ascending: true })
    if (!error && data) setSlides(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return
    await supabase.from('hero_carousel').delete().eq('id', id)
    fetchSlides()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_carousel').update({ active: !current }).eq('id', id)
    fetchSlides()
  }

  if (loading) return <TabLoader />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display text-dark">Manage Hero Carousel</h2>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-filled btn-filled-gold flex items-center gap-2"><Plus className="w-4 h-4" />Add Slide</button>
      </div>
      {slides.length === 0 ? <EmptyState message="No slides yet. Add your first hero slide!" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map(slide => (
            <div key={slide.id} className="card-angled border-2 border-dark-light overflow-hidden">
              <div className="relative h-44 bg-gray-100">
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                {slide.active && <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-0.5 text-xs font-bold">ACTIVE</div>}
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-0.5 text-xs font-bold">#{slide.order_index}</div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-display text-dark mb-1">{slide.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{slide.subtitle}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => toggleActive(slide.id, slide.active)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${slide.active ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gold text-black hover:bg-gold/80'}`}>
                    {slide.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => { setEditing(slide); setShowModal(true) }} className="p-1.5 text-gold hover:bg-gold/10 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(slide.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <HeroModal slide={editingSlide}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSuccess={() => { fetchSlides(); setShowModal(false); setEditing(null) }} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function VehicleModal({ vehicle, userId, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    make: vehicle?.make||'', model: vehicle?.model||'', year: vehicle?.year||new Date().getFullYear(),
    price: vehicle?.price||0, mileage: vehicle?.mileage||0, description: vehicle?.description||'',
    transmission: vehicle?.transmission||'Automatic', fuel_type: vehicle?.fuel_type||'Petrol',
    drivetrain: vehicle?.drivetrain||'4x2', color: vehicle?.color||'', interior_color: vehicle?.interior_color||'',
    condition: vehicle?.condition||'Used', body_type: vehicle?.body_type||'', engine_size: vehicle?.engine_size||'',
    doors: vehicle?.doors||4, seats: vehicle?.seats||5, cylinders: vehicle?.cylinders||4, airbags: vehicle?.airbags||0,
    vin: vehicle?.vin||'', license_plate: vehicle?.license_plate||'', registration_date: vehicle?.registration_date||'',
    warranty: vehicle?.warranty||false, warranty_expiry: vehicle?.warranty_expiry||'',
    service_history: vehicle?.service_history||false, finance_available: vehicle?.finance_available||false,
    estimated_monthly_payment: vehicle?.estimated_monthly_payment||0,
    status: vehicle?.status||'available', owners_count: vehicle?.owners_count||0,
  })
  const [features, setFeatures] = useState({
    abs: vehicle?.abs||false, traction_control: vehicle?.traction_control||false,
    stability_control: vehicle?.stability_control||false, hill_assist: vehicle?.hill_assist||false,
    lane_assist: vehicle?.lane_assist||false, blind_spot_monitor: vehicle?.blind_spot_monitor||false,
    rear_cross_traffic: vehicle?.rear_cross_traffic||false, adaptive_cruise: vehicle?.adaptive_cruise||false,
    auto_emergency_brake: vehicle?.auto_emergency_brake||false, alarm_system: vehicle?.alarm_system||false,
    immobilizer: vehicle?.immobilizer||false, central_locking: vehicle?.central_locking||false,
    isofix: vehicle?.isofix||false, aircon: vehicle?.aircon||false, climate_control: vehicle?.climate_control||false,
    rear_ac: vehicle?.rear_ac||false, cruise_control: vehicle?.cruise_control||false,
    power_steering: vehicle?.power_steering||false, electric_seats: vehicle?.electric_seats||false,
    memory_seats: vehicle?.memory_seats||false, heated_seats: vehicle?.heated_seats||false,
    leather_seats: vehicle?.leather_seats||false, bluetooth: vehicle?.bluetooth||false,
    usb_port: vehicle?.usb_port||false, aux_input: vehicle?.aux_input||false,
    touchscreen: vehicle?.touchscreen||false, navigation: vehicle?.navigation||false,
    multimedia_system: vehicle?.multimedia_system||false, apple_carplay: vehicle?.apple_carplay||false,
    android_auto: vehicle?.android_auto||false, reverse_camera: vehicle?.reverse_camera||false,
    parking_sensors: vehicle?.parking_sensors||false, electric_windows: vehicle?.electric_windows||false,
    electric_mirrors: vehicle?.electric_mirrors||false, keyless_entry: vehicle?.keyless_entry||false,
    keyless_start: vehicle?.keyless_start||false, sunroof: vehicle?.sunroof||false,
    panoramic_roof: vehicle?.panoramic_roof||false, paddle_shifters: vehicle?.paddle_shifters||false,
    sport_mode: vehicle?.sport_mode||false, eco_mode: vehicle?.eco_mode||false,
    alloy_wheels: vehicle?.alloy_wheels||false, fog_lights: vehicle?.fog_lights||false,
    xenon_lights: vehicle?.xenon_lights||false, led_lights: vehicle?.led_lights||false,
    daytime_running_lights: vehicle?.daytime_running_lights||false, tow_bar: vehicle?.tow_bar||false,
    roof_rails: vehicle?.roof_rails||false, warranty_remaining: vehicle?.warranty_remaining||false,
  })
  const [uploadedImages, setUploadedImages] = useState<string[]>(vehicle?.images||[])
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fd = formData
  const sf = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try { const urls = await uploadMultipleToCloudinary(e.target.files); setUploadedImages(p => [...p, ...urls]) }
    catch { alert('Image upload failed.') }
    setUploading(false)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!uploadedImages.length) { alert('Please upload at least one image'); return }
    setSubmitting(true)
    const data = {
      ...formData, ...features, images: uploadedImages,
      price: parseFloat(String(fd.price))||0, mileage: parseFloat(String(fd.mileage))||0,
      year: parseInt(String(fd.year))||new Date().getFullYear(),
      doors: parseInt(String(fd.doors))||4, seats: parseInt(String(fd.seats))||5,
      cylinders: parseInt(String(fd.cylinders))||4, airbags: parseInt(String(fd.airbags))||0,
      owners_count: parseInt(String(fd.owners_count))||0,
      estimated_monthly_payment: fd.estimated_monthly_payment ? parseFloat(String(fd.estimated_monthly_payment)) : null,
      engine_size: fd.engine_size||null, warranty_expiry: fd.warranty_expiry||null,
      registration_date: fd.registration_date||null, vin: fd.vin||null,
      license_plate: fd.license_plate||null, interior_color: fd.interior_color||null, created_by: userId,
    }
    const { error } = vehicle
      ? await supabase.from('vehicles').update(data).eq('id', vehicle.id)
      : await supabase.from('vehicles').insert([data])
    if (!error) onSuccess()
    else { alert('Error: ' + error.message); console.error(error) }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-angled bg-white border-2 border-gold max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-display text-dark">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-dark"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-dark mb-4">Vehicle Images *</h3>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded border-2 border-gray-200" />
                      <button type="button" onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && <div className="absolute bottom-1 left-1 bg-gold text-black px-1 text-xs font-bold">MAIN</div>}
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" disabled={uploading} />
                <label htmlFor="img-upload" className="cursor-pointer">
                  {uploading
                    ? <div className="flex flex-col items-center"><Loader2 className="w-10 h-10 text-gold animate-spin mb-2" /><span className="text-sm text-gray-500">Uploading...</span></div>
                    : <><Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" /><div className="text-sm font-medium text-gray-600">Click to upload images</div><div className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · First image = main photo</div></>}
                </label>
              </div>
            </div>

            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Make *"><select value={fd.make} onChange={e => sf('make', e.target.value)} required className="input-field"><option value="">Select</option>{MAKES.map(m => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Model *"><input value={fd.model} onChange={e => sf('model', e.target.value)} required className="input-field" placeholder="Hilux" /></Field>
                <Field label="Year *"><input type="number" value={fd.year} onChange={e => sf('year', e.target.value)} required className="input-field" min="1900" max={new Date().getFullYear()+1} /></Field>
                <Field label="Body Type *"><select value={fd.body_type} onChange={e => sf('body_type', e.target.value)} required className="input-field"><option value="">Select</option>{BODY_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Condition"><select value={fd.condition} onChange={e => sf('condition', e.target.value)} className="input-field"><option>New</option><option>Used</option><option>Demo</option></select></Field>
                <Field label="Status"><select value={fd.status} onChange={e => sf('status', e.target.value)} className="input-field"><option value="available">Available</option><option value="sold">Sold</option><option value="reserved">Reserved</option></select></Field>
              </div>
            </FormSection>

            <FormSection title="Pricing & Mileage">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Price (ZAR) *"><input type="number" value={fd.price} onChange={e => sf('price', e.target.value)} required className="input-field" /></Field>
                <Field label="Mileage (km) *"><input type="number" value={fd.mileage} onChange={e => sf('mileage', e.target.value)} required className="input-field" /></Field>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={fd.finance_available} onChange={e => sf('finance_available', e.target.checked)} className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-dark">Finance Available</span></label>
                </div>
                {fd.finance_available && <Field label="Est. Monthly Payment (ZAR)"><input type="number" value={fd.estimated_monthly_payment} onChange={e => sf('estimated_monthly_payment', e.target.value)} className="input-field" /></Field>}
              </div>
            </FormSection>

            <FormSection title="Technical Specifications">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Transmission"><select value={fd.transmission} onChange={e => sf('transmission', e.target.value)} className="input-field">{TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Fuel Type"><select value={fd.fuel_type} onChange={e => sf('fuel_type', e.target.value)} className="input-field">{FUEL_TYPES.map(f => <option key={f}>{f}</option>)}</select></Field>
                <Field label="Drivetrain"><select value={fd.drivetrain} onChange={e => sf('drivetrain', e.target.value)} className="input-field"><option value="4x2">4x2 (2WD)</option><option value="4x4">4x4 (4WD)</option><option value="AWD">AWD</option></select></Field>
                <Field label="Engine Size (L)"><input value={fd.engine_size} onChange={e => sf('engine_size', e.target.value)} className="input-field" placeholder="2.8" /></Field>
                <Field label="Cylinders"><input type="number" value={fd.cylinders} onChange={e => sf('cylinders', e.target.value)} className="input-field" min="2" max="12" /></Field>
                <Field label="Doors"><input type="number" value={fd.doors} onChange={e => sf('doors', e.target.value)} required className="input-field" min="2" max="5" /></Field>
                <Field label="Seats"><input type="number" value={fd.seats} onChange={e => sf('seats', e.target.value)} required className="input-field" min="2" max="9" /></Field>
                <Field label="Airbags"><input type="number" value={fd.airbags} onChange={e => sf('airbags', e.target.value)} className="input-field" min="0" max="12" /></Field>
              </div>
            </FormSection>

            <FormSection title="Colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Exterior Color *"><select value={fd.color} onChange={e => sf('color', e.target.value)} required className="input-field"><option value="">Select</option>{COLORS.map(c => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Interior Color"><select value={fd.interior_color} onChange={e => sf('interior_color', e.target.value)} className="input-field"><option value="">Select</option>{COLORS.map(c => <option key={c}>{c}</option>)}</select></Field>
              </div>
            </FormSection>

            <FormSection title="Vehicle Identification">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="VIN Number"><input value={fd.vin} onChange={e => sf('vin', e.target.value)} className="input-field" placeholder="1HGBH41JXMN109186" /></Field>
                <Field label="License Plate"><input value={fd.license_plate} onChange={e => sf('license_plate', e.target.value)} className="input-field" placeholder="ABC 123 GP" /></Field>
                <Field label="Registration Date"><input type="date" value={fd.registration_date} onChange={e => sf('registration_date', e.target.value)} className="input-field" /></Field>
              </div>
            </FormSection>

            <FormSection title="Warranty & Service">
              <div className="space-y-3">
                <Field label="Previous Owners"><input type="number" value={fd.owners_count} onChange={e => sf('owners_count', e.target.value)} className="input-field w-32" min="0" max="10" /></Field>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={fd.warranty} onChange={e => sf('warranty', e.target.checked)} className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-dark">Warranty Available</span></label>
                {fd.warranty && <Field label="Warranty Expiry"><input type="date" value={fd.warranty_expiry} onChange={e => sf('warranty_expiry', e.target.value)} className="input-field" /></Field>}
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={features.warranty_remaining} onChange={e => setFeatures(p => ({ ...p, warranty_remaining: e.target.checked }))} className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-dark">Factory Warranty Remaining</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={fd.service_history} onChange={e => sf('service_history', e.target.checked)} className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-dark">Full Service History</span></label>
              </div>
            </FormSection>

            <FormSection title="Description">
              <textarea value={fd.description} onChange={e => sf('description', e.target.value)} required rows={5} className="input-field resize-none" placeholder="Detailed vehicle description..." />
            </FormSection>

            <FormSection title="Vehicle Features">
              <div className="space-y-5">
                {Object.entries(FEATURE_CATEGORIES).map(([catKey, cat]) => (
                  <div key={catKey} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-dark mb-3 flex items-center gap-2"><span className="w-2 h-2 bg-gold rounded-full" />{cat.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.features.map(f => (
                        <label key={f.key} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors">
                          <input type="checkbox" checked={features[f.key as keyof typeof features] as boolean}
                            onChange={e => setFeatures(p => ({ ...p, [f.key]: e.target.checked }))} className="w-4 h-4 text-gold" />
                          <span className="text-xs text-dark">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>
          </form>
        </div>
        <div className="p-5 border-t border-gray-100 flex-shrink-0 bg-white flex items-center gap-3">
          <button onClick={handleSubmit} disabled={submitting||uploading} className="btn-filled btn-filled-gold disabled:opacity-50 flex items-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />{vehicle ? 'Update Vehicle' : 'Add Vehicle'}</>}
          </button>
          <button onClick={onClose} disabled={submitting||uploading} className="btn-hollow btn-hollow-gold disabled:opacity-50">Cancel</button>
          <span className="text-xs text-gray-400 ml-2">* Required · Images uploaded to Cloudinary</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function UserModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'agent' as 'admin' | 'agent' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password })
    if (authError) { alert(authError.message); setSubmitting(false); return }
    if (authData.user) {
      const { error } = await supabase.from('users').insert([{ id: authData.user.id, email: formData.email, full_name: formData.full_name, role: formData.role }])
      if (!error) onSuccess(); else alert(error.message)
    }
    setSubmitting(false)
  }

  return (
    <ModalShell title="Add User" onClose={onClose} maxW="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full Name *"><input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} required className="input-field" placeholder="John Doe" /></Field>
        <Field label="Email *"><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required className="input-field" placeholder="john@example.com" /></Field>
        <Field label="Password *"><input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required className="input-field" minLength={6} placeholder="••••••••" /></Field>
        <Field label="Role"><select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as any }))} className="input-field"><option value="agent">Agent</option><option value="admin">Admin</option></select></Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-filled btn-filled-gold disabled:opacity-50">{submitting ? 'Creating...' : 'Create User'}</button>
          <button type="button" onClick={onClose} className="btn-hollow btn-hollow-gold">Cancel</button>
        </div>
      </form>
    </ModalShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function HeroModal({ slide, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ title: slide?.title||'', subtitle: slide?.subtitle||'', image_url: slide?.image_url||'', order_index: slide?.order_index||0, active: slide?.active??true })
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try { const urls = await uploadMultipleToCloudinary(e.target.files); if (urls.length) setFormData(p => ({ ...p, image_url: urls[0] })) }
    catch { alert('Upload failed') }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image_url) { alert('Please upload an image'); return }
    setSubmitting(true)
    const { error } = slide
      ? await supabase.from('hero_carousel').update(formData).eq('id', slide.id)
      : await supabase.from('hero_carousel').insert([formData])
    if (!error) onSuccess(); else alert('Error: ' + error.message)
    setSubmitting(false)
  }

  return (
    <ModalShell title={slide ? 'Edit Slide' : 'Add Slide'} onClose={onClose} maxW="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-50 rounded-lg p-5">
          <div className="text-sm font-bold text-dark mb-3">Hero Image *</div>
          {formData.image_url ? (
            <div className="relative group">
              <img src={formData.image_url} alt="" className="w-full h-52 object-cover rounded-lg border-2 border-gray-200" />
              <button type="button" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gold transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="hero-upload" disabled={uploading} />
              <label htmlFor="hero-upload" className="cursor-pointer">
                {uploading ? <Loader2 className="w-10 h-10 mx-auto text-gold animate-spin" /> : <><Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" /><div className="text-sm text-gray-500">Click to upload · Recommended 1920×1080</div></>}
              </label>
            </div>
          )}
        </div>
        <Field label="Title *"><input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required className="input-field" placeholder="Welcome to IC Cars" /></Field>
        <Field label="Subtitle *"><textarea value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} required rows={2} className="input-field resize-none" /></Field>
        <Field label="Display Order"><input type="number" value={formData.order_index} onChange={e => setFormData(p => ({ ...p, order_index: parseInt(e.target.value)||0 }))} className="input-field w-28" min="0" /></Field>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={formData.active} onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-dark">Active (show on homepage)</span></label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting||uploading} className="btn-filled btn-filled-gold disabled:opacity-50 flex items-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Check className="w-4 h-4" />{slide ? 'Update' : 'Add Slide'}</>}
          </button>
          <button type="button" onClick={onClose} disabled={submitting||uploading} className="btn-hollow btn-hollow-gold disabled:opacity-50">Cancel</button>
        </div>
      </form>
    </ModalShell>
  )
}

// ─── Doc Row ─────────────────────────────────────────────────────────────────
function DocRow({ label, url }: { label: string; url: string | null | undefined }) {
  const present = !!url
  const ext = url ? url.split('?')[0].split('.').pop()?.toUpperCase() || 'FILE' : null

  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded border ${present ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        {present
          ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
        <span className={`text-xs font-medium ${present ? 'text-green-800' : 'text-gray-400'}`}>{label}</span>
      </div>
      {present && url ? (
        <div className="flex items-center gap-2">
          {ext && <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{ext}</span>}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1 text-xs font-bold text-gold hover:text-dark transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> View
          </a>
        </div>
      ) : (
        <span className="text-[10px] text-gray-300 font-medium">Not uploaded</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function ModalShell({ title, onClose, children, maxW = 'max-w-lg' }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`card-angled bg-white border-2 border-gold ${maxW} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display text-dark">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-dark"><X className="w-5 h-5" /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-bold text-dark mb-4 pb-2 border-b-2 border-gold">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function InfoSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-dark uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">{title}</h4>
      <div className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm py-0.5">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-dark text-right max-w-[55%] break-words">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabLoader() {
  return (
    <div className="text-center py-16">
      <div className="inline-block w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-16 text-gray-400">{message}</div>
}