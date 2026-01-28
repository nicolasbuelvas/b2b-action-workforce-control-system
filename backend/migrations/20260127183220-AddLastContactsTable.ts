import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddLastContactsTable20260127183220 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create last_contacts table to track when companies/URLs were last contacted
    await queryRunner.createTable(
      new Table({
        name: 'last_contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'target_identifier',
            type: 'varchar',
            length: '500',
            comment: 'URL or company name that was contacted',
          },
          {
            name: 'category_id',
            type: 'uuid',
            comment: 'Category this contact belongs to',
          },
          {
            name: 'last_contacted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'When this target was last contacted',
          },
          {
            name: 'contacted_by_user_id',
            type: 'uuid',
            comment: 'User who made the last contact',
          },
          {
            name: 'task_type',
            type: 'varchar',
            length: '50',
            comment: 'research or inquiry',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to categories table
    await queryRunner.createForeignKey(
      'last_contacts',
      new TableForeignKey({
        name: 'fk_last_contacts_category',
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add index for fast lookups by target_identifier + category_id
    await queryRunner.createIndex(
      'last_contacts',
      new TableIndex({
        name: 'idx_last_contacts_target_category',
        columnNames: ['target_identifier', 'category_id'],
      }),
    );

    // Add index for category_id lookups
    await queryRunner.createIndex(
      'last_contacts',
      new TableIndex({
        name: 'idx_last_contacts_category',
        columnNames: ['category_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('last_contacts', 'idx_last_contacts_category');
    await queryRunner.dropIndex('last_contacts', 'idx_last_contacts_target_category');

    // Drop foreign key
    await queryRunner.dropForeignKey('last_contacts', 'fk_last_contacts_category');

    // Drop table
    await queryRunner.dropTable('last_contacts');
  }
}
