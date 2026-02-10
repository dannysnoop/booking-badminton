import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationStatus } from '../schemas/notification.schema';
import { NotificationTemplate, NotificationTemplateDocument, NotificationChannel } from '../schemas/notification-template.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationTemplate.name) private templateModel: Model<NotificationTemplateDocument>,
  ) {}

  async sendNotification(data: {
    userId: string;
    templateCode: string;
    variables?: Record<string, any>;
    data?: Record<string, any>;
  }) {
    const template = await this.templateModel.findOne({
      code: data.templateCode,
      isActive: true,
    });

    if (!template) {
      console.error(`Template not found: ${data.templateCode}`);
      return;
    }

    const title = this.replaceVariables(template.titleTemplate || '', data.variables || {});
    const content = this.replaceVariables(template.contentTemplate, data.variables || {});

    const notifications = [];

    for (const channel of template.channels) {
      const notification = await this.notificationModel.create({
        userId: data.userId,
        title,
        content,
        type: data.templateCode,
        channel,
        data: data.data,
        status: NotificationStatus.PENDING,
      });

      // Send based on channel
      await this.sendByChannel(notification, channel);

      notifications.push(notification);
    }

    return notifications;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId, channel: NotificationChannel.IN_APP })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({ userId, channel: NotificationChannel.IN_APP }),
      this.notificationModel.countDocuments({
        userId,
        channel: NotificationChannel.IN_APP,
        status: { $ne: NotificationStatus.READ },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (notification && notification.status !== NotificationStatus.READ) {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      {
        userId,
        channel: NotificationChannel.IN_APP,
        status: { $ne: NotificationStatus.READ },
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    return { message: 'Tất cả thông báo đã được đánh dấu đã đọc' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    await this.notificationModel.deleteOne({
      _id: notificationId,
      userId,
    });

    return { message: 'Thông báo đã được xóa' };
  }

  private async sendByChannel(notification: NotificationDocument, channel: NotificationChannel) {
    try {
      switch (channel) {
        case NotificationChannel.IN_APP:
          // Already saved to DB, mark as sent
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          break;

        case NotificationChannel.EMAIL:
          // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
          console.log(`[EMAIL] To: ${notification.userId}, Subject: ${notification.title}`);
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          break;

        case NotificationChannel.SMS:
          // TODO: Integrate with SMS service (Twilio, etc.)
          console.log(`[SMS] To: ${notification.userId}, Message: ${notification.content}`);
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          break;

        case NotificationChannel.PUSH:
          // TODO: Integrate with push notification service (FCM, APNs)
          console.log(`[PUSH] To: ${notification.userId}, Title: ${notification.title}`);
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          break;
      }

      await notification.save();
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      await notification.save();
    }
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  // Template management
  async createTemplate(data: {
    code: string;
    channels: NotificationChannel[];
    titleTemplate?: string;
    contentTemplate: string;
    scheduleType: string;
    delaySeconds?: number;
  }) {
    return this.templateModel.create(data);
  }

  async getTemplates() {
    return this.templateModel.find({ isActive: true }).lean().exec();
  }

  async initializeDefaultTemplates() {
    const templates = [
      {
        code: 'BOOKING_CONFIRMED',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        titleTemplate: 'Đặt sân thành công',
        contentTemplate: 'Booking #{{bookingId}} của bạn đã được xác nhận cho {{courtName}} vào {{date}} lúc {{time}}.',
        scheduleType: 'IMMEDIATE',
      },
      {
        code: 'BOOKING_CANCELLED',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        titleTemplate: 'Booking đã bị hủy',
        contentTemplate: 'Booking #{{bookingId}} của bạn đã bị hủy. Lý do: {{reason}}',
        scheduleType: 'IMMEDIATE',
      },
      {
        code: 'GROUP_INVITE',
        channels: [NotificationChannel.IN_APP, NotificationChannel.SMS],
        titleTemplate: 'Lời mời tham gia nhóm',
        contentTemplate: '{{hostName}} mời bạn tham gia booking nhóm. Mã: {{inviteCode}}',
        scheduleType: 'IMMEDIATE',
      },
      {
        code: 'PAYMENT_SUCCESS',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        titleTemplate: 'Thanh toán thành công',
        contentTemplate: 'Bạn đã thanh toán {{amount}} VND cho booking #{{bookingId}}.',
        scheduleType: 'IMMEDIATE',
      },
      {
        code: 'BOOKING_REMINDER',
        channels: [NotificationChannel.IN_APP, NotificationChannel.SMS, NotificationChannel.PUSH],
        titleTemplate: 'Nhắc nhở booking',
        contentTemplate: 'Bạn có booking tại {{courtName}} vào {{time}}. Đừng quên nhé!',
        scheduleType: 'DELAYED',
        delaySeconds: -3600, // 1 hour before
      },
    ];

    for (const template of templates) {
      const existing = await this.templateModel.findOne({ code: template.code });
      if (!existing) {
        await this.templateModel.create(template);
      }
    }
  }
}

