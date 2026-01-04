import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('companies')
@Index(['normalizedDomain'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @Column()
  normalizedDomain: string;

  @Column()
  country: string;
}