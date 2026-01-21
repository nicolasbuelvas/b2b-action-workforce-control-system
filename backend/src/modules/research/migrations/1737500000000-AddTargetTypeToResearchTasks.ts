import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTargetTypeToResearchTasks1737500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE research_tasks 
      ADD COLUMN "targetType" character varying;
    `);

    await queryRunner.query(`
      UPDATE research_tasks 
      SET "targetType" = 'COMPANY' 
      WHERE "targetType" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE research_tasks 
      ALTER COLUMN "targetType" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE research_tasks 
      DROP COLUMN "targetType";
    `);
  }
}
