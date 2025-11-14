import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

// Simple in-memory rate limiting for MVP
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      );
    }

    const { id: formId } = await params;
    const { fields } = await req.json();

    const form = await prisma.form.findFirst({
      where: { id: formId, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { message: 'fields is required' },
        { status: 400 }
      );
    }

    const response = await prisma.formResponse.create({
      data: {
        formId,
        data: fields as any,
        ip: ip !== 'unknown' ? ip : null,
        createdAt: new Date(),
      },
    });

    logger.info('response_submitted', { formId, responseId: response.id });

    return NextResponse.json({ id: response.id }, { status: 201 });
  } catch (error) {
    console.error('Submit response error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
