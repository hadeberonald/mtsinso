'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await supabase.from('contact_submissions').insert([formData]).then(() => {})
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 4500)
    } catch {
      setError('Something went wrong. Please try again or contact us directly via WhatsApp.')
    }
    setSubmitting(false)
  }

  const contactInfo = [
    { Icon: MapPin, label: 'Address', content: '202 Mark Street\nVryheid, 3100\nSouth Africa' },
    { Icon: Phone,  label: 'Phone',   content: '079 536 2485', href: 'tel:0726921127' },
    { Icon: Mail,   label: 'Email',   content: 'admin@mtsinso.co.za', href: 'mailto:admin@mtsinso.co.za' },
    { Icon: Clock,  label: 'Hours',   content: 'Mon–Fri: 8:00 AM – 6:00 PM\nSaturday: 9:00 AM – 4:00 PM\nSunday: Closed' },
  ]

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="section-tag">
            <span className="w-5 h-px bg-primary inline-block" />
            Reach Out
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-support mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Have questions about our vehicles or financing? We are here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Info */}
            <div>
              <h2 className="font-display text-3xl text-support mb-8">Contact Information</h2>

              <div className="space-y-5 mb-10">
                {contactInfo.map(({ Icon, label, content, href }) => (
                  <div key={label} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-support text-sm mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-muted text-sm hover:text-primary transition-colors whitespace-pre-line">{content}</a>
                      ) : (
                        <p className="text-muted text-sm whitespace-pre-line">{content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-60">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3468.123456789!2d30.7897!3d-27.7647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef5f5b5b5b5b5b5%3A0xabcdef1234567890!2s202%20Mark%20St%2C%20Vryheid%2C%203100!5e0!3m2!1sen!2sza!4v1"
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <h2 className="font-display text-3xl text-support mb-8">Send a Message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-support mb-2">Message Sent</h3>
                  <p className="text-muted text-sm">Thank you for reaching out. We will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="John Doe" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+27 XX XXX XXXX" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Subject *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="input-field">
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Vehicle Inquiry</option>
                      <option>Financing Information</option>
                      <option>Schedule Test Drive</option>
                      <option>Trade-In Valuation</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="input-field resize-none" placeholder="Tell us how we can help..." />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
                  )}

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-xs text-muted text-center">* Required fields</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom services */}
      <section className="py-16 bg-support">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-white mb-4">
              Visit Our <span className="text-primary-light">Showroom</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Experience our vehicles in person. Our team is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Test Drives',          body: 'Schedule a test drive to experience the vehicle firsthand. No obligation.' },
              { title: 'Finance Consultation', body: 'Get expert advice on financing options tailored to your budget and needs.' },
              { title: 'Trade-In Valuation',   body: 'Bring your current vehicle for a free valuation and trade-in assessment.' },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-7 text-center hover:bg-white/10 transition-all duration-300">
                <h3 className="font-display text-xl text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}