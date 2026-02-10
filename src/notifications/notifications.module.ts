import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './services/notification.service';
import { SupportTicketService } from './services/support-ticket.service';
import { AbuseReportService } from './services/abuse-report.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationTemplate, NotificationTemplateSchema } from './schemas/notification-template.schema';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { TicketMessage, TicketMessageSchema } from './schemas/ticket-message.schema';
import { AbuseReport, AbuseReportSchema } from './schemas/abuse-report.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: TicketMessage.name, schema: TicketMessageSchema },
      { name: AbuseReport.name, schema: AbuseReportSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationService, SupportTicketService, AbuseReportService],
  exports: [NotificationService, SupportTicketService, AbuseReportService],
})
export class NotificationsModule {}

