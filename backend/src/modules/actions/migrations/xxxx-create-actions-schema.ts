// ...migration setup...
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActionsSchemaXXXX implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE actions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar NOT NULL,
        role varchar NOT NULL,
        category varchar NOT NULL,
        action_type varchar NOT NULL,
        enabled boolean DEFAULT true,
        guidelines text,
        deleted_at timestamp
      );
      CREATE TABLE action_inputs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        action_id uuid REFERENCES actions(id),
        input_key varchar NOT NULL,
        label varchar NOT NULL,
        type varchar NOT NULL,
        required boolean DEFAULT false,
        options_source varchar,
        validation_rules varchar,
        "order" integer DEFAULT 0
      );
      CREATE TABLE evidence_rules (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        action_id uuid REFERENCES actions(id),
        requires_screenshot boolean DEFAULT false,
        screenshot_type varchar DEFAULT 'image',
        screenshot_context text,
        max_size_mb integer DEFAULT 1
      );
      CREATE TABLE approval_rules (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        action_id uuid REFERENCES actions(id),
        requires_approval boolean DEFAULT false,
        approval_role varchar,
        approval_criteria text,
        rejection_reason_group_id varchar
      );
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS approval_rules;
      DROP TABLE IF EXISTS evidence_rules;
      DROP TABLE IF EXISTS action_inputs;
      DROP TABLE IF EXISTS actions;
    `);
  }
}
