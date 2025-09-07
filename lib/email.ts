export interface EmailAttachment {
  filename: string
  contentBase64: string
  contentType?: string
}

export interface SendEmailParams {
  from: string
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(params: SendEmailParams): Promise<{ id?: string }> {
  const { from, to, subject, html, attachments } = params

  // Try Resend first if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      const response = await resend.emails.send({
        from: process.env.RESEND_FROM || from,
        to: [to],
        subject,
        html,
        attachments: (attachments || []).map((a) => ({ filename: a.filename, content: a.contentBase64 })),
      })
      if (response.error) throw response.error
      return { id: response.data?.id }
    } catch (err) {
      // Fall through to SendGrid
    }
  }

  // Fallback to SendGrid (works with Single Sender, no domain needed)
  if (process.env.SENDGRID_API_KEY) {
    const sgFrom = process.env.SENDGRID_FROM || from
    const body = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: sgFrom },
      subject,
      content: [{ type: "text/html", value: html }],
      attachments: (attachments || []).map((a) => ({
        content: a.contentBase64,
        filename: a.filename,
        type: a.contentType || "application/octet-stream",
        disposition: "attachment",
      })),
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SendGrid error ${res.status}: ${text}`)
    }
    return {}
  }

  // Fallback to Gmail OAuth2 via Nodemailer (no app password)
  if (
    process.env.GMAIL_OAUTH_CLIENT_ID &&
    process.env.GMAIL_OAUTH_CLIENT_SECRET &&
    process.env.GMAIL_OAUTH_REFRESH_TOKEN &&
    process.env.GMAIL_FROM
  ) {
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_FROM,
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      },
    })

    const info = await transporter.sendMail({
      from: from || process.env.GMAIL_FROM,
      to,
      subject,
      html,
      attachments: (attachments || []).map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.contentBase64, "base64"),
        contentType: a.contentType,
      })),
    })

    return { id: info.messageId }
  }

  throw new Error("No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY.")
}


