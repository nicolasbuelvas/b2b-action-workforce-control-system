import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('screenshot_hashes')
export class ScreenshotHash {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  hash: string;

  @Column()
  uploadedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
