import nodemailer, { Transporter } from "nodemailer";

// Porta de saida de email. A aplicacao e os controllers dependem desta
// interface, nunca da implementacao concreta (facilita testes e troca de provedor).
export interface Mailer {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export class EmailService implements Mailer {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
        : undefined,
    });
    this.from = process.env.SMTP_FROM || "Oxetech Helpdesk <no-reply@oxetech.com>";
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({ from: this.from, to, subject, text: body });
    console.log(`Email enviado para ${to} - Assunto: ${subject}`);
  }
}
