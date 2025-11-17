import { Resend } from 'resend'

// Initialize Resend with API key from environment
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface FormField {
  id: string
  label: string
  type: string
}

interface ResponseData {
  fieldId: string
  value: unknown
}

interface EmailNotificationData {
  formName: string
  formId: string
  responseId: string
  fields: FormField[]
  responseData: ResponseData[]
  submittedAt: string
  ip?: string | null
}

/**
 * Formats the response value for display in email
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '(não respondido)'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '(vazio)'
  }

  return String(value)
}

/**
 * Generates HTML email template for new form response notification
 */
function generateEmailHTML(data: EmailNotificationData): string {
  const fieldRows = data.fields
    .map((field) => {
      const responseField = data.responseData.find((r) => r.fieldId === field.id)
      const value = formatValue(responseField?.value)

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            ${field.label}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            ${value}
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Resposta - ${data.formName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
        Nova Resposta Recebida
      </h1>
      <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
        ${data.formName}
      </p>
    </div>

    <!-- Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Metadata -->
      <div style="margin-bottom: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
          <strong>Data/Hora:</strong> ${new Date(data.submittedAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        ${data.ip ? `
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          <strong>IP:</strong> ${data.ip}
        </p>
        ` : ''}
      </div>

      <!-- Responses Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
              Campo
            </th>
            <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
              Resposta
            </th>
          </tr>
        </thead>
        <tbody>
          ${fieldRows}
        </tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
          Esta é uma notificação automática do seu formulário.<br>
          Para gerenciar as notificações, acesse as configurações do formulário.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generates plain text version of the email
 */
function generateEmailText(data: EmailNotificationData): string {
  const fieldLines = data.fields
    .map((field) => {
      const responseField = data.responseData.find((r) => r.fieldId === field.id)
      const value = formatValue(responseField?.value)
      return `${field.label}: ${value}`
    })
    .join('\n')

  return `
Nova Resposta Recebida

Formulário: ${data.formName}
Data/Hora: ${new Date(data.submittedAt).toLocaleString('pt-BR')}
${data.ip ? `IP: ${data.ip}` : ''}

Respostas:
${fieldLines}

---
Esta é uma notificação automática do seu formulário.
Para gerenciar as notificações, acesse as configurações do formulário.
  `.trim()
}

/**
 * Sends email notification for new form response
 */
export async function sendResponseNotification(
  recipientEmail: string,
  data: EmailNotificationData
): Promise<{ success: boolean; error?: string }> {
  // Check if Resend is configured
  if (!resend) {
    console.warn('Resend not configured - skipping email notification')
    return {
      success: false,
      error: 'RESEND_API_KEY not configured',
    }
  }

  try {
    const html = generateEmailHTML(data)
    const text = generateEmailText(data)

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FormBuilder <noreply@formbuilder.com>',
      to: recipientEmail,
      subject: `Nova resposta: ${data.formName}`,
      html,
      text,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
