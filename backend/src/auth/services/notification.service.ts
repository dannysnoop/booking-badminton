import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private configService: ConfigService) {}

  async sendOtpEmail(
    email: string,
    code: string,
    expiresInMinutes: number,
  ): Promise<void> {
    // Mock implementation for testing
    // In production, integrate with SendGrid, AWS SES, or other email service
    this.logger.log(
      `[MOCK EMAIL] Sending OTP to ${email}: ${code} (expires in ${expiresInMinutes} minutes)`,
    );

    // Production implementation example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    // const msg = {
    //   to: email,
    //   from: this.configService.get('EMAIL_FROM'),
    //   subject: 'Xác thực tài khoản - Booking Badminton',
    //   html: this.getEmailTemplate(code, expiresInMinutes),
    // };
    // await sgMail.send(msg);
  }

  async sendOtpSms(phone: string, code: string): Promise<void> {
    // Mock implementation for testing
    // In production, integrate with Twilio, VNPT SMS, or other SMS service
    this.logger.log(`[MOCK SMS] Sending OTP to ${phone}: ${code}`);

    // Production implementation example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(
    //   this.configService.get('TWILIO_ACCOUNT_SID'),
    //   this.configService.get('TWILIO_AUTH_TOKEN'),
    // );
    // await client.messages.create({
    //   body: `Ma OTP cua ban la: ${code}. Ma nay se het han sau 10 phut.`,
    //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
    //   to: phone,
    // });
  }

  private getEmailTemplate(code: string, expiresInMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: #fff; border: 2px dashed #4CAF50; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Xác thực tài khoản</h1>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại Booking Badminton. Vui lòng sử dụng mã OTP dưới đây để xác thực tài khoản của bạn:</p>
              <div class="otp-code">${code}</div>
              <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau ${expiresInMinutes} phút.</p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Booking Badminton. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
