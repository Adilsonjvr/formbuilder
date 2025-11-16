-- Add metadata column to store response-level metrics
ALTER TABLE "FormResponse"
ADD COLUMN IF NOT EXISTS "metadata" JSONB;
