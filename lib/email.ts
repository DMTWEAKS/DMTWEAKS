import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const smtpSecure = process.env.SMTP_SECURE === 'true'

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error('SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD')
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })
  }
  return transporter
}

export async function sendKeysEmail(
  customerEmail: string,
  productName: string,
  keys: string[]
) {
  try {
    if (!customerEmail || !productName || !keys || keys.length === 0) {
      return { success: false, error: 'Missing required parameters' }
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    if (!fromEmail) {
      return { success: false, error: 'SMTP_FROM_EMAIL or SMTP_USER not configured' }
    }

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .keys-list { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .key-item { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 10px; margin: 5px 0; border-left: 3px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Thank You for Your Purchase!</h1>
            </div>
            <div class="content">
              <h2>Your Product Keys</h2>
              <p>Your product keys for <strong>${productName}</strong> are ready:</p>
              
              <div class="keys-list">
                ${keys.map((key) => `
                  <div class="key-item">
                    <strong>${key}</strong>
                  </div>
                `).join('')}
              </div>
              
              <p><strong>Important:</strong> Please keep these keys safe and do not share them with anyone.</p>
              
              <p>If you have any questions or need support, please don't hesitate to contact us.</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} DM TWEAKS. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const mailTransporter = getTransporter()
    const info = await mailTransporter.sendMail({
      from: `"DM TWEAKS" <${fromEmail}>`,
      to: customerEmail,
      subject: `Your ${productName} Keys - DM TWEAKS`,
      html: emailContent,
    })

    return { 
      success: true, 
      message: 'Email sent successfully', 
      messageId: info.messageId,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to send email',
    }
  }
}

