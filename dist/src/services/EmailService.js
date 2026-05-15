// src/services/EmailService.ts
import nodemailer from 'nodemailer';
export class EmailService {
    transporter = null;
    constructor() {
        // Configuração básica usando SMTP
        // Pode ser configurado via variáveis de ambiente
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para outras
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
        // Se não tiver configurado, usa serviço de teste (apenas para desenvolvimento)
        if (!emailConfig.auth.user || !emailConfig.auth.pass) {
            console.warn('[EmailService] Credenciais SMTP não configuradas. Email será logado apenas.');
        }
        else {
            this.transporter = nodemailer.createTransport(emailConfig);
        }
    }
    async sendEmail(options) {
        if (!this.transporter) {
            // Em desenvolvimento, apenas loga o email
            console.log('[EmailService] Email (desenvolvimento):');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('Text:', options.text);
            if (options.html) {
                console.log('HTML:', options.html);
            }
            return;
        }
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html || options.text,
            });
            console.log(`[EmailService] Email enviado para ${options.to}`);
        }
        catch (error) {
            console.error('[EmailService] Erro ao enviar email:', error);
            throw new Error('email_send_failed');
        }
    }
    async sendReportEmail(reporterName, reporterEmail, reportedUid, reportedName, reason) {
        const subject = `Denúncia de Usuário - ${reportedName}`;
        const text = `
Denúncia de Usuário

Usuário que denunciou:
- Nome: ${reporterName}
- Email: ${reporterEmail}
- UID: ${(reporterEmail.match(/uid=([^&]+)/)?.[1]) || 'N/A'}

Usuário denunciado:
- Nome: ${reportedName}
- UID: ${reportedUid}

Motivo da denúncia:
${reason}

Data: ${new Date().toLocaleString('pt-BR')}
    `.trim();
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #374151; }
    .reason { background: white; padding: 15px; border-left: 4px solid #ef4444; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚨 Denúncia de Usuário</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>Usuário que denunciou:</h3>
        <p><span class="label">Nome:</span> ${reporterName}</p>
        <p><span class="label">Email:</span> ${reporterEmail}</p>
      </div>
      <div class="section">
        <h3>Usuário denunciado:</h3>
        <p><span class="label">Nome:</span> ${reportedName}</p>
        <p><span class="label">UID:</span> ${reportedUid}</p>
      </div>
      <div class="section">
        <h3>Motivo da denúncia:</h3>
        <div class="reason">${reason.replace(/\n/g, '<br>')}</div>
      </div>
      <div class="section">
        <p style="color: #6b7280; font-size: 14px;">
          Data: ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
        await this.sendEmail({
            to: 'suporte.coup@gmail.com',
            subject,
            text,
            html,
        });
    }
}
