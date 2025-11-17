-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "enable_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notification_email" TEXT;
