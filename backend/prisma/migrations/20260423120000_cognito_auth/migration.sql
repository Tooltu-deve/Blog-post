-- Fresh-start migration for Cognito auth.
-- WARNING: destroys all existing user rows. Posts and comments cascade-delete
-- because their FKs onDelete(Cascade) to users. Acceptable per design decision:
-- the project is still pre-traffic, everyone re-registers via Cognito.

-- Drop all users (cascades to posts and comments).
DELETE FROM "users";

-- Add cognitoSub (required after backfill — but table is now empty).
ALTER TABLE "users" ADD COLUMN "cognitoSub" TEXT NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_cognitoSub_key" UNIQUE ("cognitoSub");

-- Drop bcrypt password column.
ALTER TABLE "users" DROP COLUMN "password";
