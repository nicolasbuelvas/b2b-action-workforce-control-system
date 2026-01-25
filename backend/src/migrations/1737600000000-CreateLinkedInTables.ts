import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLinkedInResearchTables1737600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // LinkedIn Research Tasks
    await queryRunner.createTable(
      new Table({
        name: 'linkedin_research_tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'targetId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED'],
            default: "'PENDING'",
          },
          {
            name: 'assignedToUserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // LinkedIn Research Submissions
    await queryRunner.createTable(
      new Table({
        name: 'linkedin_research_submissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'research_task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'contactName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'linkedinProfileUrl',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // LinkedIn Inquiry Tasks
    await queryRunner.createTable(
      new Table({
        name: 'linkedin_inquiry_tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'targetId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'research_task_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED', 'FLAGGED'],
            default: "'PENDING'",
          },
          {
            name: 'assignedToUserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_linkedin_inquiry_research_task_id',
            columnNames: ['research_task_id'],
          }),
        ],
      }),
      true,
    );

    // LinkedIn Actions
    await queryRunner.createTable(
      new Table({
        name: 'linkedin_actions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'inquiry_task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'actionType',
            type: 'enum',
            enum: ['OUTREACH', 'ASK_FOR_EMAIL', 'SEND_CATALOGUE'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // LinkedIn Submission Snapshots
    await queryRunner.createTable(
      new Table({
        name: 'linkedin_submission_snapshots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'inquiry_task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action_type',
            type: 'enum',
            enum: ['OUTREACH', 'ASK_FOR_EMAIL', 'SEND_CATALOGUE'],
            isNullable: false,
          },
          {
            name: 'research_task_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'contact_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'linkedin_profile_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'screenshot_path',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'screenshot_hash',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_duplicate',
            type: 'boolean',
            default: false,
          },
          {
            name: 'message_content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'email_provided',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'email_value',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_linkedin_snapshot_inquiry_task',
            columnNames: ['inquiry_task_id'],
          }),
          new TableIndex({
            name: 'IDX_linkedin_snapshot_action',
            columnNames: ['action_id'],
          }),
          new TableIndex({
            name: 'IDX_linkedin_snapshot_research_task',
            columnNames: ['research_task_id'],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('linkedin_submission_snapshots', true);
    await queryRunner.dropTable('linkedin_actions', true);
    await queryRunner.dropTable('linkedin_inquiry_tasks', true);
    await queryRunner.dropTable('linkedin_research_submissions', true);
    await queryRunner.dropTable('linkedin_research_tasks', true);
  }
}
