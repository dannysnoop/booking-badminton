import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbuseReport, AbuseReportDocument, ReportStatus, ReportReason } from '../schemas/abuse-report.schema';

@Injectable()
export class AbuseReportService {
  constructor(
    @InjectModel(AbuseReport.name) private reportModel: Model<AbuseReportDocument>,
  ) {}

  async createReport(data: {
    reporterId: string;
    resourceType: string;
    resourceId: string;
    reason: ReportReason;
    description: string;
    evidence?: string[];
  }) {
    // Check if user already reported this resource
    const existingReport = await this.reportModel.findOne({
      reporterId: data.reporterId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      status: { $in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] },
    });

    if (existingReport) {
      throw new BadRequestException('Bạn đã báo cáo resource này rồi');
    }

    const report = await this.reportModel.create({
      reporterId: data.reporterId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      reason: data.reason,
      description: data.description,
      evidence: data.evidence || [],
      status: ReportStatus.PENDING,
    });

    return report;
  }

  async getUserReports(userId: string) {
    return this.reportModel
      .find({ reporterId: userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getAllReports(filters: {
    status?: string;
    resourceType?: string;
    reason?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, resourceType, reason, page = 1, limit = 20 } = filters;

    const query: any = {};
    if (status) query.status = status;
    if (resourceType) query.resourceType = resourceType;
    if (reason) query.reason = reason;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportModel
        .find(query)
        .populate('reporterId', 'fullName email')
        .populate('reviewedBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.reportModel.countDocuments(query),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReportById(reportId: string) {
    const report = await this.reportModel
      .findById(reportId)
      .populate('reporterId', 'fullName email')
      .populate('reviewedBy', 'fullName')
      .lean()
      .exec();

    if (!report) {
      throw new NotFoundException('Report không tồn tại');
    }

    return report;
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    reviewedBy: string,
    resolution?: string,
    actionTaken?: string,
  ) {
    const report = await this.reportModel.findById(reportId);

    if (!report) {
      throw new NotFoundException('Report không tồn tại');
    }

    report.status = status;
    report.reviewedBy = reviewedBy as any;
    report.reviewedAt = new Date();

    if (resolution) {
      report.resolution = resolution;
    }

    if (actionTaken) {
      report.actionTaken = actionTaken;
    }

    await report.save();

    // TODO: Take action based on actionTaken (suspend user, remove content, etc.)

    return report;
  }

  async getReportStats() {
    const [total, pending, underReview, resolved] = await Promise.all([
      this.reportModel.countDocuments(),
      this.reportModel.countDocuments({ status: ReportStatus.PENDING }),
      this.reportModel.countDocuments({ status: ReportStatus.UNDER_REVIEW }),
      this.reportModel.countDocuments({ status: ReportStatus.RESOLVED }),
    ]);

    const byReason = await this.reportModel.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byResourceType = await this.reportModel.aggregate([
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get most reported resources
    const mostReported = await this.reportModel.aggregate([
      {
        $group: {
          _id: {
            resourceType: '$resourceType',
            resourceId: '$resourceId',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      total,
      byStatus: {
        pending,
        underReview,
        resolved,
      },
      byReason,
      byResourceType,
      mostReported,
    };
  }

  async getResourceReports(resourceType: string, resourceId: string) {
    return this.reportModel
      .find({ resourceType, resourceId })
      .populate('reporterId', 'fullName')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}

