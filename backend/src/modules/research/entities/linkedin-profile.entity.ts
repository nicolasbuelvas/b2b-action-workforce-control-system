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

  @Column({ name: 'contact_name', nullable: true })
  contactName?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  language?: string;

  @CreateDateColumn()
  createdAt: Date;
}