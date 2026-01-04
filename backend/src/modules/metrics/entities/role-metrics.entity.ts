import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('role_metrics')
@Index(['userId', 'role', 'date'], { unique: true })
export class RoleMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  role: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: 0 })
  totalActions: number;

  @Column({ default: 0 })
  approvedActions: number;

  @Column({ default: 0 })
  rejectedActions: number;

  @Column({ default: 0 })
  flaggedActions: number;

  @CreateDateColumn()
  createdAt: Date;
}
