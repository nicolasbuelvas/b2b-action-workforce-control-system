import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCategoryRulesTable1737170000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'category_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'daily_limit_override',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'cooldown_days_override',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'required_actions',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'screenshot_required',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('category_rules');
  }
}