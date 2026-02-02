import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('registration_logs')
export class RegistrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index('idx_logs_user_id')
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, length: 255 })
  email: string | null;

  @Column({ nullable: true, length: 20 })
  phone: string | null;

  @Column({ name: 'event_type', length: 50 })
  eventType: string; // 'register', 'verify_success', 'verify_failed', 'resend_otp'

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string | null;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  @Index('idx_logs_created_at')
  createdAt: Date;
}
