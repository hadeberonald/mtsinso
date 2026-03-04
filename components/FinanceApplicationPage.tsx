'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadFinanceDoc } from '@/lib/cloudinary'
import {
  CheckCircle, AlertCircle, Clock, XCircle, ChevronRight,
  ChevronLeft, Shield, User, Briefcase, TrendingUp, Calculator,
  FileText, Upload, X, Loader2, Check, Phone, CreditCard,
  Home, Building2, Landmark, Info
} from 'lucide-react'

// ─── SA ID Validator & DOB extractor ──────────────────────────
function parseIdNumber(id: string): { valid: boolean; dob: string; age: number; gender: string } | null {
  if (!/^\d{13}$/.test(id)) return null
  const yr  = parseInt(id.slice(0, 2))
  const mo  = parseInt(id.slice(2, 4))
  const dy  = parseInt(id.slice(4, 6))
  if (mo < 1 || mo > 12 || dy < 1 || dy > 31) return null
  const fullYear = yr <= new Date().getFullYear() % 100 ? 2000 + yr : 1900 + yr
  const dob = `${fullYear}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}`
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  const gender = parseInt(id.slice(6, 10)) >= 5000 ? 'Male' : 'Female'
  // Luhn check
  let sum = 0
  for (let i = 0; i < 13; i++) {
    let d = parseInt(id[i])
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  if (sum % 10 !== 0) return null
  return { valid: true, dob, age, gender }
}

// ─── Improved Pre-Approval Engine ─────────────────────────────
function calculatePreApproval(data: any) {
  // Hard blocks
  if (data.decl_under_debt_review) return {
    status: 'declined',
    notes: 'Applicants under debt review cannot take on new credit per the National Credit Act.',
    estimatedMonthly: 0, stressedMonthly: 0, maxLoan: 0, disposable: 0, dti: 0,
  }
  if (data.decl_ever_sequestrated && !data.decl_sequestration_rehabilitated) return {
    status: 'declined',
    notes: 'Sequestration on record without rehabilitation. Manual review required.',
    estimatedMonthly: 0, stressedMonthly: 0, maxLoan: 0, disposable: 0, dti: 0,
  }
  if (data.employment_status === 'Unemployed') return {
    status: 'declined',
    notes: 'A verifiable income source is required to qualify for vehicle finance.',
    estimatedMonthly: 0, stressedMonthly: 0, maxLoan: 0, disposable: 0, dti: 0,
  }
  if (data.id_age && (data.id_age < 18 || data.id_age > 75)) return {
    status: 'manual',
    notes: 'Age-related eligibility requires manual lender assessment.',
    estimatedMonthly: 0, stressedMonthly: 0, maxLoan: 0, disposable: 0, dti: 0,
  }

  // Income
  const totalIncome = (data.net_monthly_income || 0) + (data.other_income_amount || 0)
  
  // Obligations (itemised)
  const totalObligations =
    (data.obligation_bond_rent || 0) +
    (data.obligation_vehicle_finance || 0) +
    (data.obligation_credit_cards || 0) +
    (data.obligation_store_accounts || 0) +
    (data.obligation_personal_loans || 0) +
    (data.obligation_maintenance || 0) +
    (data.obligation_other || 0)

  // NCR minimum living costs
  const ncr_minimum = 3500 + ((data.dependants || 0) * 1200)
  const livingCosts = Math.max(data.monthly_living_expenses || 0, ncr_minimum)

  const disposable = totalIncome - totalObligations - livingCosts

  // DTI ratio (existing debt / gross income)
  const dti = data.gross_monthly_income > 0
    ? totalObligations / data.gross_monthly_income
    : 1

  // Max instalment: lesser of 30% gross OR 75% disposable
  const maxByGross      = (data.gross_monthly_income || 0) * 0.30
  const maxByDisposable = disposable * 0.75
  const maxInstalment   = Math.min(maxByGross, Math.max(0, maxByDisposable))

  // Loan calc — standard rate: prime (11.75%) + 2.5% = 14.25%
  // Stress rate: prime + 5% = 16.75%
  const calcPMT = (principal: number, annualRate: number, months: number) => {
    if (principal <= 0 || months <= 0) return 0
    const r = annualRate / 12
    return (principal * r) / (1 - Math.pow(1 + r, -months))
  }
  const calcPrincipal = (pmt: number, annualRate: number, months: number) => {
    if (pmt <= 0) return 0
    const r = annualRate / 12
    return (pmt * (1 - Math.pow(1 + r, -months))) / r
  }

  const term = data.preferred_term_months || 72
  const loanRequested = data.loan_amount_requested || (data.vehicle_price - (data.deposit_amount || 0))
  const maxLoan       = calcPrincipal(maxInstalment, 0.1425, term)
  const estimatedMonthly = calcPMT(loanRequested, 0.1425, term)
  const stressedMonthly  = calcPMT(loanRequested, 0.1675, term)

  // Scoring
  let score = 100

  // Affordability
  if (disposable < 0)                           score -= 40
  else if (estimatedMonthly > maxInstalment)    score -= 30
  else if (estimatedMonthly > maxInstalment * 0.9) score -= 15

  // DTI
  if (dti > 0.50)       score -= 25
  else if (dti > 0.40)  score -= 15
  else if (dti > 0.30)  score -= 5

  // Credit history
  if (data.decl_has_judgements)        score -= 35
  else if (data.decl_has_been_blacklisted) score -= 25

  // Employment
  if (data.employment_status === 'Self-Employed')       score -= 8
  if (data.employment_type === 'Contract')              score -= 10
  if (data.employment_type === 'Part-time')             score -= 15
  const yearsEmp = (data.years_employed || 0) + ((data.months_employed || 0) / 12)
  if (yearsEmp < 0.5)  score -= 20
  else if (yearsEmp < 1) score -= 12
  else if (yearsEmp < 2) score -= 5

  // Deposit bonus
  if (data.vehicle_price > 0 && data.deposit_amount > 0) {
    const dep = data.deposit_amount / data.vehicle_price
    if (dep >= 0.20)      score += 10
    else if (dep >= 0.10) score += 5
  }

  score = Math.max(0, Math.min(100, score))

  let status: string
  if (score >= 70)       status = 'strong'
  else if (score >= 45)  status = 'review'
  else if (score >= 20)  status = 'manual'
  else                   status = 'declined'

  return { status, notes: '', estimatedMonthly, stressedMonthly, maxLoan, disposable, dti }
}

// ─── Document Upload Component ────────────────────────────────
function DocUpload({
  label, sublabel, accept = 'image/*,.pdf', multiple = false,
  value, onChange, required = false
}: {
  label: string; sublabel?: string; accept?: string
  multiple?: boolean; value: string | string[]; onChange: (v: string | string[]) => void
  required?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const urls = Array.isArray(value) ? value : (value ? [value] : [])

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(e.target.files)) {
        const url = await uploadFinanceDoc(file)
        uploaded.push(url)
      }
      if (multiple) {
        onChange([...urls, ...uploaded])
      } else {
        onChange(uploaded[0])
      }
    } catch {
      alert('Upload failed. Please try again.')
    }
    setUploading(false)
    e.target.value = ''
  }

  const remove = (i: number) => {
    if (multiple) {
      onChange(urls.filter((_, j) => j !== i))
    } else {
      onChange('')
    }
  }

  const id = `doc-${label.replace(/\s/g, '-').toLowerCase()}`

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-semibold text-dark">{label}</label>
        {required && <span className="text-xs text-red-500 font-bold">Required</span>}
        {urls.length > 0 && <Check className="w-3.5 h-3.5 text-green-500 ml-auto" />}
      </div>
      {sublabel && <p className="text-xs text-gray-400 mb-2">{sublabel}</p>}

      {/* Uploaded files */}
      {urls.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {urls.map((url, i) => {
            const isPdf = url.includes('.pdf') || url.includes('raw/upload')
            const name  = url.split('/').pop()?.split('?')[0] || `File ${i + 1}`
            return (
              <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 flex-1 truncate">{isPdf ? '📄 ' : '🖼️ '}{name}</span>
                <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload zone */}
      {(multiple || urls.length === 0) && (
        <div className={`border-2 border-dashed rounded-lg transition-colors ${uploading ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/50 bg-gray-50'}`}>
          <input type="file" id={id} accept={accept} multiple={multiple} onChange={handleFiles} className="hidden" disabled={uploading} />
          <label htmlFor={id} className="flex items-center gap-3 px-4 py-3 cursor-pointer">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-gold animate-spin flex-shrink-0" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : multiple ? 'Click to upload files' : 'Click to upload'}
            </span>
            <span className="ml-auto text-xs text-gray-300">PDF, JPG, PNG</span>
          </label>
        </div>
      )}
    </div>
  )
}

// ─── Step configuration ────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Personal',    Icon: User },
  { id: 2, title: 'Employment',  Icon: Briefcase },
  { id: 3, title: 'Finances',    Icon: TrendingUp },
  { id: 4, title: 'Loan',        Icon: Calculator },
  { id: 5, title: 'Declarations',Icon: Shield },
  { id: 6, title: 'Documents',   Icon: FileText },
  { id: 7, title: 'Confirm',     Icon: CheckCircle },
]

const SA_BANKS = ['ABSA', 'Capitec Bank', 'FNB', 'Nedbank', 'Standard Bank', 'African Bank', 'Discovery Bank', 'Investec', 'Tyme Bank', 'Other']
const SA_PROVINCES = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape']

// ─── Main Component ────────────────────────────────────────────
export default function FinanceApplicationPage({
  vehicleId, vehicleDetails, vehiclePrice
}: {
  vehicleId?: string; vehicleDetails?: string; vehiclePrice?: number
}) {
  const [step, setStep]       = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [idError, setIdError] = useState('')

  const [form, setForm] = useState<any>({
    // Personal
    full_name: '', id_number: '', date_of_birth: '', id_age: null,
    nationality: 'South African', marital_status: '', dependants: 0,
    // Contact
    email: '', phone: '', whatsapp: '', alt_phone: '',
    // Residential
    residential_address: '', residential_suburb: '', residential_city: '',
    residential_province: '', residential_postal_code: '',
    residential_status: '', years_at_address: 0, months_at_address: 0,
    // Employment
    employment_status: '', employment_type: '',
    employer_name: '', employer_address: '', employer_phone: '',
    job_title: '', years_employed: 0, months_employed: 0,
    hr_contact_name: '', hr_contact_phone: '',
    business_name: '', business_reg_number: '', business_age_years: 0,
    business_industry: '', business_address: '',
    pension_fund: '', pension_fund_phone: '',
    // Income
    gross_monthly_income: 0, net_monthly_income: 0,
    other_income_amount: 0, other_income_source: '',
    // Obligations
    obligation_bond_rent: 0, obligation_vehicle_finance: 0,
    obligation_credit_cards: 0, obligation_store_accounts: 0,
    obligation_personal_loans: 0, obligation_maintenance: 0,
    obligation_other: 0, obligation_other_desc: '',
    monthly_living_expenses: 0,
    // Loan
    vehicle_price: vehiclePrice || 0,
    deposit_amount: 0, loan_amount_requested: vehiclePrice || 0,
    preferred_term_months: 72,
    trade_in_vehicle: false, trade_in_details: '', trade_in_estimated_value: 0,
    bank_name: '', account_type: '', years_with_bank: 0,
    salary_paid_into_this_account: true,
    // Declarations
    decl_has_existing_vehicle_finance: false, decl_has_home_loan: false,
    decl_has_credit_cards: false, decl_has_store_accounts: false,
    decl_has_personal_loans: false, decl_has_been_blacklisted: false,
    decl_has_judgements: false, decl_under_debt_review: false,
    decl_ever_sequestrated: false, decl_ever_insolvent: false,
    // Documents
    doc_id_front: '', doc_id_back: '',
    doc_proof_of_residence: [],
    doc_payslip_month1: '', doc_payslip_month2: '', doc_payslip_month3: '',
    doc_bank_statement_month1: '', doc_bank_statement_month2: '', doc_bank_statement_month3: '',
    doc_bank_statement_month4: '', doc_bank_statement_month5: '', doc_bank_statement_month6: '',
    doc_financial_statements: [], doc_existing_finance: [], doc_other: [],
    // Consents
    consent_credit_check: false, consent_contact: false,
    consent_popia: false, consent_terms: false,
  })

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  // ID number handler — auto-extract DOB and age
  const handleIdChange = (val: string) => {
    set('id_number', val)
    if (val.length === 13) {
      const parsed = parseIdNumber(val)
      if (parsed) {
        set('date_of_birth', parsed.dob)
        set('id_age', parsed.age)
        setIdError('')
      } else {
        set('date_of_birth', '')
        set('id_age', null)
        setIdError('Invalid SA ID number — please check and re-enter')
      }
    } else {
      setIdError('')
    }
  }

  const totalObligations =
    (form.obligation_bond_rent || 0) + (form.obligation_vehicle_finance || 0) +
    (form.obligation_credit_cards || 0) + (form.obligation_store_accounts || 0) +
    (form.obligation_personal_loans || 0) + (form.obligation_maintenance || 0) +
    (form.obligation_other || 0)

  const disposablePreview = (form.net_monthly_income + (form.other_income_amount || 0))
    - totalObligations
    - Math.max(form.monthly_living_expenses || 0, 3500 + (form.dependants || 0) * 1200)

  const handleSubmit = async () => {
    setSubmitting(true)
    const pa = calculatePreApproval(form)
    const payload = {
      ...form,
      vehicle_id: vehicleId || null,
      vehicle_details: vehicleDetails || null,
      pre_approval_status: pa.status,
      pre_approval_notes: pa.notes,
      estimated_monthly_payment: Math.round(pa.estimatedMonthly),
      estimated_monthly_stressed: Math.round(pa.stressedMonthly),
      max_loan_estimate: Math.round(pa.maxLoan),
      disposable_income_calc: Math.round(pa.disposable),
      dti_ratio: parseFloat(pa.dti.toFixed(4)),
      status: 'new',
    }
    const { error } = await supabase.from('finance_applications').insert([payload])
    if (!error) setResult(pa)
    else { alert('Submission error: ' + error.message); console.error(error) }
    setSubmitting(false)
  }

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    type CfgKey = 'strong' | 'review' | 'manual' | 'declined'
    const cfgMap: Record<CfgKey, { Icon: any; color: string; bg: string; heading: string; body: string }> = {
      strong:   { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', heading: 'Application Received — Looking Strong', body: 'Based on the information provided, your application looks promising. A dedicated finance consultant will contact you within 24 hours to discuss next steps and confirm your supporting documents.' },
      review:   { Icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',  heading: 'Application Received — Under Review', body: 'Your application has been received and will be reviewed by our finance team. A consultant will be in touch within 24 hours.' },
      manual:   { Icon: FileText,    color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',    heading: 'Application Received — Manual Assessment', body: 'Your application requires a personal review by our finance specialists. We will contact you within 24–48 hours to discuss your specific situation and available options.' },
      declined: { Icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50 border-red-200',      heading: 'Application Received', body: 'Based on the current information, standard financing may be difficult at this time. However, our team will still be in touch to discuss all possible options available to you.' },
    }
    const fallbackCfg = { Icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', heading: 'Application Received', body: 'Our team will be in contact shortly.' }
    const cfg = (cfgMap as any)[result.status as string] ?? fallbackCfg

    const { Icon } = cfg

    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-xl mx-auto px-6">
          <div className={`border-2 ${cfg.bg} p-10 text-center`} style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%)' }}>
            <Icon className={`w-16 h-16 mx-auto mb-5 ${cfg.color}`} />
            <h1 className="text-3xl font-display text-dark mb-3">{cfg.heading}</h1>
            <p className="text-gray-600 leading-relaxed mb-8">{cfg.body}</p>

            <div className="bg-white border border-gray-200 rounded-lg p-5 text-left text-sm text-gray-500 mb-8">
              <strong className="text-dark block mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> Important — What Happens Next
              </strong>
              <ul className="space-y-1.5 text-xs">
                <li>• A consultant will call you on <strong className="text-dark">{form.phone}</strong> within 24 hours</li>
                <li>• Ensure your supporting documents are ready (ID, payslips, bank statements)</li>
                <li>• This is not a credit decision — formal approval is done by accredited lenders</li>
                <li>• IC Cars acts as an intermediary, not a registered credit provider</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/vehicles" className="btn-filled btn-filled-gold">Browse More Vehicles</a>
              <a href="/contact" className="btn-hollow btn-hollow-gold flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step progress bar ───────────────────────────────────────
  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Header */}
      <div className="bg-black py-12 mb-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest mb-4">
            <Shield className="w-3.5 h-3.5" /> NCR Compliant · Secure Application
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white mb-3">
            Finance <span className="text-gold">Application</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
            Complete all sections accurately. The information you provide allows us to match you with the most suitable finance options from our lender network.
          </p>
          {vehicleDetails && (
            <div className="mt-4 inline-block bg-gold text-black px-4 py-1.5 font-bold text-xs uppercase tracking-wide">
              Applying for: {vehicleDetails}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {step} of {STEPS.length}</span>
            <span>{STEPS[step - 1].title}</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map(s => {
              const isDone   = step > s.id
              const isActive = step === s.id
              const SIcon = s.Icon
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 flex items-center justify-center transition-all ${isDone ? 'bg-gold text-black' : isActive ? 'bg-black text-gold border-2 border-gold' : 'bg-gray-100 text-gray-300'}`}>
                    {isDone ? <Check className="w-4 h-4" /> : <SIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] hidden md:block ${isActive ? 'text-dark font-semibold' : 'text-gray-400'}`}>{s.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-gray-100 shadow-sm" style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%)' }}>
          <div className="p-8">

            {/* ── STEP 1: Personal & Contact ── */}
            {step === 1 && (
              <div className="space-y-6">
                <SectionHeading icon={<User />} title="Personal Information" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FLabel>Full Name (as per ID) *</FLabel>
                    <input className="input-field" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="John Michael Doe" />
                  </div>

                  <div className="md:col-span-2">
                    <FLabel>SA ID Number *</FLabel>
                    <input
                      className={`input-field font-mono ${idError ? 'border-red-400' : ''}`}
                      value={form.id_number}
                      onChange={e => handleIdChange(e.target.value)}
                      placeholder="8001015009087"
                      maxLength={13}
                    />
                    {idError && <p className="text-xs text-red-500 mt-1">{idError}</p>}
                    {form.id_age && !idError && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Valid ID · Age {form.id_age} · DOB: {form.date_of_birth}
                      </p>
                    )}
                  </div>

                  <div>
                    <FLabel>Date of Birth *</FLabel>
                    <input type="date" className="input-field bg-gray-50" value={form.date_of_birth}
                      onChange={e => set('date_of_birth', e.target.value)} readOnly={!!form.id_age} />
                    {form.id_age && <p className="text-xs text-gray-400 mt-1">Auto-filled from ID number</p>}
                  </div>

                  <div>
                    <FLabel>Nationality *</FLabel>
                    <select className="input-field" value={form.nationality} onChange={e => set('nationality', e.target.value)}>
                      <option>South African</option>
                      <option>Permanent Resident</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <FLabel>Marital Status *</FLabel>
                    <select className="input-field" value={form.marital_status} onChange={e => set('marital_status', e.target.value)}>
                      <option value="">Select</option>
                      <option>Single</option>
                      <option>Married (ANC)</option>
                      <option>Married (COP)</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>

                  <div>
                    <FLabel>Number of Financial Dependants</FLabel>
                    <input type="number" min="0" max="15" className="input-field" value={form.dependants} onChange={e => set('dependants', parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <SectionHeading icon={<Phone />} title="Contact Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <FLabel>Email Address *</FLabel>
                      <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                      <FLabel>Mobile Number *</FLabel>
                      <input type="tel" className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="082 000 0000" />
                    </div>
                    <div>
                      <FLabel>WhatsApp Number</FLabel>
                      <input type="tel" className="input-field" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="Same as mobile if same" />
                    </div>
                    <div>
                      <FLabel>Alternative Phone</FLabel>
                      <input type="tel" className="input-field" value={form.alt_phone} onChange={e => set('alt_phone', e.target.value)} placeholder="011 000 0000" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <SectionHeading icon={<Home />} title="Residential Address" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <FLabel>Street Address *</FLabel>
                      <input className="input-field" value={form.residential_address} onChange={e => set('residential_address', e.target.value)} placeholder="12 Example Street" />
                    </div>
                    <div>
                      <FLabel>Suburb *</FLabel>
                      <input className="input-field" value={form.residential_suburb} onChange={e => set('residential_suburb', e.target.value)} placeholder="Hatfield" />
                    </div>
                    <div>
                      <FLabel>City *</FLabel>
                      <input className="input-field" value={form.residential_city} onChange={e => set('residential_city', e.target.value)} placeholder="Pretoria" />
                    </div>
                    <div>
                      <FLabel>Province *</FLabel>
                      <select className="input-field" value={form.residential_province} onChange={e => set('residential_province', e.target.value)}>
                        <option value="">Select Province</option>
                        {SA_PROVINCES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <FLabel>Postal Code *</FLabel>
                      <input className="input-field" value={form.residential_postal_code} onChange={e => set('residential_postal_code', e.target.value)} placeholder="0001" maxLength={4} />
                    </div>
                    <div>
                      <FLabel>Residential Status *</FLabel>
                      <select className="input-field" value={form.residential_status} onChange={e => set('residential_status', e.target.value)}>
                        <option value="">Select</option>
                        <option>Own (Bond-free)</option>
                        <option>Own (With Bond)</option>
                        <option>Renting</option>
                        <option>Living with Family</option>
                        <option>Company Accommodation</option>
                      </select>
                    </div>
                    <div>
                      <FLabel>Years at This Address</FLabel>
                      <input type="number" min="0" className="input-field" value={form.years_at_address} onChange={e => set('years_at_address', parseInt(e.target.value) || 0)} />
                    </div>
                    {form.years_at_address < 2 && (
                      <div>
                        <FLabel>Months at This Address</FLabel>
                        <input type="number" min="0" max="11" className="input-field" value={form.months_at_address} onChange={e => set('months_at_address', parseInt(e.target.value) || 0)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Employment ── */}
            {step === 2 && (
              <div className="space-y-6">
                <SectionHeading icon={<Briefcase />} title="Employment Details" />

                <div>
                  <FLabel>Employment Status *</FLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Employed', 'Self-Employed', 'Retired', 'Unemployed'].map(s => (
                      <button key={s} type="button"
                        onClick={() => set('employment_status', s)}
                        className={`p-3 text-sm font-semibold border-2 transition-all text-center ${form.employment_status === s ? 'bg-black text-gold border-gold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {form.employment_status === 'Employed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <FLabel>Employment Type *</FLabel>
                      <select className="input-field" value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>Permanent</option><option>Contract</option>
                        <option>Part-time</option><option>Casual</option>
                      </select>
                    </div>
                    <div>
                      <FLabel>Employer Name *</FLabel>
                      <input className="input-field" value={form.employer_name} onChange={e => set('employer_name', e.target.value)} placeholder="ABC Company (Pty) Ltd" />
                    </div>
                    <div className="md:col-span-2">
                      <FLabel>Employer Address</FLabel>
                      <input className="input-field" value={form.employer_address} onChange={e => set('employer_address', e.target.value)} placeholder="123 Business Park, Sandton" />
                    </div>
                    <div>
                      <FLabel>Employer Phone *</FLabel>
                      <input type="tel" className="input-field" value={form.employer_phone} onChange={e => set('employer_phone', e.target.value)} placeholder="011 000 0000" />
                    </div>
                    <div>
                      <FLabel>Job Title / Position *</FLabel>
                      <input className="input-field" value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Senior Accountant" />
                    </div>
                    <div>
                      <FLabel>Years with Current Employer *</FLabel>
                      <input type="number" min="0" max="50" className="input-field" value={form.years_employed} onChange={e => set('years_employed', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <FLabel>Additional Months</FLabel>
                      <input type="number" min="0" max="11" className="input-field" value={form.months_employed} onChange={e => set('months_employed', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <FLabel>HR / Payroll Contact Name</FLabel>
                      <input className="input-field" value={form.hr_contact_name} onChange={e => set('hr_contact_name', e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <FLabel>HR / Payroll Contact Phone</FLabel>
                      <input type="tel" className="input-field" value={form.hr_contact_phone} onChange={e => set('hr_contact_phone', e.target.value)} placeholder="011 000 0000" />
                    </div>
                  </div>
                )}

                {form.employment_status === 'Self-Employed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <FLabel>Business / Trading Name *</FLabel>
                      <input className="input-field" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
                    </div>
                    <div>
                      <FLabel>Company Registration Number</FLabel>
                      <input className="input-field" value={form.business_reg_number} onChange={e => set('business_reg_number', e.target.value)} placeholder="2020/123456/07" />
                    </div>
                    <div>
                      <FLabel>Industry / Sector *</FLabel>
                      <input className="input-field" value={form.business_industry} onChange={e => set('business_industry', e.target.value)} placeholder="Construction, Retail, Transport..." />
                    </div>
                    <div>
                      <FLabel>Years in Business *</FLabel>
                      <input type="number" min="0" max="50" className="input-field" value={form.business_age_years} onChange={e => set('business_age_years', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="md:col-span-2">
                      <FLabel>Business Address</FLabel>
                      <input className="input-field" value={form.business_address} onChange={e => set('business_address', e.target.value)} />
                    </div>
                  </div>
                )}

                {form.employment_status === 'Retired' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <FLabel>Pension Fund / Employer *</FLabel>
                      <input className="input-field" value={form.pension_fund} onChange={e => set('pension_fund', e.target.value)} placeholder="GEPF, SANLAM, etc." />
                    </div>
                    <div>
                      <FLabel>Pension Fund Contact Number</FLabel>
                      <input type="tel" className="input-field" value={form.pension_fund_phone} onChange={e => set('pension_fund_phone', e.target.value)} />
                    </div>
                  </div>
                )}

                {form.employment_status === 'Unemployed' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">Vehicle finance requires a verifiable income source. You may still submit this application and our consultant will discuss available options with you.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Income & Expenses ── */}
            {step === 3 && (
              <div className="space-y-6">
                <SectionHeading icon={<TrendingUp />} title="Monthly Income" />
                <p className="text-xs text-gray-400 -mt-3">All amounts in ZAR. Lenders verify these figures against your payslips and bank statements.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RandField label="Gross Monthly Salary (before tax) *" value={form.gross_monthly_income} onChange={v => set('gross_monthly_income', v)} placeholder="30 000" />
                  <RandField label="Net Monthly Salary (take-home) *" value={form.net_monthly_income} onChange={v => set('net_monthly_income', v)} placeholder="22 000" />
                  <RandField label="Other Income (rental, investments, side income)" value={form.other_income_amount} onChange={v => set('other_income_amount', v)} placeholder="0" />
                  <div>
                    <FLabel>Other Income Source</FLabel>
                    <input className="input-field" value={form.other_income_source} onChange={e => set('other_income_source', e.target.value)} placeholder="Rental property, freelance work..." />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <SectionHeading icon={<CreditCard />} title="Monthly Obligations" />
                  <p className="text-xs text-gray-400 mt-1 mb-4">Enter your current monthly repayment amounts. Enter 0 if not applicable.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RandField label="Bond / Rent Payment" value={form.obligation_bond_rent} onChange={v => set('obligation_bond_rent', v)} />
                    <RandField label="Existing Vehicle Finance Instalments" value={form.obligation_vehicle_finance} onChange={v => set('obligation_vehicle_finance', v)} />
                    <RandField label="Credit Card Minimum Payments" value={form.obligation_credit_cards} onChange={v => set('obligation_credit_cards', v)} />
                    <RandField label="Store Account Payments" value={form.obligation_store_accounts} onChange={v => set('obligation_store_accounts', v)} />
                    <RandField label="Personal / Cash Loan Repayments" value={form.obligation_personal_loans} onChange={v => set('obligation_personal_loans', v)} />
                    <RandField label="Maintenance / Alimony Payments" value={form.obligation_maintenance} onChange={v => set('obligation_maintenance', v)} />
                    <RandField label="Other Monthly Obligations" value={form.obligation_other} onChange={v => set('obligation_other', v)} />
                    <div>
                      <FLabel>Other Obligation Description</FLabel>
                      <input className="input-field" value={form.obligation_other_desc} onChange={e => set('obligation_other_desc', e.target.value)} placeholder="School fees, insurance, etc." />
                    </div>
                    <div className="md:col-span-2">
                      <RandField label="Monthly Living Expenses (food, utilities, clothing, school, transport)" value={form.monthly_living_expenses} onChange={v => set('monthly_living_expenses', v)} placeholder="6 000" />
                    </div>
                  </div>

                  {/* Live affordability preview */}
                  {form.net_monthly_income > 0 && (
                    <div className="mt-5 bg-black rounded-lg p-5">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold">Affordability Preview</div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Total Obligations</div>
                          <div className="text-base font-bold text-white">R {totalObligations.toLocaleString('en-ZA')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Disposable Income</div>
                          <div className={`text-base font-bold ${disposablePreview > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R {Math.round(disposablePreview).toLocaleString('en-ZA')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Max Car Payment</div>
                          <div className="text-base font-bold text-gold">
                            R {Math.round(Math.max(0, Math.min(form.gross_monthly_income * 0.30, disposablePreview * 0.75))).toLocaleString('en-ZA')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: Loan Request & Banking ── */}
            {step === 4 && (
              <div className="space-y-6">
                <SectionHeading icon={<Calculator />} title="Loan Request" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RandField label="Vehicle Purchase Price *" value={form.vehicle_price} onChange={v => { set('vehicle_price', v); set('loan_amount_requested', Math.max(0, v - (form.deposit_amount || 0))) }} />
                  <RandField label="Deposit Amount" value={form.deposit_amount} onChange={v => { set('deposit_amount', v); set('loan_amount_requested', Math.max(0, (form.vehicle_price || 0) - v)) }} />
                  <div>
                    <FLabel>Finance Amount Required</FLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">R</span>
                      <input className="input-field pl-7 bg-gray-50 font-semibold" value={(form.loan_amount_requested || 0).toLocaleString('en-ZA')} readOnly />
                    </div>
                  </div>
                  <div>
                    <FLabel>Preferred Repayment Term *</FLabel>
                    <select className="input-field" value={form.preferred_term_months} onChange={e => set('preferred_term_months', parseInt(e.target.value))}>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={60}>60 months</option>
                      <option value={72}>72 months (most common)</option>
                    </select>
                  </div>
                </div>

                {/* Payment estimate */}
                {form.loan_amount_requested > 0 && (() => {
                  const r = 0.1425 / 12
                  const n = form.preferred_term_months
                  const pmt = (form.loan_amount_requested * r) / (1 - Math.pow(1 + r, -n))
                  const stressed = (form.loan_amount_requested * (0.1675 / 12)) / (1 - Math.pow(1 + (0.1675 / 12), -n))
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Estimated Monthly (prime +2.5%)</div>
                          <div className="text-2xl font-bold text-dark">R {Math.round(pmt).toLocaleString('en-ZA')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 mb-1">Stress Test (prime +5%)</div>
                          <div className="text-lg font-semibold text-amber-600">R {Math.round(stressed).toLocaleString('en-ZA')}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Estimates only. Final rate determined by lender based on credit profile.</p>
                    </div>
                  )
                })()}

                {/* Trade-in */}
                <div className="border-t border-gray-100 pt-5">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" checked={form.trade_in_vehicle} onChange={e => set('trade_in_vehicle', e.target.checked)} className="w-4 h-4 text-gold" />
                    <span className="font-semibold text-dark text-sm">I have a vehicle to trade in</span>
                  </label>
                  {form.trade_in_vehicle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FLabel>Trade-In Vehicle Details</FLabel>
                        <input className="input-field" value={form.trade_in_details} onChange={e => set('trade_in_details', e.target.value)} placeholder="2019 Toyota Corolla 1.8 Auto" />
                      </div>
                      <RandField label="Estimated Trade-In Value" value={form.trade_in_estimated_value} onChange={v => set('trade_in_estimated_value', v)} />
                    </div>
                  )}
                </div>

                {/* Banking */}
                <div className="border-t border-gray-100 pt-5">
                  <SectionHeading icon={<Landmark />} title="Banking Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <FLabel>Bank *</FLabel>
                      <select className="input-field" value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
                        <option value="">Select Bank</option>
                        {SA_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <FLabel>Account Type</FLabel>
                      <select className="input-field" value={form.account_type} onChange={e => set('account_type', e.target.value)}>
                        <option value="">Select</option>
                        <option>Cheque / Current</option>
                        <option>Savings</option>
                        <option>Transmission</option>
                      </select>
                    </div>
                    <div>
                      <FLabel>Years with This Bank</FLabel>
                      <input type="number" min="0" max="50" className="input-field" value={form.years_with_bank} onChange={e => set('years_with_bank', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-3 cursor-pointer mt-5">
                        <input type="checkbox" checked={form.salary_paid_into_this_account} onChange={e => set('salary_paid_into_this_account', e.target.checked)} className="w-4 h-4 text-gold" />
                        <span className="text-sm font-medium text-dark">Salary paid into this account</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: Declarations ── */}
            {step === 5 && (
              <div className="space-y-5">
                <SectionHeading icon={<Shield />} title="Credit & Financial Declarations" />
                <p className="text-sm text-gray-500 -mt-3 leading-relaxed">
                  Please answer all questions honestly. These declarations are required by the National Credit Act and are used to assess affordability. Providing false information is an offence.
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Current Credit Accounts</p>
                  {[
                    { f: 'decl_has_existing_vehicle_finance', l: 'I currently have vehicle finance instalments' },
                    { f: 'decl_has_home_loan',                l: 'I currently have a home loan / bond' },
                    { f: 'decl_has_credit_cards',             l: 'I have active credit cards' },
                    { f: 'decl_has_store_accounts',           l: 'I have active store / retail accounts' },
                    { f: 'decl_has_personal_loans',           l: 'I have personal / cash loans outstanding' },
                  ].map(({ f, l }) => (
                    <DeclRow key={f} label={l} value={form[f]} onChange={v => set(f, v)} warn={false} />
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Credit History Declarations</p>
                  {[
                    { f: 'decl_has_been_blacklisted', l: 'I have previously been listed / blacklisted', warn: true },
                    { f: 'decl_has_judgements',        l: 'I have judgements or adverse credit listings',  warn: true },
                    { f: 'decl_under_debt_review',     l: 'I am currently under debt review',              warn: true },
                    { f: 'decl_ever_sequestrated',     l: 'I have ever been sequestrated',                 warn: true },
                    { f: 'decl_ever_insolvent',        l: 'I have ever been declared insolvent',           warn: true },
                  ].map(({ f, l, warn }) => (
                    <DeclRow key={f} label={l} value={form[f]} onChange={v => set(f, v)} warn={warn} />
                  ))}
                </div>

                {form.decl_under_debt_review && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">Under the NCA, consumers under debt review may not apply for new credit. You may still submit — our consultant will contact you.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 6: Documents ── */}
            {step === 6 && (
              <div className="space-y-7">
                <SectionHeading icon={<FileText />} title="Supporting Documents" />
                <p className="text-sm text-gray-500 -mt-3 leading-relaxed">
                  Upload clear, legible copies. All files are securely stored. Accepted formats: PDF, JPG, PNG.
                  Documents must be current (not older than 3 months where specified).
                </p>

                {/* ID */}
                <DocGroup title="Identity Document" required>
                  <DocUpload label="SA ID / Smart Card — Front" required value={form.doc_id_front} onChange={v => set('doc_id_front', v)} />
                  <DocUpload label="SA ID / Smart Card — Back" value={form.doc_id_back} onChange={v => set('doc_id_back', v)} />
                </DocGroup>

                {/* Proof of residence */}
                <DocGroup title="Proof of Residence" required subtitle="Not older than 3 months. Accepted: utility bill, municipal rates, bank statement (must show your name and address)">
                  <DocUpload
                    label="Proof of Residence"
                    sublabel="Upload 1–3 documents if needed"
                    required multiple
                    value={form.doc_proof_of_residence}
                    onChange={v => set('doc_proof_of_residence', v)}
                  />
                </DocGroup>

                {/* Payslips — employed only */}
                {(form.employment_status === 'Employed' || form.employment_status === 'Retired') && (
                  <DocGroup title="Payslips / Pension Advice" required subtitle="Last 3 months">
                    <DocUpload label="Most Recent Payslip" required value={form.doc_payslip_month1} onChange={v => set('doc_payslip_month1', v)} />
                    <DocUpload label="2nd Most Recent Payslip" value={form.doc_payslip_month2} onChange={v => set('doc_payslip_month2', v)} />
                    <DocUpload label="3rd Most Recent Payslip" value={form.doc_payslip_month3} onChange={v => set('doc_payslip_month3', v)} />
                  </DocGroup>
                )}

                {/* Bank statements — 3 months all, 6 months self-employed */}
                <DocGroup
                  title="Bank Statements"
                  required
                  subtitle={form.employment_status === 'Self-Employed' ? 'Last 6 months required for self-employed applicants' : 'Last 3 months'}
                >
                  <DocUpload label="Bank Statement — Month 1 (most recent)" required value={form.doc_bank_statement_month1} onChange={v => set('doc_bank_statement_month1', v)} />
                  <DocUpload label="Bank Statement — Month 2" value={form.doc_bank_statement_month2} onChange={v => set('doc_bank_statement_month2', v)} />
                  <DocUpload label="Bank Statement — Month 3" value={form.doc_bank_statement_month3} onChange={v => set('doc_bank_statement_month3', v)} />
                  {form.employment_status === 'Self-Employed' && (
                    <>
                      <DocUpload label="Bank Statement — Month 4" value={form.doc_bank_statement_month4} onChange={v => set('doc_bank_statement_month4', v)} />
                      <DocUpload label="Bank Statement — Month 5" value={form.doc_bank_statement_month5} onChange={v => set('doc_bank_statement_month5', v)} />
                      <DocUpload label="Bank Statement — Month 6" value={form.doc_bank_statement_month6} onChange={v => set('doc_bank_statement_month6', v)} />
                    </>
                  )}
                </DocGroup>

                {/* Financial statements — self-employed only */}
                {form.employment_status === 'Self-Employed' && (
                  <DocGroup title="Business Financial Statements" subtitle="Latest 2 years AFS, management accounts, or accountant's letter on letterhead">
                    <DocUpload
                      label="Financial Statements / Management Accounts"
                      sublabel="Upload multiple files if needed"
                      multiple
                      value={form.doc_financial_statements}
                      onChange={v => set('doc_financial_statements', v)}
                    />
                  </DocGroup>
                )}

                {/* Existing finance */}
                {(form.decl_has_existing_vehicle_finance || form.decl_has_personal_loans) && (
                  <DocGroup title="Existing Finance Statements" subtitle="Current settlement letters or latest statements for existing finance accounts">
                    <DocUpload
                      label="Existing Finance / Loan Statements"
                      multiple
                      value={form.doc_existing_finance}
                      onChange={v => set('doc_existing_finance', v)}
                    />
                  </DocGroup>
                )}

                {/* Other */}
                <DocGroup title="Any Other Supporting Documents" subtitle="Optional — e.g. rental income proof, dividend statements, divorce settlement">
                  <DocUpload label="Additional Documents" multiple value={form.doc_other} onChange={v => set('doc_other', v)} />
                </DocGroup>
              </div>
            )}

            {/* ── STEP 7: Review & Consent ── */}
            {step === 7 && (
              <div className="space-y-6">
                <SectionHeading icon={<CheckCircle />} title="Review & Submit" />

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-5 space-y-2 text-sm">
                  {[
                    ['Applicant',      form.full_name],
                    ['ID Number',      form.id_number],
                    ['Email',          form.email],
                    ['Phone',          form.phone],
                    ['Employment',     `${form.employment_status}${form.employer_name ? ` — ${form.employer_name}` : ''}`],
                    ['Gross Income',   `R ${(form.gross_monthly_income || 0).toLocaleString('en-ZA')}/month`],
                    ['Total Obligations', `R ${totalObligations.toLocaleString('en-ZA')}/month`],
                    ['Vehicle',        vehicleDetails || 'Not specified'],
                    ['Loan Amount',    `R ${(form.loan_amount_requested || 0).toLocaleString('en-ZA')}`],
                    ['Deposit',        `R ${(form.deposit_amount || 0).toLocaleString('en-ZA')}`],
                    ['Term',           `${form.preferred_term_months} months`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-semibold text-dark text-right max-w-[55%]">{v || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Document checklist */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <p className="text-sm font-bold text-dark mb-3">Documents Uploaded</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['SA ID Front',         !!form.doc_id_front],
                      ['Proof of Residence',  form.doc_proof_of_residence?.length > 0],
                      ['Payslip Month 1',     !!form.doc_payslip_month1],
                      ['Bank Statement M1',   !!form.doc_bank_statement_month1],
                      ['Bank Statement M2',   !!form.doc_bank_statement_month2],
                      ['Bank Statement M3',   !!form.doc_bank_statement_month3],
                    ].map(([label, done]) => (
                      <div key={label as string} className={`flex items-center gap-2 ${done ? 'text-green-700' : 'text-gray-400'}`}>
                        {done ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {label as string}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consents */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-dark">Required Consents</p>
                  {[
                    { f: 'consent_popia',         l: 'I consent to the collection and processing of my personal information in terms of the Protection of Personal Information Act (POPIA).' },
                    { f: 'consent_credit_check',  l: 'I consent to IC Cars and its finance partners performing credit bureau inquiries on my profile.' },
                    { f: 'consent_contact',       l: 'I consent to being contacted by an IC Cars consultant via phone, email, or WhatsApp.' },
                    { f: 'consent_terms',         l: 'I confirm all information is accurate and complete to the best of my knowledge, and I understand that false declarations are an offence under the NCA.' },
                  ].map(({ f, l }) => (
                    <label key={f} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form[f]} onChange={e => set(f, e.target.checked)} className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-relaxed">{l}</span>
                    </label>
                  ))}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
                  IC Cars (Pty) Ltd acts as an intermediary between applicants and registered credit providers and is not itself a registered credit provider. All applications are subject to the National Credit Act 34 of 2005. Your information is processed in accordance with POPIA.
                </p>
              </div>
            )}

          </div>

          {/* Navigation footer */}
          <div className="px-8 py-5 border-t border-gray-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="btn-hollow btn-hollow-gold disabled:opacity-30 flex items-center gap-2 py-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="btn-filled btn-filled-gold flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !form.consent_popia || !form.consent_credit_check || !form.consent_contact || !form.consent_terms}
                className="btn-filled btn-filled-gold disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><CheckCircle className="w-4 h-4" />Submit Application</>}
              </button>
            )}
          </div>
        </div>

       
      </div>
    </div>
  )
}

// ─── Shared micro-components ──────────────────────────────────
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-xl font-display text-dark">{title}</h2>
    </div>
  )
}

function FLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{children}</label>
}

function RandField({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">R</span>
        <input
          type="number" min="0"
          className="input-field pl-7"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder || '0'}
        />
      </div>
    </div>
  )
}

function DeclRow({ label, value, onChange, warn }: { label: string; value: boolean; onChange: (v: boolean) => void; warn: boolean }) {
  return (
    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value ? (warn ? 'bg-red-50 border-red-200' : 'bg-gold/5 border-gold/30') : 'border-gray-100 hover:bg-gray-50'}`}>
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="w-4 h-4 text-gold flex-shrink-0" />
      <span className={`text-sm font-medium ${value && warn ? 'text-red-700' : 'text-dark'}`}>{label}</span>
      {value && warn && <AlertCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />}
    </label>
  )
}

function DocGroup({ title, subtitle, required, children }: { title: string; subtitle?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-dark">{title}</h3>
          {required && <span className="text-xs text-red-500 font-bold">Required</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}