import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { CategoryConfig } from './category-config.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // Product A, Product B, etc.

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => CategoryConfig, config => config.category, {
    cascade: true,
  })
  config: CategoryConfig;

  @CreateDateColumn()
  createdAt: Date;
}
