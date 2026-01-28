import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'sender_user_id', type: 'uuid' })
  senderUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_user_id' })
  sender: User;

  @Column({ name: 'message_text', type: 'text' })
  messageText: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: { noticeId?: string; isNotice?: boolean } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
