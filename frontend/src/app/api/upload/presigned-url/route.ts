import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import logger from '@/lib/logger';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const DEFAULT_BUCKET = 'formbuilder-uploads';

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, bucket = DEFAULT_BUCKET, fileSize } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { message: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    if (fileSize && fileSize > MAX_SIZE_BYTES) {
      return NextResponse.json({ message: 'File too large' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ message: 'File type not allowed' }, { status: 400 });
    }

    const path = `${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      logger.error('upload_presigned_url_error', { error: error?.message, bucket, path });
      return NextResponse.json(
        { message: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    logger.info('upload_presigned_url_created', { bucket, path });

    return NextResponse.json({
      url: data.signedUrl,
      path,
      bucket,
      expiresIn: 60 * 15,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
