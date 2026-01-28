import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../modules/categories/entities/category.entity';

@Entity('last_contacts')
export class LastContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'target_identifier', length: 500 })
  targetIdentifier: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'last_contacted_at', type: 'timestamp' })
  lastContactedAt: Date;

  @Column({ name: 'contacted_by_user_id' })
  contactedByUserId: string;

  @Column({ name: 'task_type', length: 50 })
  taskType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
