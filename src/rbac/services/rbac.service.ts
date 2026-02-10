import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { UserRole, UserRoleDocument } from '../schemas/user-role.schema';

export enum Permission {
  // Booking permissions
  BOOKING_CREATE = 'booking:create',
  BOOKING_VIEW_OWN = 'booking:view:own',
  BOOKING_VIEW_ALL = 'booking:view:all',
  BOOKING_UPDATE_OWN = 'booking:update:own',
  BOOKING_UPDATE_ALL = 'booking:update:all',
  BOOKING_DELETE_OWN = 'booking:delete:own',
  BOOKING_DELETE_ALL = 'booking:delete:all',

  // Court permissions
  COURT_CREATE = 'court:create',
  COURT_VIEW = 'court:view',
  COURT_UPDATE_OWN = 'court:update:own',
  COURT_UPDATE_ALL = 'court:update:all',
  COURT_DELETE_OWN = 'court:delete:own',
  COURT_DELETE_ALL = 'court:delete:all',

  // User permissions
  USER_VIEW_OWN = 'user:view:own',
  USER_VIEW_ALL = 'user:view:all',
  USER_UPDATE_OWN = 'user:update:own',
  USER_UPDATE_ALL = 'user:update:all',
  USER_DELETE = 'user:delete',

  // Analytics permissions
  ANALYTICS_VIEW_OWN = 'analytics:view:own',
  ANALYTICS_VIEW_ALL = 'analytics:view:all',
  ANALYTICS_EXPORT = 'analytics:export',

  // Role permissions
  ROLE_CREATE = 'role:create',
  ROLE_VIEW = 'role:view',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  ROLE_ASSIGN = 'role:assign',

  // Audit permissions
  AUDIT_VIEW = 'audit:view',
}

@Injectable()
export class RBACService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRoleDocument>,
  ) {}

  async createRole(name: string, displayName: string, permissions: string[], description?: string) {
    const existingRole = await this.roleModel.findOne({ name });
    if (existingRole) {
      throw new ForbiddenException('Role đã tồn tại');
    }

    const role = await this.roleModel.create({
      name,
      displayName,
      description,
      permissions,
      isSystem: false,
    });

    return role;
  }

  async updateRole(roleId: string, updates: Partial<Role>) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Không thể sửa system role');
    }

    Object.assign(role, updates);
    await role.save();

    return role;
  }

  async deleteRole(roleId: string) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Không thể xóa system role');
    }

    // Check if role is assigned to any users
    const assignedCount = await this.userRoleModel.countDocuments({ roleId, isActive: true });
    if (assignedCount > 0) {
      throw new ForbiddenException(`Role đang được gán cho ${assignedCount} user(s)`);
    }

    await role.deleteOne();
    return { message: 'Role đã được xóa' };
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    grantedBy: string,
    courtId?: string,
    expiresAt?: Date,
  ) {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    // Check if user already has this role
    const existingUserRole = await this.userRoleModel.findOne({
      userId,
      roleId,
      isActive: true,
      ...(courtId && { courtId }),
    });

    if (existingUserRole) {
      throw new ForbiddenException('User đã có role này rồi');
    }

    const userRole = await this.userRoleModel.create({
      userId,
      roleId,
      courtId,
      grantedBy,
      expiresAt,
    });

    return userRole;
  }

  async revokeRoleFromUser(userRoleId: string) {
    const userRole = await this.userRoleModel.findById(userRoleId);
    if (!userRole) {
      throw new NotFoundException('User role không tồn tại');
    }

    userRole.isActive = false;
    await userRole.save();

    return { message: 'Role đã được thu hồi' };
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.userRoleModel
      .find({ userId, isActive: true })
      .populate('roleId')
      .lean()
      .exec();

    return userRoles;
  }

  async getUserPermissions(userId: string, courtId?: string): Promise<string[]> {
    const query: any = { userId, isActive: true };
    if (courtId) {
      query.$or = [{ courtId }, { courtId: null }];
    }

    const userRoles = await this.userRoleModel
      .find(query)
      .populate('roleId')
      .lean()
      .exec();

    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      const role = userRole.roleId as any;
      if (role && role.permissions) {
        role.permissions.forEach((perm: string) => permissions.add(perm));
      }
    }

    return Array.from(permissions);
  }

  async checkPermission(userId: string, permission: string, courtId?: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, courtId);
    return permissions.includes(permission);
  }

  async getAllRoles() {
    return this.roleModel.find({ isActive: true }).lean().exec();
  }

  async initializeSystemRoles() {
    // Create default system roles if they don't exist
    const roles = [
      {
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: Object.values(Permission),
        isSystem: true,
      },
      {
        name: 'OWNER',
        displayName: 'Court Owner',
        description: 'Court owner with management access',
        permissions: [
          Permission.BOOKING_VIEW_ALL,
          Permission.BOOKING_UPDATE_ALL,
          Permission.COURT_CREATE,
          Permission.COURT_VIEW,
          Permission.COURT_UPDATE_OWN,
          Permission.COURT_DELETE_OWN,
          Permission.ANALYTICS_VIEW_OWN,
          Permission.ANALYTICS_EXPORT,
        ],
        isSystem: true,
      },
      {
        name: 'STAFF',
        displayName: 'Staff Member',
        description: 'Staff with limited access',
        permissions: [
          Permission.BOOKING_VIEW_ALL,
          Permission.BOOKING_UPDATE_ALL,
          Permission.COURT_VIEW,
          Permission.USER_VIEW_ALL,
        ],
        isSystem: true,
      },
      {
        name: 'USER',
        displayName: 'Regular User',
        description: 'Regular user access',
        permissions: [
          Permission.BOOKING_CREATE,
          Permission.BOOKING_VIEW_OWN,
          Permission.BOOKING_UPDATE_OWN,
          Permission.BOOKING_DELETE_OWN,
          Permission.COURT_VIEW,
          Permission.USER_VIEW_OWN,
          Permission.USER_UPDATE_OWN,
        ],
        isSystem: true,
      },
    ];

    for (const roleData of roles) {
      const existing = await this.roleModel.findOne({ name: roleData.name });
      if (!existing) {
        await this.roleModel.create(roleData);
      }
    }
  }
}

