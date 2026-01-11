import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('linkedin_profiles')
@Index(['normalizedUrl'], { unique: true })
export class LinkedInProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  normalizedUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}