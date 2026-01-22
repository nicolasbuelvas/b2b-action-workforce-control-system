"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateResearchSubmissions1737500100000 = void 0;
class CreateResearchSubmissions1737500100000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE research_submissions;`);
    }
}
exports.CreateResearchSubmissions1737500100000 = CreateResearchSubmissions1737500100000;
//# sourceMappingURL=1737500100000-CreateResearchSubmissions.js.map