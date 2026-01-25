import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddResearchTaskIdToInquiryTasks1769343110616 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "inquiry_tasks",
            new TableColumn({
                name: "researchTaskId",
                type: "uuid",
                isNullable: true,
            })
        );

        // Add index for faster lookups
        await queryRunner.query(
            `CREATE INDEX "IDX_inquiry_research_task" ON "inquiry_tasks"("researchTaskId")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_inquiry_research_task"`);
        await queryRunner.dropColumn("inquiry_tasks", "researchTaskId");
    }

}
