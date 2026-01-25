import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInquirySubmissionSnapshots1769340551284 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'inquiry_submission_snapshots',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'inquiry_task_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'inquiry_action_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'company_name',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'company_url',
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
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                indices: [
                    {
                        name: 'IDX_inquiry_task_id',
                        columnNames: ['inquiry_task_id'],
                    },
                    {
                        name: 'IDX_inquiry_action_id',
                        columnNames: ['inquiry_action_id'],
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('inquiry_submission_snapshots', true);
    }

}
