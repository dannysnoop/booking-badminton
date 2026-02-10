import {Inject, Injectable} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Types} from "mongoose";
import { Cache } from 'cache-manager';

@Injectable()
export class NotificationService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}


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
    //   const cacheKey = `otp:${userId}:email`; // Assume email for now
    // await this.cacheManager.set(cacheKey, code);
  }

  async sendOtpDemoCache( code: string, expiryMinutes: number , userId: Types.ObjectId): Promise<void> {
    const cacheKey = `otp:${userId}:email`; // Assume email for now
    await this.cacheManager.set(cacheKey, code , expiryMinutes * 60 * 1000);
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

  async sendPasswordResetEmail(email: string, resetLink: string, fullName: string): Promise<void> {
    console.log(`[EMAIL] Sending password reset link to ${email}`);
    console.log(`Reset link: ${resetLink}`);

    // TODO: Implement actual email sending
    // const msg = {
    //   to: email,
    //   from: process.env.EMAIL_FROM,
    //   subject: 'Đặt lại mật khẩu',
    //   text: `Xin chào ${fullName},\n\nClick vào link sau để đặt lại mật khẩu: ${resetLink}\n\nLink có hiệu lực trong 1 giờ.`,
    //   html: `<p>Xin chào <strong>${fullName}</strong>,</p><p>Click vào link sau để đặt lại mật khẩu:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Link có hiệu lực trong 1 giờ.</p>`,
    // };
  }

  async sendPasswordChangedEmail(email: string, fullName: string): Promise<void> {
    console.log(`[EMAIL] Sending password changed confirmation to ${email}`);

    // TODO: Implement actual email sending
    // const msg = {
    //   to: email,
    //   from: process.env.EMAIL_FROM,
    //   subject: 'Mật khẩu đã được thay đổi',
    //   text: `Xin chào ${fullName},\n\nMật khẩu của bạn đã được thay đổi thành công.\n\nNếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay.`,
    //   html: `<p>Xin chào <strong>${fullName}</strong>,</p><p>Mật khẩu của bạn đã được thay đổi thành công.</p><p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay.</p>`,
    // };
  }
}
