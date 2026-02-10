import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
    status?: string;
    errorMessage?: string;
    metadata?: any;
  }) {
    await this.auditLogModel.create({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      oldData: data.oldData,
      newData: data.newData,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'SUCCESS',
      errorMessage: data.errorMessage,
      metadata: data.metadata,
    });
  }

  async getUserAuditLogs(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments({ userId }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { userId, action, resource, startDate, endDate, page = 1, limit = 50 } = filters;

    const query: any = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditStats(startDate: Date, endDate: Date) {
    const statsByAction = await this.auditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const statsByResource = await this.auditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const statsByUser = await this.auditLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      byAction: statsByAction,
      byResource: statsByResource,
      topUsers: statsByUser,
    };
  }

  async detectAnomalies(userId: string, timeWindowMinutes = 60) {
    const startTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // Detect high frequency actions
    const recentActions = await this.auditLogModel.countDocuments({
      userId,
      createdAt: { $gte: startTime },
    });

    const threshold = 100; // 100 actions in time window is suspicious
    const isAnomaly = recentActions > threshold;

    // Detect failed login attempts
    const failedLogins = await this.auditLogModel.countDocuments({
      userId,
      action: 'LOGIN',
      status: 'FAILED',
      createdAt: { $gte: startTime },
    });

    const failedLoginThreshold = 5;
    const isSuspiciousLogin = failedLogins > failedLoginThreshold;

    return {
      isAnomaly: isAnomaly || isSuspiciousLogin,
      details: {
        recentActions,
        threshold,
        failedLogins,
        failedLoginThreshold,
        timeWindowMinutes,
      },
    };
  }
}

