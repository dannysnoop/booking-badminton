import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupChatMessage, GroupChatMessageDocument } from '../schemas/group-chat-message.schema';
import { GroupMember, GroupMemberDocument, MemberStatus } from '../schemas/group-member.schema';
import { SendMessageDto } from '../dto/booking.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(GroupChatMessage.name) private chatMessageModel: Model<GroupChatMessageDocument>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMemberDocument>,
  ) {}

  async sendMessage(groupBookingId: string, userId: string, sendMessageDto: SendMessageDto) {
    // Verify user is a member
    const member = await this.groupMemberModel.findOne({
      groupBookingId,
      userId,
      status: { $in: [MemberStatus.INVITED, MemberStatus.ACCEPTED] },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải thành viên của group này');
    }

    const message = await this.chatMessageModel.create({
      groupBookingId,
      senderId: userId,
      message: sendMessageDto.message,
      messageType: sendMessageDto.messageType || 'TEXT',
      attachments: sendMessageDto.attachments || [],
    });

    // TODO: Send real-time notification to group members

    return this.formatMessageResponse(message);
  }

  async getMessages(groupBookingId: string, userId: string, page = 1, limit = 50) {
    // Verify user is a member
    const member = await this.groupMemberModel.findOne({
      groupBookingId,
      userId,
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải thành viên của group này');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.chatMessageModel
        .find({ groupBookingId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'fullName avatarUrl')
        .lean()
        .exec(),
      this.chatMessageModel.countDocuments({ groupBookingId, isDeleted: false }),
    ]);

    return {
      messages: messages.reverse().map((m) => this.formatMessageResponse(m)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.chatMessageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message không tồn tại');
    }

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa message của mình');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return { message: 'Message đã được xóa' };
  }

  async sendSystemMessage(groupBookingId: string, message: string) {
    const systemMessage = await this.chatMessageModel.create({
      groupBookingId,
      senderId: null,
      message,
      messageType: 'SYSTEM',
    });

    return this.formatMessageResponse(systemMessage);
  }

  private formatMessageResponse(message: any) {
    return {
      id: message._id || message.id,
      groupBookingId: message.groupBookingId,
      senderId: message.senderId,
      message: message.message,
      messageType: message.messageType,
      attachments: message.attachments,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
    };
  }
}

