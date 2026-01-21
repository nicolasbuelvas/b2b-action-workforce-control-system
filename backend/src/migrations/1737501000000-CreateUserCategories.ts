import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserCategories1737501000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_categories (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_categories_userId" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT "FK_user_categories_categoryId" FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_category_unique" 
      ON user_categories("userId", "categoryId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_categories;`);
  }
}
