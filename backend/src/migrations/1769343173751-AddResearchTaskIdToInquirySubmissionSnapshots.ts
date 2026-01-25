import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddResearchTaskIdToInquirySubmissionSnapshots1769343173751 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "inquiry_submission_snapshots",
            new TableColumn({
                name: "research_task_id",
                type: "uuid",
                isNullable: true,
            })
        );

        // Add index for faster lookups
        await queryRunner.query(
            `CREATE INDEX "IDX_research_task_id" ON "inquiry_submission_snapshots"("research_task_id")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_research_task_id"`);
        await queryRunner.dropColumn("inquiry_submission_snapshots", "research_task_id");
    }

}
