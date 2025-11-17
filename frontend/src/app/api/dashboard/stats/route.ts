import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    requireAuth(user)

    // Get all forms for the user
    const forms = await prisma.form.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            responses: {
              where: { deletedAt: null },
            },
          },
        },
        responses: {
          where: { deletedAt: null },
          select: {
            id: true,
            createdAt: true,
            metadata: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    // Calculate stats
    const totalForms = forms.length
    const totalResponses = forms.reduce(
      (sum, form) => sum + form._count.responses,
      0
    )
    const averageResponsesPerForm =
      totalForms > 0 ? totalResponses / totalForms : 0

    // Calculate completion rate (forms with metadata completion info)
    let completedResponses = 0
    let totalWithMetadata = 0

    forms.forEach((form) => {
      form.responses.forEach((response) => {
        if (response.metadata && typeof response.metadata === 'object') {
          totalWithMetadata++
          const metadata = response.metadata as { completed?: boolean }
          if (metadata.completed !== false) {
            completedResponses++
          }
        }
      })
    })

    const completionRate =
      totalWithMetadata > 0
        ? (completedResponses / totalWithMetadata) * 100
        : 100

    // Get recent activities
    const activities: Array<{
      id: string
      type: 'form_created' | 'response_received'
      formName: string
      timestamp: string
      responseCount?: number
    }> = []

    // Add form created activities
    forms
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
      .forEach((form) => {
        activities.push({
          id: `form-${form.id}`,
          type: 'form_created',
          formName: form.name,
          timestamp: form.createdAt.toISOString(),
        })
      })

    // Add response received activities
    const allResponses = forms.flatMap((form) =>
      form.responses.map((response) => ({
        id: response.id,
        formId: form.id,
        formName: form.name,
        createdAt: response.createdAt,
      }))
    )

    allResponses
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .forEach((response) => {
        const form = forms.find((f) => f.id === response.formId)
        activities.push({
          id: `response-${response.id}`,
          type: 'response_received',
          formName: response.formName,
          timestamp: response.createdAt.toISOString(),
          responseCount: form?._count.responses,
        })
      })

    // Sort all activities by timestamp
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Get top forms by response count
    const topForms = forms
      .sort((a, b) => b._count.responses - a._count.responses)
      .slice(0, 5)
      .map((form) => ({
        id: form.id,
        name: form.name,
        responseCount: form._count.responses,
      }))

    return NextResponse.json({
      stats: {
        totalForms,
        totalResponses,
        averageResponsesPerForm,
        completionRate,
      },
      activities: activities.slice(0, 10),
      topForms,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
