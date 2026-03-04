import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ─── cPanel SMTP Transporter ──────────────────────────────────────────────────
// Add these to your .env.local:
//   EMAIL_HOST=mail.iccars.co.za        ← from cPanel > Email Accounts > Connect Devices
//   EMAIL_PORT=465
//   EMAIL_USER=noreply@iccars.co.za     ← full email address you created in cPanel
//   EMAIL_PASS=yourpassword             ← password you set for that account
//   EMAIL_FROM="IC Cars <noreply@iccars.co.za>"

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'mail.iccars.co.za',
  port:   Number(process.env.EMAIL_PORT) || 465,
  secure: false, // use true if port is 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // required for cPanel shared hosting self-signed certs
  },
})

// ─── Brand colours ────────────────────────────────────────────────────────────
const GOLD  = '#b8953a'
const BLACK = '#0a0a0a'
const WHITE = '#ffffff'
const GRAY  = '#6b7280'
const LIGHT = '#f9fafb'

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function layout(body: string, previewText = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>IC Cars</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;‌</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${BLACK};padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td>
                  <span style="font-size:28px;font-weight:800;color:${WHITE};letter-spacing:-0.5px;">IC</span>
                  <span style="font-size:28px;font-weight:800;color:${GOLD};letter-spacing:-0.5px;">Cars</span>
                </td>
                <td align="right" style="color:${GRAY};font-size:12px;">Pretoria North</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Gold rule -->
        <tr><td style="background:${GOLD};height:3px;line-height:3px;font-size:3px;">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td style="background:${WHITE};">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BLACK};padding:28px 40px;">
            <p style="margin:0 0 6px;color:${GRAY};font-size:12px;">IC Cars &middot; 505 Rachel de Beer Street, Pretoria North</p>
            <p style="margin:0 0 6px;color:${GRAY};font-size:12px;">
              <a href="tel:0726921127" style="color:${GOLD};text-decoration:none;">072 692 1127</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:admin@iccars.co.za" style="color:${GOLD};text-decoration:none;">admin@iccars.co.za</a>
            </p>
            <p style="margin:0;color:#4b5563;font-size:11px;">Your Journey. Our Priority.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── HTML building helpers ────────────────────────────────────────────────────
const heroBlock = (title: string, subtitle: string) => `
  <div style="background:${BLACK};padding:40px 40px 32px;border-bottom:1px solid #1f2937;">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:${WHITE};line-height:1.2;">${title}</h1>
    <p style="margin:0;color:${GRAY};font-size:14px;line-height:1.6;">${subtitle}</p>
  </div>`

const bodyWrap = (html: string) => `<div style="padding:36px 40px;">${html}</div>`

const infoTable = (rows: [string, string][]) => `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e5e7eb;margin:20px 0;">
    ${rows.map(([label, value], i) => `
      <tr>
        <td style="padding:10px 16px;background:${i % 2 === 0 ? LIGHT : WHITE};font-size:12px;color:${GRAY};width:38%;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #e5e7eb;">${label}</td>
        <td style="padding:10px 16px;background:${i % 2 === 0 ? LIGHT : WHITE};font-size:13px;color:${BLACK};font-weight:600;border-bottom:1px solid #e5e7eb;">${value}</td>
      </tr>`).join('')}
  </table>`

const ctaButton = (text: string, href: string) => `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr>
      <td style="background:${GOLD};padding:0;">
        <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:800;color:${BLACK};text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">${text}</a>
      </td>
    </tr>
  </table>`

const divider = () => `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>`

const agentNote = (msg: string) => msg
  ? `<div style="background:${LIGHT};border-left:3px solid ${GOLD};padding:12px 16px;margin:16px 0;">
       <p style="margin:0;font-size:13px;color:#374151;font-style:italic;">"${msg}"</p>
     </div>`
  : ''

const waLink = `<a href="https://wa.me/27726921127" style="color:${GOLD};text-decoration:none;font-weight:700;">WhatsApp</a>`
const callLink = `<a href="tel:0726921127" style="color:${GOLD};text-decoration:none;font-weight:700;">072 692 1127</a>`

// ─── Template registry ────────────────────────────────────────────────────────
type TemplateKey =
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

interface EmailPayload {
  template: TemplateKey
  to: string
  data: Record<string, any>
}

function buildEmail(template: TemplateKey, data: Record<string, any>): { subject: string; html: string } {
  const name    = data.name    || 'Valued Customer'
  const vehicle = data.vehicle || 'your selected vehicle'
  const amount  = data.loan_amount ? `R&nbsp;${Number(data.loan_amount).toLocaleString('en-ZA')}` : ''
  const monthly = data.monthly     ? `R&nbsp;${Number(data.monthly).toLocaleString('en-ZA')}` : ''
  const maxLoan = data.max_loan    ? `R&nbsp;${Number(data.max_loan).toLocaleString('en-ZA')}` : ''

  switch (template) {

    // ── 1. Application received ──────────────────────────────────────────────
    case 'finance_received':
      return {
        subject: 'We have received your finance application — IC Cars',
        html: layout(
          heroBlock('Application Received', 'Thank you for applying — we\'re on it.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We have received your finance application for <strong>${vehicle}</strong>. One of our consultants will be in touch within 1 business day.
            </p>
            ${data.loan_amount ? infoTable([
              ['Requested Loan',  amount],
              ['Preferred Term',  `${data.term || '—'} months`],
              ['Deposit',         data.deposit ? `R&nbsp;${Number(data.deposit).toLocaleString('en-ZA')}` : '—'],
            ]) : ''}
            ${divider()}
            <p style="margin:0;font-size:14px;color:#374151;">
              Need us sooner? ${waLink} or call ${callLink}.
            </p>
          `),
          `Application received for ${vehicle}`
        ),
      }

    // ── 2. Contacted ─────────────────────────────────────────────────────────
    case 'finance_contacted':
      return {
        subject: 'We tried to reach you — IC Cars Finance',
        html: layout(
          heroBlock('We Tried to Reach You', 'Please get in touch at your earliest convenience.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              One of our finance consultants recently attempted to contact you regarding your application for <strong>${vehicle}</strong>.
              We'd love to get things moving — please reach out at your earliest convenience.
            </p>
            ${agentNote(data.agent_message)}
            <p style="margin:0;font-size:14px;">${waLink} &nbsp;&middot;&nbsp; ${callLink}</p>
          `),
          'A consultant tried to reach you'
        ),
      }

    // ── 3. In review ─────────────────────────────────────────────────────────
    case 'finance_in_review':
      return {
        subject: 'Your finance application is under review — IC Cars',
        html: layout(
          heroBlock('Application Under Review', 'Our finance team is carefully assessing your profile.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              Your finance application for <strong>${vehicle}</strong> is currently being reviewed by our team.
              We assess each application thoroughly to find the best possible outcome for you.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We will be in touch as soon as we have an update — typically within 1–2 business days.
            </p>
            ${agentNote(data.agent_message)}
            ${divider()}
            <p style="margin:0;font-size:13px;color:${GRAY};">Questions? Contact us via ${waLink} or call ${callLink}.</p>
          `),
          'Your application is being reviewed'
        ),
      }

    // ── 4. Documents pending ──────────────────────────────────────────────────
    case 'finance_documents_pending':
      return {
        subject: 'Action required: Documents needed for your application — IC Cars',
        html: layout(
          heroBlock('Documents Required', 'We need a few documents to continue processing your application.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              To continue processing your finance application for <strong>${vehicle}</strong>, please supply the following documents:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
              ${[
                'South African ID (front)',
                'Proof of residence (not older than 3 months)',
                'Latest payslip',
                '3 months\' bank statements',
              ].map((item, i) => `
                <tr>
                  <td style="padding:9px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">
                    <span style="display:inline-block;background:${GOLD};color:${BLACK};font-size:10px;font-weight:800;padding:2px 7px;margin-right:10px;">${i + 1}</span>
                    ${item}
                  </td>
                </tr>`).join('')}
            </table>
            ${agentNote(data.agent_message)}
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
              Please reply to this email with your documents attached, or send them via ${waLink}.
            </p>
          `),
          'Documents needed to process your application'
        ),
      }

    // ── 5. Documents received ─────────────────────────────────────────────────
    case 'finance_documents_received':
      return {
        subject: 'Documents received — your application is progressing — IC Cars',
        html: layout(
          heroBlock('Documents Received', 'Thank you — we will take it from here.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We have received your supporting documents for your finance application on <strong>${vehicle}</strong>.
              Your file is now complete and is being prepared for bank submission.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We will keep you updated every step of the way.
            </p>
            ${agentNote(data.agent_message)}
            ${divider()}
            <p style="margin:0;font-size:13px;color:${GRAY};">Need anything? ${waLink} or call ${callLink}.</p>
          `),
          'Documents received — moving forward'
        ),
      }

    // ── 6. Submitted to bank ──────────────────────────────────────────────────
    case 'finance_submitted_to_bank':
      return {
        subject: 'Your application has been submitted to the bank — IC Cars',
        html: layout(
          heroBlock('Submitted to Bank', 'Your application is now with the lender.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              Your finance application for <strong>${vehicle}</strong> has been formally submitted to the bank for assessment.
            </p>
            ${data.bank_ref ? infoTable([['Bank Reference', data.bank_ref]]) : ''}
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              The bank typically takes 24–48 hours to process. We will contact you immediately once we receive their decision.
            </p>
            ${agentNote(data.agent_message)}
            ${divider()}
            <p style="margin:0;font-size:13px;color:${GRAY};">Questions in the meantime? ${waLink}.</p>
          `),
          'Your application is now with the bank'
        ),
      }

    // ── 7. Approved ───────────────────────────────────────────────────────────
    case 'finance_approved':
      return {
        subject: 'Congratulations — your finance has been approved! — IC Cars',
        html: layout(
          `<div style="background:${BLACK};padding:40px 40px 32px;border-bottom:3px solid ${GOLD};">
             <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:${GOLD};letter-spacing:0.15em;text-transform:uppercase;">Approved</p>
             <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${WHITE};line-height:1.2;">Your Finance is Approved</h1>
             <p style="margin:0;color:${GRAY};font-size:14px;line-height:1.6;">Congratulations — let's get you into your new vehicle.</p>
           </div>` +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We are thrilled to let you know that your finance application for <strong>${vehicle}</strong>
              has been <strong style="color:#15803d;">approved</strong>!
            </p>
            ${(monthly || maxLoan) ? infoTable([
              ...(monthly  ? [['Estimated Monthly Instalment', monthly]  as [string,string]] : []),
              ...(maxLoan  ? [['Approved Up To',               maxLoan]  as [string,string]] : []),
              ...(data.term ? [['Term',                         `${data.term} months`] as [string,string]] : []),
            ]) : ''}
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
              Our team will contact you shortly to guide you through the final steps and get you behind the wheel.
            </p>
            ${ctaButton('Chat With Us on WhatsApp', 'https://wa.me/27726921127')}
            ${agentNote(data.agent_message)}
          `),
          `Finance approved for ${vehicle}!`
        ),
      }

    // ── 8. Declined ───────────────────────────────────────────────────────────
    case 'finance_declined':
      return {
        subject: 'Update on your finance application — IC Cars',
        html: layout(
          heroBlock('Application Update', 'We have an update regarding your recent application.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              Thank you for applying for finance through IC Cars for <strong>${vehicle}</strong>.
              Unfortunately, on this occasion your application was not successful.
            </p>
            <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7;">
              This does not mean finance is permanently out of reach. There may be alternatives available:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;">
              ${[
                'A larger deposit to reduce the loan amount',
                'A more affordable vehicle',
                'Applying with a co-applicant',
                'Addressing any adverse listings on your credit profile',
              ].map((item, i) => `
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">
                    <span style="display:inline-block;width:6px;height:6px;background:${GOLD};margin-right:10px;vertical-align:middle;"></span>
                    ${item}
                  </td>
                </tr>`).join('')}
            </table>
            ${agentNote(data.agent_message)}
            <p style="margin:0;font-size:14px;color:#374151;">
              Our consultants are happy to discuss your options. Please don't hesitate to get in touch — ${waLink} or call ${callLink}.
            </p>
          `),
          `An update on your application for ${vehicle}`
        ),
      }

    // ── 9. Withdrawn ──────────────────────────────────────────────────────────
    case 'finance_withdrawn':
      return {
        subject: 'Your finance application has been closed — IC Cars',
        html: layout(
          heroBlock('Application Closed', 'Your application has been marked as withdrawn.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              This is to confirm that your finance application for <strong>${vehicle}</strong> has been closed.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              If this was done in error, or if your circumstances change in the future and you'd like to reapply, we'd be happy to assist.
            </p>
            ${agentNote(data.agent_message)}
            <p style="margin:0;font-size:14px;">${waLink} &nbsp;&middot;&nbsp; ${callLink}</p>
          `),
          'Your application has been closed'
        ),
      }

    // ── 10. Contact form acknowledgement ─────────────────────────────────────
    case 'contact_acknowledgement':
      return {
        subject: 'We\'ve received your message — IC Cars',
        html: layout(
          heroBlock('Message Received', 'Thank you for getting in touch with us.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              Thank you for contacting IC Cars. We have received your message and one of our team members will
              get back to you as soon as possible — usually within 1 business day.
            </p>
            ${data.subject ? infoTable([['Subject', data.subject]]) : ''}
            ${divider()}
            <p style="margin:0;font-size:13px;color:${GRAY};">
              Need a quicker response? ${waLink} or call ${callLink}.
            </p>
          `),
          'We\'ll be in touch soon'
        ),
      }

    // ── 11. Agent reply to contact enquiry ────────────────────────────────────
    case 'contact_reply':
      return {
        subject: data.reply_subject || `Re: ${data.original_subject || 'Your enquiry'} — IC Cars`,
        html: layout(
          heroBlock('Reply from IC Cars', 'A member of our team has responded to your enquiry.') +
          bodyWrap(`
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
            <div style="background:${LIGHT};border-left:3px solid ${GOLD};padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.8;">${(data.reply_message || '').replace(/\n/g, '<br/>')}</p>
            </div>
            ${divider()}
            <p style="margin:0 0 8px;font-size:13px;color:${GRAY};">
              You can reply directly to this email, or reach us via:
            </p>
            <p style="margin:0;font-size:13px;color:#374151;">
              ${waLink} &nbsp;&middot;&nbsp; ${callLink}
            </p>
          `),
          'IC Cars has replied to your enquiry'
        ),
      }

    default:
      throw new Error(`Unknown email template: ${template}`)
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload: EmailPayload = await req.json()
    const { template, to, data } = payload

    if (!template || !to) {
      return NextResponse.json({ error: 'Missing template or recipient' }, { status: 400 })
    }

    const { subject, html } = buildEmail(template, data)

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `"IC Cars" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      ...(data.reply_to ? { replyTo: data.reply_to } : {}),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Email API Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}