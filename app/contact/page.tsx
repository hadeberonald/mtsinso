'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { emailContactAcknowledgement } from '@/lib/email'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // 1. Save to Supabase contact_submissions table (optional)
      await supabase
        .from('contact_submissions')
        .insert([{
          name:    formData.name,
          email:   formData.email,
          phone:   formData.phone,
          subject: formData.subject,
          message: formData.message,
        }])
        .then(() => {}) // non-blocking

      // 2. Send acknowledgement email to customer
      await emailContactAcknowledgement(formData.email, {
        name:    formData.name,
        subject: formData.subject,
      })

      setSubmitted(true)

      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 4500)

    } catch (err: any) {
      console.error(err)
      setError('Something went wrong. Please try again or contact us directly via WhatsApp.')
    }

    setSubmitting(false)
  }

  return (
    <div className="pt-20 min-h-screen bg-white">

      {/* Header */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-display text-white mb-4">
            Get in <span className="text-gold">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Have questions about our vehicles or financing options? We're here to help. Contact us today.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-display text-dark mb-8">Contact Information</h2>

              <div className="space-y-6 mb-12">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gold flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-1">Address</h3>
                    <p className="text-gray-600">
                      505 Rachel de Beer Street<br />
                      Pretoria North<br />
                      Pretoria, 0116<br />
                      South Africa
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gold flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-1">Phone</h3>
                    <a href="tel:0726921127" className="text-gray-600 hover:text-gold transition-colors">
                      072 692 1127
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gold flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-1">Email</h3>
                    <a href="mailto:admin@iccars.co.za" className="text-gray-600 hover:text-gold transition-colors">
                      admin@iccars.co.za
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gold flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday – Friday: 8:00 AM – 6:00 PM<br />
                      Saturday: 9:00 AM – 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="card-angled h-64 bg-gray-200 border-2 border-dark-light overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.0234567890123!2d28.1897!3d-25.6888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e956253c3d3d3d3%3A0x1234567890abcdef!2s505%20Rachel%20de%20Beer%20St%2C%20Pretoria%20North%2C%20Pretoria%2C%200116!5e0!3m2!1sen!2sza!4v1234567890123!5m2!1sen!2sza"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="IC Cars Location"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-display text-dark mb-8">Send us a Message</h2>

              {submitted ? (
                <div className="card-angled bg-gold/10 border-2 border-gold p-8 text-center">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-2">Message Sent!</h3>
                  <p className="text-gray-700">
                    Thank you for contacting us. A confirmation has been sent to <strong>{formData.email}</strong>.
                    We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">Full Name *</label>
                    <input
                      type="text" id="name" name="name"
                      value={formData.name} onChange={handleChange}
                      required className="input-field" placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">Email Address *</label>
                      <input
                        type="email" id="email" name="email"
                        value={formData.email} onChange={handleChange}
                        required className="input-field" placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-dark mb-2">Phone Number</label>
                      <input
                        type="tel" id="phone" name="phone"
                        value={formData.phone} onChange={handleChange}
                        className="input-field" placeholder="+27 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-dark mb-2">Subject *</label>
                    <select
                      id="subject" name="subject"
                      value={formData.subject} onChange={handleChange}
                      required className="input-field"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Vehicle Inquiry">Vehicle Inquiry</option>
                      <option value="Financing Information">Financing Information</option>
                      <option value="Schedule Test Drive">Schedule Test Drive</option>
                      <option value="Trade-In Valuation">Trade-In Valuation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-dark mb-2">Message *</label>
                    <textarea
                      id="message" name="message"
                      value={formData.message} onChange={handleChange}
                      required rows={6} className="input-field resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-filled btn-filled-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    * Required fields &middot; You will receive a confirmation email
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display text-white mb-4">
              Visit Our <span className="text-gold">Showroom</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience our vehicles in person. Our friendly team is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Test Drives',          body: 'Schedule a test drive to experience the vehicle firsthand. No obligation.' },
              { title: 'Finance Consultation', body: 'Get expert advice on financing options tailored to your budget and needs.' },
              { title: 'Trade-In Valuation',   body: 'Bring your current vehicle for a free valuation and trade-in assessment.' },
            ].map(({ title, body }) => (
              <div key={title} className="card-angled bg-dark-light border-2 border-gold p-8 text-center">
                <h3 className="text-xl font-display text-gold mb-3">{title}</h3>
                <p className="text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}