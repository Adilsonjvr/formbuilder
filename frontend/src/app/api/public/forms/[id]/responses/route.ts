import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { Prisma } from '@prisma/client';

type SubmittedField = {
  fieldId: string
  value: unknown
}

const parseSubmittedFields = (payload: unknown): SubmittedField[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .filter((item): item is { fieldId: unknown; value: unknown } => {
      return Boolean(
        item &&
          typeof item === 'object' &&
          'fieldId' in item &&
          typeof (item as { fieldId?: unknown }).fieldId === 'string'
      )
    })
    .map((item) => ({
      fieldId: (item as { fieldId: string }).fieldId,
      value: (item as { value: unknown }).value ?? null,
    }))
}

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
    const body = await req.json();
    const submittedFields = parseSubmittedFields(
      body && typeof body === 'object' ? (body as { fields?: unknown }).fields : undefined
    );

    const form = await prisma.form.findFirst({
      where: { id: formId, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    if (submittedFields.length === 0) {
      return NextResponse.json(
        { message: 'fields is required' },
        { status: 400 }
      );
    }

    const response = await prisma.formResponse.create({
      data: {
        formId,
        data: submittedFields as Prisma.JsonArray,
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
