import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateGrammarLesson } from '@/app/actions/grammar-generation'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { studentId, topic } = body

    if (!studentId || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, topic' },
        { status: 400 }
      )
    }

    // Verify student belongs to this user
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutorId: session.user.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 403 }
      )
    }

    // Generate grammar lesson
    const grammarLesson = await generateGrammarLesson(studentId, topic)

    // Save lesson to database
    const lesson = await prisma.lesson.create({
      data: {
        title: grammarLesson.title,
        overview: grammarLesson.context,
        content: JSON.parse(JSON.stringify({
          ...grammarLesson,
          isGrammarLesson: true // Mark this as a grammar lesson for frontend routing
        })),
        studentId,
        isRefined: false,
        isPublic: false
      }
    })

    return NextResponse.json({
      success: true,
      data: lesson
    })
  } catch (error) {
    console.error('Error generating grammar lesson:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to generate grammar lesson' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate grammar lesson' },
      { status: 500 }
    )
  }
}
