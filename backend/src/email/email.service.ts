import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP configuration missing, emails will be logged to console');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, userName?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - Hookly</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #4f46e5; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { color: #6b7280; font-size: 14px; text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Hookly!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Hi${userName ? ` ${userName}` : ''},</p>
              <p>Thank you for signing up for Hookly! To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
              
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <p>Best regards,<br>The Hookly Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"Hookly" <${this.configService.get<string>('SMTP_FROM_EMAIL', 'noreply@hookly.com')}>`,
      to: email,
      subject: 'Verify Your Email - Hookly',
      html,
    };

    return this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string, userName?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - Hookly</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #dc2626; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { color: #6b7280; font-size: 14px; text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi${userName ? ` ${userName}` : ''},</p>
              <p>We received a request to reset your password for your Hookly account. Click the button below to create a new password:</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
              
              <p><strong>This link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>The Hookly Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"Hookly" <${this.configService.get<string>('SMTP_FROM_EMAIL', 'noreply@hookly.com')}>`,
      to: email,
      subject: 'Reset Your Password - Hookly',
      html,
    };

    return this.sendEmail(mailOptions);
  }

  private async sendEmail(mailOptions: nodemailer.SendMailOptions) {
    try {
      if (!this.transporter) {
        console.log('📧 Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html?.toString().substring(0, 200) + '...'
        });
        return { success: true, messageId: 'dev-mode' };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('📧 Email send failed:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}