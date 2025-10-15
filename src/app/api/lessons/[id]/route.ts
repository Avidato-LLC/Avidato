// src/app/api/lessons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: lessonId } = await params

    // Optimized single query with proper indexing hints
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        student: {
          tutorId: session.user.id, // This uses the studentId -> tutorId index path
        },
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

    // Add aggressive cache headers and ETag for better performance
    const etag = `"${lesson.id}-${lesson.updatedAt.getTime()}"`
    const ifNoneMatch = request.headers.get('If-None-Match')
    
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    return NextResponse.json(lesson, {
      headers: {
        'Cache-Control': 'private, max-age=300, must-revalidate', // 5 minute cache
        'ETag': etag,
      },
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}