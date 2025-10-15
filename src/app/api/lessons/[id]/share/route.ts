// src/app/api/lessons/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params

    // Optimized query with select to avoid fetching unnecessary data
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
        title: true,
        overview: true,
        isRefined: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        studentId: true,
        student: {
          select: {
            id: true,
            name: true,
            targetLanguage: true,
            level: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Add cache headers for better performance on shared lessons
    return NextResponse.json(lesson, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes since shared lessons don't change often
      },
    })
  } catch (error) {
    console.error('Error fetching shared lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}