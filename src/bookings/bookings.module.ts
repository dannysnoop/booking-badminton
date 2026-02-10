import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './bookings.controller';
import { BookingService } from './services/booking.service';
import { GroupService } from './services/group.service';
import { ChatService } from './services/chat.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { GroupBooking, GroupBookingSchema } from './schemas/group-booking.schema';
import { GroupMember, GroupMemberSchema } from './schemas/group-member.schema';
import { GroupChatMessage, GroupChatMessageSchema } from './schemas/group-chat-message.schema';
import { Court, CourtSchema } from '../courts/schemas/court.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: GroupBooking.name, schema: GroupBookingSchema },
      { name: GroupMember.name, schema: GroupMemberSchema },
      { name: GroupChatMessage.name, schema: GroupChatMessageSchema },
      { name: Court.name, schema: CourtSchema },
    ]),
    AuthModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, GroupService, ChatService],
  exports: [BookingService, GroupService, ChatService],
})
export class BookingsModule {}

