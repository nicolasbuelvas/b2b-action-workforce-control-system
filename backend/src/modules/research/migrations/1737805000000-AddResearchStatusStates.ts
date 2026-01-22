import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResearchStatusStates1737805000000 implements MigrationInterface {
  name = 'AddResearchStatusStates1737805000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';`,
    );
    await queryRunner.query(
      `ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'SUBMITTED';`,
    );
  }

  // Postgres cannot drop enum values easily; leave as no-op
  public async down(): Promise<void> {
    return;
  }
}
