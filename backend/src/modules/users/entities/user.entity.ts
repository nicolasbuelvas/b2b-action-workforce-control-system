import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../roles/entities/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ default: 0 })
  trust_score: number;

  @Column({ default: 'active' })
  status: 'active' | 'suspended';

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => UserRole, ur => ur.user)
  roles: UserRole[];
}
