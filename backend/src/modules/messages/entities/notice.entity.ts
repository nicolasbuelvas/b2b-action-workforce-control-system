import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @Column({ name: 'target_type', type: 'varchar', length: 50 })
  targetType: string; // 'ROLE', 'CATEGORY', 'USER', 'ALL'

  @Column({ name: 'target_role_ids', type: 'uuid', array: true, nullable: true })
  targetRoleIds: string[];

  @Column({ name: 'target_category_ids', type: 'uuid', array: true, nullable: true })
  targetCategoryIds: string[];

  @Column({ name: 'target_user_ids', type: 'uuid', array: true, nullable: true })
  targetUserIds: string[];

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  priority: string; // 'high', 'normal', 'low'

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
