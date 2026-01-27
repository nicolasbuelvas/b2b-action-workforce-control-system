import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('disapproval_reasons')
export class DisapprovalReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['rejection', 'flag'], default: 'rejection' })
  reasonType: 'rejection' | 'flag';

  @Column({ type: 'text', array: true, default: '{}' })
  applicableRoles: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  categoryIds: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
