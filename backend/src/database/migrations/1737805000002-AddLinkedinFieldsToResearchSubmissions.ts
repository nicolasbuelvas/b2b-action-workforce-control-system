import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLinkedinFieldsToResearchSubmissions1737805000002 implements MigrationInterface {
  name = 'AddLinkedinFieldsToResearchSubmissions1737805000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "contact_name" varchar;`,
    );
    await queryRunner.query(
      `ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "contact_linkedin_url" varchar;`,
    );
    await queryRunner.query(
      `ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "country" varchar;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "contact_name";`,
    );
    await queryRunner.query(
      `ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "contact_linkedin_url";`,
    );
    await queryRunner.query(
      `ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "country";`,
    );
  }
}
