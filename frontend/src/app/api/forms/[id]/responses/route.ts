import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';

type ResponseData = {
  fieldId: string
  value: unknown
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 25;
    const offset = (page - 1) * limit;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const ipFilter = searchParams.get('ip');
    const fieldIdFilter = searchParams.get('fieldId');
    const fieldValueFilter = searchParams.get('fieldValue');
    const searchTerm = searchParams.get('search');

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const baseWhere: Parameters<typeof prisma.formResponse.findMany>[0]['where'] = {
      formId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      baseWhere.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    if (ipFilter) {
      baseWhere.ip = {
        contains: ipFilter,
        mode: 'insensitive',
      };
    }

    const responses = await prisma.formResponse.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
    });

    let filteredResponses = responses;

    if (fieldIdFilter) {
      filteredResponses = filteredResponses.filter((response) => {
        const data = Array.isArray(response.data) ? (response.data as ResponseData[]) : [];

        if (fieldValueFilter) {
          return data.some(
            (entry) =>
              entry.fieldId === fieldIdFilter &&
              String(entry.value ?? '')
                .toLowerCase()
                .includes(fieldValueFilter.toLowerCase())
          );
        }

        return data.some((entry) => entry.fieldId === fieldIdFilter);
      });
    }

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredResponses = filteredResponses.filter((response) => {
        const data = Array.isArray(response.data) ? (response.data as ResponseData[]) : [];

        const matchesFieldValue = data.some((entry) =>
          String(entry.value ?? '').toLowerCase().includes(searchTermLower)
        );

        const matchesIp = response.ip?.toLowerCase().includes(searchTermLower) ?? false;

        return matchesFieldValue || matchesIp;
      });
    }

    const total = filteredResponses.length;
    const items = filteredResponses.slice(offset, offset + limit);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get responses error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
