import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const router = Router();

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const DEFAULT_BUCKET = 'formbuilder-uploads';

router.post('/presigned-url', async (req: Request, res: Response) => {
  const { fileName, fileType, bucket = DEFAULT_BUCKET, fileSize } = req.body;

  if (!fileName || !fileType) {
    throw new AppError('fileName and fileType are required', 400, 'VALIDATION_ERROR');
  }

  if (fileSize && fileSize > MAX_SIZE_BYTES) {
    throw new AppError('File too large', 400, 'FILE_TOO_LARGE');
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new AppError('File type not allowed', 400, 'INVALID_FILE_TYPE');
  }

  const path = `${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    logger.error('upload_presigned_url_error', { error: error?.message, bucket, path });
    throw new AppError('Failed to create upload URL', 500, 'PRESIGNED_URL_ERROR');
  }

  logger.info('upload_presigned_url_created', { bucket, path });

  return res.json({
    url: data.signedUrl,
    path,
    bucket,
    expiresIn: 60 * 15,
  });
});

export default router;
