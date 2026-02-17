import { Injectable } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  private sgMail: MailService;

  constructor() {
    this.sgMail = new MailService();
    const key = process.env.SENDGRID_API_KEY;
    if (key) this.sgMail.setApiKey(key);
  }

  async sendEmail(params: { to: string; subject: string; text: string; html?: string }) {
    if (!process.env.SENDGRID_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SendGrid] No API key. Would send:', { to: params.to, subject: params.subject });
      }
      return { success: true };
    }
    try {
      await this.sgMail.send({
        to: params.to,
        from: (process.env.SENDGRID_FROM_EMAIL as string) || 'noreply@example.com',
        subject: params.subject,
        text: params.text,
        html: params.html ?? params.text.replace(/\n/g, '<br>'),
      });
      return { success: true };
    } catch (err) {
      console.error('[SendGrid]', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown' };
    }
  }

  async notifyNewContact(params: { name: string; email: string; phone?: string; message: string; vehicleTitle?: string }) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('[SendGrid] ADMIN_EMAIL no definido');
      return { success: true };
    }
    const text = [
      `Nombre: ${params.name}`,
      `Email: ${params.email}`,
      params.phone ? `Teléfono: ${params.phone}` : '',
      params.vehicleTitle ? `Vehículo: ${params.vehicleTitle}` : '',
      '',
      params.message,
    ]
      .filter(Boolean)
      .join('\n');
    return this.sendEmail({
      to: adminEmail,
      subject: `Nuevo contacto: ${params.name}`,
      text,
      html: text.replace(/\n/g, '<br>'),
    });
  }
}
