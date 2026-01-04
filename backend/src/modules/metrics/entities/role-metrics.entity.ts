import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('role_metrics')
@Index(['userId', 'role', 'categoryId', 'date'], { unique: true })
export class RoleMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  /**
   * Ej:
   * - website_researcher
   * - linkedin_inquirer
   * - website_auditor
   */
  @Column()
  role: string;

  /**
   * Product A / Product B / Product C
   * NULL = métricas globales (opcional)
   */
  @Column({ nullable: true })
  categoryId: string;

  /**
   * YYYY-MM-DD
   */
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