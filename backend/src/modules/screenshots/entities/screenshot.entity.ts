import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('screenshots')
@Index(['actionId'], { unique: true })
@Index(['hash', 'actionId'])
export class Screenshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'action_id' })
  actionId: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'hash' })
  hash: string;

  @Column({ name: 'is_duplicate', default: false })
  isDuplicate: boolean;

  @Column({ name: 'uploaded_by_user_id' })
  uploadedByUserId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
