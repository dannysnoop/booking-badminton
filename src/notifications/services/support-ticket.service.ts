import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket, SupportTicketDocument, TicketStatus, TicketPriority } from '../schemas/support-ticket.schema';
import { TicketMessage, TicketMessageDocument } from '../schemas/ticket-message.schema';

@Injectable()
export class SupportTicketService {
  constructor(
    @InjectModel(SupportTicket.name) private ticketModel: Model<SupportTicketDocument>,
    @InjectModel(TicketMessage.name) private messageModel: Model<TicketMessageDocument>,
  ) {}

  async createTicket(data: {
    userId: string;
    subject: string;
    description: string;
    category: string;
    priority?: TicketPriority;
    attachments?: string[];
  }) {
    const ticketNumber = await this.generateTicketNumber();

    const ticket = await this.ticketModel.create({
      ticketNumber,
      userId: data.userId,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority || TicketPriority.MEDIUM,
      attachments: data.attachments || [],
      status: TicketStatus.OPEN,
    });

    // Create initial message
    await this.messageModel.create({
      ticketId: ticket._id,
      userId: data.userId,
      message: data.description,
      isStaffReply: false,
      attachments: data.attachments || [],
    });

    return ticket;
  }

  async getUserTickets(userId: string, status?: string) {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    return this.ticketModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getTicketById(ticketId: string, userId: string) {
    const ticket = await this.ticketModel.findById(ticketId).lean().exec();

    if (!ticket) {
      throw new NotFoundException('Ticket không tồn tại');
    }

    // Check access - user can only view their own tickets (unless staff)
    if (ticket.userId.toString() !== userId) {
      // TODO: Check if user is staff
      throw new ForbiddenException('Bạn không có quyền xem ticket này');
    }

    const messages = await this.messageModel
      .find({ ticketId, isInternal: false })
      .populate('userId', 'fullName avatarUrl')
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return {
      ticket,
      messages,
    };
  }

  async addMessage(data: {
    ticketId: string;
    userId: string;
    message: string;
    isStaffReply?: boolean;
    attachments?: string[];
    isInternal?: boolean;
  }) {
    const ticket = await this.ticketModel.findById(data.ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket không tồn tại');
    }

    // Check access
    if (!data.isStaffReply && ticket.userId.toString() !== data.userId) {
      throw new ForbiddenException('Bạn không có quyền reply ticket này');
    }

    const message = await this.messageModel.create({
      ticketId: data.ticketId,
      userId: data.userId,
      message: data.message,
      isStaffReply: data.isStaffReply || false,
      attachments: data.attachments || [],
      isInternal: data.isInternal || false,
    });

    // Update ticket status if customer replies
    if (!data.isStaffReply && ticket.status === TicketStatus.WAITING_FOR_CUSTOMER) {
      ticket.status = TicketStatus.IN_PROGRESS;
      await ticket.save();
    }

    return message;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, userId: string) {
    const ticket = await this.ticketModel.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket không tồn tại');
    }

    ticket.status = status;

    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
      ticket.closedBy = userId as any;
    }

    await ticket.save();

    return ticket;
  }

  async assignTicket(ticketId: string, assignedTo: string) {
    const ticket = await this.ticketModel.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket không tồn tại');
    }

    ticket.assignedTo = assignedTo as any;
    ticket.status = TicketStatus.IN_PROGRESS;
    await ticket.save();

    return ticket;
  }

  async getAllTickets(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, priority, category, assignedTo, page = 1, limit = 20 } = filters;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.ticketModel
        .find(query)
        .populate('userId', 'fullName email')
        .populate('assignedTo', 'fullName')
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.ticketModel.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketStats() {
    const [total, open, inProgress, resolved] = await Promise.all([
      this.ticketModel.countDocuments(),
      this.ticketModel.countDocuments({ status: TicketStatus.OPEN }),
      this.ticketModel.countDocuments({ status: TicketStatus.IN_PROGRESS }),
      this.ticketModel.countDocuments({ status: TicketStatus.RESOLVED }),
    ]);

    const byCategory = await this.ticketModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byPriority = await this.ticketModel.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total,
      byStatus: {
        open,
        inProgress,
        resolved,
      },
      byCategory,
      byPriority,
    };
  }

  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.ticketModel.countDocuments();
    const number = String(count + 1).padStart(5, '0');
    return `TICKET-${year}-${number}`;
  }
}

