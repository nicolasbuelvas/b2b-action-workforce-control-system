"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTargetTypeToResearchTasks1737500000000 = void 0;
class AddTargetTypeToResearchTasks1737500000000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE research_tasks 
      DROP COLUMN "targetType";
    `);
    }
}
exports.AddTargetTypeToResearchTasks1737500000000 = AddTargetTypeToResearchTasks1737500000000;
//# sourceMappingURL=1737500000000-AddTargetTypeToResearchTasks.js.map