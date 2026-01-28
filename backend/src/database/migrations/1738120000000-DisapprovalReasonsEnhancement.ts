import { MigrationInterface, QueryRunner } from "typeorm";

export class DisapprovalReasonsEnhancement1738120000000 implements MigrationInterface {
    name = 'DisapprovalReasonsEnhancement1738120000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before dropping
        const table = await queryRunner.getTable('disapproval_reasons');
        if (table && table.findColumnByName('applicableTo')) {
            await queryRunner.query(`ALTER TABLE "disapproval_reasons" DROP COLUMN "applicableTo"`);
        }
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."disapproval_reasons_applicableto_enum"`);
        
        // Check if reasonType column already exists
        if (!table || !table.findColumnByName('reasonType')) {
            await queryRunner.query(`CREATE TYPE "public"."disapproval_reasons_reasontype_enum" AS ENUM('rejection', 'flag')`);
            await queryRunner.query(`ALTER TABLE "disapproval_reasons" ADD "reasonType" "public"."disapproval_reasons_reasontype_enum" NOT NULL DEFAULT 'rejection'`);
        }
        
        // Check if applicableRoles exists
        if (!table || !table.findColumnByName('applicableRoles')) {
            await queryRunner.query(`ALTER TABLE "disapproval_reasons" ADD "applicableRoles" text[] NOT NULL DEFAULT '{}'`);
        }
        
        // Check if categoryIds exists
        if (!table || !table.findColumnByName('categoryIds')) {
            await queryRunner.query(`ALTER TABLE "disapproval_reasons" ADD "categoryIds" text[] NOT NULL DEFAULT '{}'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disapproval_reasons" DROP COLUMN "categoryIds"`);
        await queryRunner.query(`ALTER TABLE "disapproval_reasons" DROP COLUMN "applicableRoles"`);
        await queryRunner.query(`ALTER TABLE "disapproval_reasons" DROP COLUMN "reasonType"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."disapproval_reasons_reasontype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."disapproval_reasons_applicableto_enum" AS ENUM('research', 'inquiry', 'both')`);
        await queryRunner.query(`ALTER TABLE "disapproval_reasons" ADD "applicableTo" "public"."disapproval_reasons_applicableto_enum" NOT NULL DEFAULT 'both'`);
    }
}
