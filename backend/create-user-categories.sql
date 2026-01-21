-- Create user_categories table for worker-category assignments
CREATE TABLE IF NOT EXISTS user_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "categoryId" uuid NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "FK_user_categories_userId" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT "FK_user_categories_categoryId" FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_category_unique" 
ON user_categories("userId", "categoryId");
