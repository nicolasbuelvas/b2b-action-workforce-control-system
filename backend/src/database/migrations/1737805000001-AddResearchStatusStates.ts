import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResearchStatusStates1737805000001 implements MigrationInterface {
  name = 'AddResearchStatusStates1737805000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';`,
    );
    await queryRunner.query(
      `ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'SUBMITTED';`,
    );
  }

  public async down(): Promise<void> {
    // No-op: dropping enum values is not straightforward in Postgres
    return;
  }
}
