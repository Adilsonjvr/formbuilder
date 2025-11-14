import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: form.id,
      name: form.name,
      description: form.description,
      fields: form.fields ?? [],
      createdAt: form.createdAt,
    });
  } catch (error) {
    console.error('Get public form error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
