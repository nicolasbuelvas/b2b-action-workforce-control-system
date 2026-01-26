import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddResearchTaskMetadata1738010600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // research_tasks additions
    await queryRunner.addColumns('research_tasks', [
      new TableColumn({
        name: 'job_type_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'company_type_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'language',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('research_tasks', [
      new TableForeignKey({
        columnNames: ['job_type_id'],
        referencedTableName: 'job_types',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['company_type_id'],
        referencedTableName: 'company_types',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    // linkedin_profiles additions
    await queryRunner.addColumns('linkedin_profiles', [
      new TableColumn({
        name: 'contact_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'country',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'language',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('linkedin_profiles', ['contact_name', 'country', 'language']);

    const researchTaskTable = await queryRunner.getTable('research_tasks');
    if (researchTaskTable) {
      const jobTypeFk = researchTaskTable.foreignKeys.find(fk => fk.columnNames.includes('job_type_id'));
      if (jobTypeFk) {
        await queryRunner.dropForeignKey('research_tasks', jobTypeFk);
      }
      const companyTypeFk = researchTaskTable.foreignKeys.find(fk => fk.columnNames.includes('company_type_id'));
      if (companyTypeFk) {
        await queryRunner.dropForeignKey('research_tasks', companyTypeFk);
      }
    }

    await queryRunner.dropColumns('research_tasks', ['job_type_id', 'company_type_id', 'language']);
  }
}
