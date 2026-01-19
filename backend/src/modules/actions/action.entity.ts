import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  category: string;

  @Column()
  actionType: string;

  @Column({ default: true })
  enabled: boolean;

  // FIX: Use 'actionId' as the foreign key, so reference is correct
  @OneToMany(() => ActionInput, (input) => input.action, { cascade: true })
  inputs: ActionInput[];

  @OneToOne(() => EvidenceRule, { cascade: true })
  @JoinColumn()
  evidence: EvidenceRule;

  @OneToOne(() => ApprovalRule, { cascade: true })
  @JoinColumn()
  approval: ApprovalRule;

  @Column({ type: 'text', nullable: true })
  guidelines: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

@Entity('action_inputs')
export class ActionInput {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionId: string;

  // FIX: Add ManyToOne relation to Action using 'actionId'
  @ManyToOne(() => Action, (action) => action.inputs)
  action: Action;

  @Column()
  inputKey: string;

  @Column()
  label: string;

  @Column()
  type: string;

  @Column({ default: false })
  required: boolean;

  @Column({ nullable: true })
  optionsSource: string;

  @Column({ nullable: true })
  validationRules: string;

  @Column({ default: 0 })
  order: number;
}

@Entity('evidence_rules')
export class EvidenceRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionId: string;

  @Column({ default: false })
  requiresScreenshot: boolean;

  @Column({ default: 'image' })
  screenshotType: string;

  @Column({ type: 'text', nullable: true })
  screenshotContext: string;

  @Column({ default: 1 })
  maxSizeMb: number;
}

@Entity('approval_rules')
export class ApprovalRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionId: string;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column()
  approvalRole: string;

  @Column({ type: 'text', nullable: true })
  approvalCriteria: string;

  @Column({ nullable: true })
  rejectionReasonGroupId: string;
}
