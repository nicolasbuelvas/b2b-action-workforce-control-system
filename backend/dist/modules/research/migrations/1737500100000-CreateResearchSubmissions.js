"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateResearchSubmissions1737500100000 = void 0;
class CreateResearchSubmissions1737500100000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE research_submissions;`);
    }
}
exports.CreateResearchSubmissions1737500100000 = CreateResearchSubmissions1737500100000;
//# sourceMappingURL=1737500100000-CreateResearchSubmissions.js.map