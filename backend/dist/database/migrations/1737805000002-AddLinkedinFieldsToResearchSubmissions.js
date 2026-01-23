"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLinkedinFieldsToResearchSubmissions1737805000002 = void 0;
class AddLinkedinFieldsToResearchSubmissions1737805000002 {
    constructor() {
        this.name = 'AddLinkedinFieldsToResearchSubmissions1737805000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "contact_name" varchar;`);
        await queryRunner.query(`ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "contact_linkedin_url" varchar;`);
        await queryRunner.query(`ALTER TABLE "research_submissions" ADD COLUMN IF NOT EXISTS "country" varchar;`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "contact_name";`);
        await queryRunner.query(`ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "contact_linkedin_url";`);
        await queryRunner.query(`ALTER TABLE "research_submissions" DROP COLUMN IF EXISTS "country";`);
    }
}
exports.AddLinkedinFieldsToResearchSubmissions1737805000002 = AddLinkedinFieldsToResearchSubmissions1737805000002;
//# sourceMappingURL=1737805000002-AddLinkedinFieldsToResearchSubmissions.js.map