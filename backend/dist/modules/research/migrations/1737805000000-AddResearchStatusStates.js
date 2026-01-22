"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddResearchStatusStates1737805000000 = void 0;
class AddResearchStatusStates1737805000000 {
    constructor() {
        this.name = 'AddResearchStatusStates1737805000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';`);
        await queryRunner.query(`ALTER TYPE "research_tasks_status_enum" ADD VALUE IF NOT EXISTS 'SUBMITTED';`);
    }
    async down() {
        return;
    }
}
exports.AddResearchStatusStates1737805000000 = AddResearchStatusStates1737805000000;
//# sourceMappingURL=1737805000000-AddResearchStatusStates.js.map