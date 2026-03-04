// src/lib/email.ts
// Lightweight wrapper around the /api/send-email route.
// Call from any client component, server component, or API route.

export type TemplateKey =
  | 'finance_received'
  | 'finance_contacted'
  | 'finance_in_review'
  | 'finance_documents_pending'
  | 'finance_documents_received'
  | 'finance_submitted_to_bank'
  | 'finance_approved'
  | 'finance_declined'
  | 'finance_withdrawn'
  | 'contact_reply'
  | 'contact_acknowledgement'

interface SendEmailOptions {
  template: TemplateKey
  to: string
  data: Record<string, any>
}

/**
 * Core send function — calls the /api/send-email route.
 * Returns true on success, false on failure (logs error).
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const res = await fetch('/api/send-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(options),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[sendEmail] API error:', err)
      return false
    }
    return true
  } catch (err) {
    console.error('[sendEmail] Network error:', err)
    return false
  }
}

// ─── Finance status → template map ───────────────────────────────────────────
const FINANCE_STATUS_TEMPLATE_MAP: Record<string, TemplateKey> = {
  new:                'finance_received',
  contacted:          'finance_contacted',
  in_review:          'finance_in_review',
  documents_pending:  'finance_documents_pending',
  documents_received: 'finance_documents_received',
  submitted_to_bank:  'finance_submitted_to_bank',
  approved:           'finance_approved',
  declined:           'finance_declined',
  withdrawn:          'finance_withdrawn',
}

/**
 * Send a finance status update email.
 * Returns false if no template exists for that status (e.g. 'new' after initial send).
 */
export function emailFinanceStatusUpdate(
  to: string,
  status: string,
  data: {
    name: string
    vehicle?: string
    loan_amount?: number
    deposit?: number
    term?: number
    monthly?: number
    max_loan?: number
    bank_ref?: string
    agent_message?: string
  }
): Promise<boolean> {
  const template = FINANCE_STATUS_TEMPLATE_MAP[status]
  if (!template) return Promise.resolve(false)
  return sendEmail({ template, to, data })
}

/**
 * Send an agent reply to a customer contact enquiry.
 */
export function emailContactReply(
  to: string,
  data: {
    name: string
    reply_message: string
    reply_subject?: string
    original_subject?: string
    reply_to?: string
  }
): Promise<boolean> {
  return sendEmail({ template: 'contact_reply', to, data })
}

/**
 * Send a contact form acknowledgement to the customer.
 */
export function emailContactAcknowledgement(
  to: string,
  data: { name: string; subject?: string }
): Promise<boolean> {
  return sendEmail({ template: 'contact_acknowledgement', to, data })
}

/**
 * Send the initial finance application received email.
 * Call this immediately after a new application is submitted.
 */
export function emailFinanceReceived(
  to: string,
  data: {
    name: string
    vehicle?: string
    loan_amount?: number
    deposit?: number
    term?: number
  }
): Promise<boolean> {
  return sendEmail({ template: 'finance_received', to, data })
}