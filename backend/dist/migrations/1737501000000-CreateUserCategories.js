"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserCategories1737501000000 = void 0;
class CreateUserCategories1737501000000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE user_categories;`);
    }
}
exports.CreateUserCategories1737501000000 = CreateUserCategories1737501000000;
//# sourceMappingURL=1737501000000-CreateUserCategories.js.map