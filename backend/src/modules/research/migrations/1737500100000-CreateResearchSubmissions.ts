import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResearchSubmissions1737500100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE research_submissions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        researchtaskid uuid NOT NULL,
        email character varying,
        phone character varying,
        techstack text,
        notes text,
        screenshotpath character varying,
        createdat timestamp without time zone NOT NULL DEFAULT now(),
        language character varying
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_research_submissions_task_id 
      ON research_submissions(researchtaskid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE research_submissions;`);
  }
}
