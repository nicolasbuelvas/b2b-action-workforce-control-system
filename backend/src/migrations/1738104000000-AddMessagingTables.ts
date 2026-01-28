import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessagingTables1738104000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notices table
    await queryRunner.query(`
      CREATE TABLE notices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(50) NOT NULL,
        target_role_ids UUID[],
        target_category_ids UUID[],
        target_user_ids UUID[],
        priority VARCHAR(20) DEFAULT 'normal',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        participant_user_ids UUID[] NOT NULL,
        subject VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create message_templates table
    await queryRunner.query(`
      CREATE TABLE message_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        category_ids UUID[],
        created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indices
    await queryRunner.query(`CREATE INDEX idx_notices_created_by ON notices(created_by_user_id);`);
    await queryRunner.query(`CREATE INDEX idx_notices_target_type ON notices(target_type);`);
    await queryRunner.query(`CREATE INDEX idx_conversations_participants ON conversations USING GIN(participant_user_ids);`);
    await queryRunner.query(`CREATE INDEX idx_messages_conversation ON messages(conversation_id);`);
    await queryRunner.query(`CREATE INDEX idx_messages_sender ON messages(sender_user_id);`);
    await queryRunner.query(`CREATE INDEX idx_templates_categories ON message_templates USING GIN(category_ids);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS messages CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS message_templates CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS notices CASCADE;`);
  }
}
