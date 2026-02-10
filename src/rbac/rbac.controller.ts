import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RBACService } from './services/rbac.service';
import { AuditLogService } from './services/audit-log.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, AuditLogQueryDto } from '../analytics/dto/analytics.dto';

@ApiTags('rbac')
@Controller('api/rbac')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RBACController {
  constructor(
    private readonly rbacService: RBACService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ==================== Roles ====================

  @Post('roles')
  @ApiOperation({ summary: 'Tạo role mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Role đã được tạo' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.rbacService.createRole(
      createRoleDto.name,
      createRoleDto.displayName,
      createRoleDto.permissions,
      createRoleDto.description,
    );

    return {
      success: true,
      data: result,
      message: 'Role đã được tạo',
    };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Lấy danh sách roles' })
  @ApiResponse({ status: 200, description: 'Danh sách roles' })
  async getRoles() {
    const result = await this.rbacService.getAllRoles();

    return {
      success: true,
      data: result,
    };
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Cập nhật role (Admin)' })
  @ApiResponse({ status: 200, description: 'Role đã được cập nhật' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const result = await this.rbacService.updateRole(id, updateRoleDto);

    return {
      success: true,
      data: result,
      message: 'Role đã được cập nhật',
    };
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Xóa role (Admin)' })
  @ApiResponse({ status: 200, description: 'Role đã được xóa' })
  async deleteRole(@Param('id') id: string) {
    const result = await this.rbacService.deleteRole(id);

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== User Roles ====================

  @Post('assign')
  @ApiOperation({ summary: 'Gán role cho user (Admin)' })
  @ApiResponse({ status: 201, description: 'Role đã được gán' })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser('userId') grantedBy: string,
  ) {
    const result = await this.rbacService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
      grantedBy,
      assignRoleDto.courtId,
      assignRoleDto.expiresAt ? new Date(assignRoleDto.expiresAt) : undefined,
    );

    return {
      success: true,
      data: result,
      message: 'Role đã được gán',
    };
  }

  @Delete('user-roles/:id')
  @ApiOperation({ summary: 'Thu hồi role từ user (Admin)' })
  @ApiResponse({ status: 200, description: 'Role đã được thu hồi' })
  async revokeRole(@Param('id') userRoleId: string) {
    const result = await this.rbacService.revokeRoleFromUser(userRoleId);

    return {
      success: true,
      message: result.message,
    };
  }

  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Lấy roles của user' })
  @ApiResponse({ status: 200, description: 'User roles' })
  async getUserRoles(@Param('userId') userId: string) {
    const result = await this.rbacService.getUserRoles(userId);

    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Lấy permissions của user' })
  @ApiResponse({ status: 200, description: 'User permissions' })
  async getUserPermissions(
    @Param('userId') userId: string,
    @Query('courtId') courtId?: string,
  ) {
    const result = await this.rbacService.getUserPermissions(userId, courtId);

    return {
      success: true,
      data: result,
    };
  }

  // ==================== Audit Logs ====================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Lấy audit logs (Admin)' })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    const result = await this.auditLogService.getAuditLogs({
      userId: query.userId,
      action: query.action,
      resource: query.resource,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: query.page,
      limit: query.limit,
    });

    return {
      success: true,
      data: result.logs,
      pagination: result.pagination,
    };
  }

  @Get('audit-logs/stats')
  @ApiOperation({ summary: 'Thống kê audit logs (Admin)' })
  @ApiResponse({ status: 200, description: 'Audit stats' })
  async getAuditStats(@Query() query: AuditLogQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const result = await this.auditLogService.getAuditStats(startDate, endDate);

    return {
      success: true,
      data: result,
    };
  }

  @Get('audit-logs/anomalies/:userId')
  @ApiOperation({ summary: 'Phát hiện hành vi bất thường (Admin)' })
  @ApiResponse({ status: 200, description: 'Anomaly detection' })
  async detectAnomalies(@Param('userId') userId: string) {
    const result = await this.auditLogService.detectAnomalies(userId);

    return {
      success: true,
      data: result,
    };
  }
}

