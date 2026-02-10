import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../../bookings/schemas/booking.schema';
import { Court, CourtDocument } from '../../courts/schemas/court.schema';
import { User, UserDocument } from '../../auth/schemas/user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getRevenueStats(startDate: Date, endDate: Date, courtId?: string) {
    const matchStage: any = {
      bookingDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'CANCELLED' },
      paymentStatus: { $in: ['PAID', 'PARTIAL'] },
    };

    if (courtId) {
      matchStage.courtId = courtId;
    }

    const revenueByDate = await this.bookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          },
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const totalRevenue = await this.bookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Revenue by court type
    const revenueByCourtType = await this.bookingModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'courts',
          localField: 'courtId',
          foreignField: '_id',
          as: 'court',
        },
      },
      { $unwind: '$court' },
      {
        $group: {
          _id: '$court.courtType',
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Revenue by time slot
    const revenueByTimeSlot = await this.bookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            hour: { $substr: ['$startTime', 0, 2] },
          },
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
    ]);

    return {
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalBookings: totalRevenue[0]?.count || 0,
        averageBookingValue: totalRevenue[0]
          ? Math.round(totalRevenue[0].total / totalRevenue[0].count)
          : 0,
      },
      revenueByDate: revenueByDate.map((item) => ({
        date: item._id.date,
        revenue: item.totalRevenue,
        bookings: item.bookingCount,
      })),
      revenueByCourtType: revenueByCourtType.map((item) => ({
        courtType: item._id,
        revenue: item.totalRevenue,
        bookings: item.bookingCount,
      })),
      revenueByTimeSlot: revenueByTimeSlot.map((item) => ({
        hour: item._id.hour,
        revenue: item.totalRevenue,
        bookings: item.bookingCount,
      })),
    };
  }

  async getOccupancyRate(startDate: Date, endDate: Date, courtId?: string) {
    const matchStage: any = {
      bookingDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'CANCELLED' },
    };

    if (courtId) {
      matchStage.courtId = courtId;
    }

    // Get total booked hours
    const bookedHours = await this.bookingModel.aggregate([
      { $match: matchStage },
      {
        $project: {
          courtId: 1,
          bookingDate: 1,
          duration: {
            $divide: [
              {
                $subtract: [
                  {
                    $add: [
                      { $multiply: [{ $toInt: { $substr: ['$endTime', 0, 2] } }, 60] },
                      { $toInt: { $substr: ['$endTime', 3, 2] } },
                    ],
                  },
                  {
                    $add: [
                      { $multiply: [{ $toInt: { $substr: ['$startTime', 0, 2] } }, 60] },
                      { $toInt: { $substr: ['$startTime', 3, 2] } },
                    ],
                  },
                ],
              },
              60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' },
        },
      },
    ]);

    // Calculate available hours (assuming 6:00-22:00 = 16 hours/day)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const courtCount = courtId ? 1 : await this.courtModel.countDocuments({ isActive: true });
    const availableHours = daysDiff * courtCount * 16; // 16 hours per day

    const occupancyRate =
      availableHours > 0 ? ((bookedHours[0]?.totalHours || 0) / availableHours) * 100 : 0;

    return {
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      bookedHours: bookedHours[0]?.totalHours || 0,
      availableHours,
      period: {
        startDate,
        endDate,
        days: daysDiff,
      },
    };
  }

  async getTopCourts(startDate: Date, endDate: Date, limit = 10) {
    const topCourts = await this.bookingModel.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate, $lte: endDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: '$courtId',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      {
        $lookup: {
          from: 'courts',
          localField: '_id',
          foreignField: '_id',
          as: 'court',
        },
      },
      { $unwind: '$court' },
      {
        $project: {
          courtId: '$_id',
          courtName: '$court.name',
          courtType: '$court.courtType',
          bookingCount: 1,
          totalRevenue: 1,
          averageRating: '$court.averageRating',
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ]);

    return topCourts;
  }

  async getUserStats(startDate: Date, endDate: Date) {
    const newUsers = await this.userModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const activeUsers = await this.bookingModel.distinct('userId', {
      bookingDate: { $gte: startDate, $lte: endDate },
    });

    const totalUsers = await this.userModel.countDocuments();

    return {
      totalUsers,
      newUsers,
      activeUsers: activeUsers.length,
      period: {
        startDate,
        endDate,
      },
    };
  }

  async getBookingTrends(startDate: Date, endDate: Date) {
    const trends = await this.bookingModel.aggregate([
      {
        $match: {
          bookingDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    return trends.map((item) => ({
      date: item._id.date,
      status: item._id.status,
      count: item.count,
    }));
  }

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayBookings = await this.bookingModel.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'CANCELLED' },
    });

    const todayRevenue = await this.bookingModel.aggregate([
      {
        $match: {
          bookingDate: { $gte: today, $lt: tomorrow },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    // Pending bookings
    const pendingBookings = await this.bookingModel.countDocuments({
      status: 'PENDING',
    });

    // Total courts
    const totalCourts = await this.courtModel.countDocuments({ isActive: true });

    // Total users
    const totalUsers = await this.userModel.countDocuments({ isActive: true });

    return {
      today: {
        bookings: todayBookings,
        revenue: todayRevenue[0]?.total || 0,
      },
      pending: {
        bookings: pendingBookings,
      },
      totals: {
        courts: totalCourts,
        users: totalUsers,
      },
    };
  }
}

