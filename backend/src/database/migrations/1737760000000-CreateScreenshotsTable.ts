import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScreenshotsTable1737760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists before creating
    const tableExists = await queryRunner.hasTable('screenshots');
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE screenshots (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action_id UUID NOT NULL UNIQUE,
          file_path VARCHAR NOT NULL,
          mime_type VARCHAR NOT NULL,
          file_size INTEGER NOT NULL,
          hash VARCHAR NOT NULL,
          is_duplicate BOOLEAN DEFAULT false,
          uploaded_by_user_id UUID NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX idx_screenshots_action_id ON screenshots(action_id);
        CREATE INDEX idx_screenshots_hash ON screenshots(hash);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS screenshots;`);
  }
}
