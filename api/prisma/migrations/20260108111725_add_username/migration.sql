-- Add username with auto-generated values for existing users
ALTER TABLE "User" ADD COLUMN "username" TEXT;

UPDATE "User"
SET "username" = CONCAT('user', "id")
WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
