import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendOtpEmail(email: string, code: string, expiryMinutes: number): Promise<void> {
    // Stub implementation for email sending
    // In production, use SendGrid or similar service
    console.log(`[EMAIL] Sending OTP ${code} to ${email}, expires in ${expiryMinutes} minutes`);
    
    // TODO: Implement actual email sending
    // Example with SendGrid:
    // const msg = {
    //   to: email,
    //   from: process.env.EMAIL_FROM,
    //   subject: 'Mã xác thực tài khoản',
    //   text: `Mã OTP của bạn là: ${code}. Mã có hiệu lực trong ${expiryMinutes} phút.`,
    //   html: `<p>Mã OTP của bạn là: <strong>${code}</strong></p><p>Mã có hiệu lực trong ${expiryMinutes} phút.</p>`,
    // };
    // await sgMail.send(msg);
  }

  async sendOtpSms(phone: string, code: string): Promise<void> {
    // Stub implementation for SMS sending
    // In production, use Twilio or similar service
    console.log(`[SMS] Sending OTP ${code} to ${phone}`);
    
    // TODO: Implement actual SMS sending
    // Example with Twilio:
    // await twilioClient.messages.create({
    //   body: `Mã OTP của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });
  }
}
