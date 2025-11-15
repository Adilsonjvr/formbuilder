import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

type ResponseEntry = {
  fieldId: string
  value: unknown
}

const parseResponseData = (data: Prisma.JsonValue): ResponseEntry[] => {
  if (!Array.isArray(data)) {
    return []
  }

  return data.filter((entry): entry is ResponseEntry => {
    if (!entry || typeof entry !== 'object') return false
    const candidate = entry as { fieldId?: unknown }
    return typeof candidate.fieldId === 'string'
  })
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
    const format = searchParams.get('format') || 'csv';

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
      include: {
        fields: { orderBy: { order: 'asc' } },
        responses: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    if (format === 'csv') {
      const fields = form.fields.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
      }))

      // Generate CSV headers
      const headers = ['Data/Hora', ...fields.map(f => f.label), 'IP']

      // Generate CSV rows
      const rows = form.responses.map((response) => {
        const data = parseResponseData(response.data)
        const formattedDate = new Date(response.createdAt).toLocaleString('pt-BR')

        const fieldValues = fields.map(field => {
          const fieldData = data.find((d) => d.fieldId === field.id)
          if (!fieldData || fieldData.value === null || fieldData.value === undefined) {
            return ''
          }
          if (typeof fieldData.value === 'boolean') {
            return fieldData.value ? 'Sim' : 'Não'
          }
          // Escape quotes and wrap in quotes if contains comma or quote
          const value = String(fieldData.value)
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })

        return [formattedDate, ...fieldValues, response.ip || '']
      })

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Return as CSV file
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${form.name}-respostas.csv"`,
        },
      })
    } else if (format === 'json') {
      // Return as JSON
      const data = form.responses.map((response) => ({
        id: response.id,
        createdAt: response.createdAt,
        ip: response.ip,
        data: response.data,
      }))

      return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${form.name}-respostas.json"`,
        },
      })
    } else {
      return NextResponse.json(
        { message: 'Unsupported format. Use csv or json.' },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Export error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
