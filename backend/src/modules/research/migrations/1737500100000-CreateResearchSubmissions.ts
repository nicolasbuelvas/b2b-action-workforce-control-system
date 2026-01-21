import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResearchSubmissions1737500100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE research_submissions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "researchTaskId" uuid NOT NULL,
        email character varying,
        phone character varying,
        "techStack" text,
        notes text,
        "screenshotPath" character varying,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_research_submissions_task_id 
      ON research_submissions("researchTaskId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE research_submissions;`);
  }
}
