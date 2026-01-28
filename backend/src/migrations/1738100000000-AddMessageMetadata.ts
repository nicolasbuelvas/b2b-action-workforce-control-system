import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageMetadata1738100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add metadata column to messages table
    await queryRunner.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS metadata jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE messages 
      DROP COLUMN IF EXISTS metadata
    `);
  }
}
