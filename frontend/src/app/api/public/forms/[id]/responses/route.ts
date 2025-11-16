import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { sanitizeRequiredString } from '@/lib/sanitize';

type SubmittedField = {
  fieldId: string
  value: unknown
}

type ResponseMetadata = {
  durationMs: number
}

const sanitizeResponseValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return sanitizeRequiredString(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? sanitizeRequiredString(item) : item))
  }

  return value
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
      value: sanitizeResponseValue((item as { value: unknown }).value ?? null),
    }))
}

const parseMetadata = (payload: unknown): ResponseMetadata | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const durationValue = (payload as { durationMs?: unknown }).durationMs
  if (typeof durationValue === 'number' && Number.isFinite(durationValue) && durationValue >= 0) {
    return { durationMs: Math.round(durationValue) }
  }

  if (typeof durationValue === 'string') {
    const parsed = Number(durationValue)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return { durationMs: Math.round(parsed) }
    }
  }

  return undefined
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
    const metadata = parseMetadata(
      body && typeof body === 'object' ? (body as { metadata?: unknown }).metadata : undefined
    )

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
        metadata: metadata ? (metadata as Prisma.JsonValue) : Prisma.DbNull,
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
