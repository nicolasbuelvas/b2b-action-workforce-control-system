import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInquiryPlatformColumn1738010000000 implements MigrationInterface {
  name = 'AddInquiryPlatformColumn1738010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inquiry_tasks_platform_enum" AS ENUM('WEBSITE', 'LINKEDIN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "inquiry_tasks" ADD COLUMN "platform" "public"."inquiry_tasks_platform_enum" NOT NULL DEFAULT 'WEBSITE'`,
    );

    // Backfill: mark tasks that point to LinkedIn profiles as LINKEDIN
    await queryRunner.query(
      `UPDATE inquiry_tasks SET platform = 'LINKEDIN'
       WHERE targetId IN (SELECT id::text FROM linkedin_profiles)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inquiry_tasks" DROP COLUMN "platform"`);
    await queryRunner.query(`DROP TYPE "public"."inquiry_tasks_platform_enum"`);
  }
}
