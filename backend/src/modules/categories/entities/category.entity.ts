import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { CategoryConfig } from './category-config.entity';
import { SubAdminCategory } from './sub-admin-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => CategoryConfig, config => config.category, {
    cascade: true,
    eager: true,
  })
  config: CategoryConfig;

  @OneToMany(() => SubAdminCategory, sac => sac.category, { eager: true })
  subAdminCategories: SubAdminCategory[];

  @CreateDateColumn()
  createdAt: Date;
}