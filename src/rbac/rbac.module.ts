import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RBACController } from './rbac.controller';
import { RBACService } from './services/rbac.service';
import { AuditLogService } from './services/audit-log.service';
import { Role, RoleSchema } from './schemas/role.schema';
import { UserRole, UserRoleSchema } from './schemas/user-role.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: UserRole.name, schema: UserRoleSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    AuthModule,
  ],
  controllers: [RBACController],
  providers: [RBACService, AuditLogService],
  exports: [RBACService, AuditLogService],
})
export class RBACModule {}

