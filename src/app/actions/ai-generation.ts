// src/app/actions/ai-generation.ts
'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geminiService, StudentProfile, LearningPlan, GeneratedLesson } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import type { Session } from 'next-auth';

// Check and update daily generation count
async function checkAndUpdateGenerationLimit(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyGenerationCount: true,
      lastGenerationDate: true,
      dailyLimit: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Reset count if it's a new day
  const lastGenDate = user.lastGenerationDate;
  const needsReset = !lastGenDate || lastGenDate < today;

  if (needsReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyGenerationCount: 1,
        lastGenerationDate: new Date(),
      },
    });
    return true;
  }

  // Check if under daily limit
  if (user.dailyGenerationCount >= user.dailyLimit) {
    return false;
  }

  // Increment count
  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyGenerationCount: user.dailyGenerationCount + 1,
    },
  });

  return true;
}

// Get current generation stats
export async function getGenerationStats() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await Promise.race([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyGenerationCount: true,
        lastGenerationDate: true,
        dailyLimit: true,
      },
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    )
  ]) as {
    dailyGenerationCount: number
    lastGenerationDate: Date | null
    dailyLimit: number
  } | null;

  if (!user) {
    throw new Error('User not found');
  }

  // Reset if new day
  const needsReset = !user.lastGenerationDate || user.lastGenerationDate < today;
  const currentCount = needsReset ? 0 : user.dailyGenerationCount;

  return {
    used: currentCount,
    limit: user.dailyLimit,
    remaining: user.dailyLimit - currentCount,
  };
}

// Generate AI learning plan
export async function generateLearningPlan(studentId: string): Promise<{
  success: boolean;
  data?: LearningPlan;
  planId?: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check generation limit
    const canGenerate = await checkAndUpdateGenerationLimit(session.user.id);
    if (!canGenerate) {
      return { success: false, error: 'Daily generation limit reached. Try again tomorrow.' };
    }

    // Get student data
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        tutorId: session.user.id, // Ensure ownership
      },
    });

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Convert to StudentProfile
    const studentProfile: StudentProfile = {
      name: student.name,
      targetLanguage: student.targetLanguage,
      nativeLanguage: student.nativeLanguage,
      ageGroup: student.ageGroup,
      level: student.level,
      endGoals: student.endGoals,
      occupation: student.occupation || undefined,
      weaknesses: student.weaknesses || undefined,
      interests: student.interests || undefined,
    };

    // Generate learning plan
    const learningPlan = await geminiService.generateLearningPlan(studentProfile);

    // Save learning plan to database
    const savedLearningPlan = await prisma.learningPlan.create({
      data: {
        selectedMethodology: learningPlan.selectedMethodology,
        methodologyReasoning: learningPlan.methodologyReasoning,
        topics: JSON.parse(JSON.stringify(learningPlan.topics)), // Convert to JSON-compatible format
        studentId: studentId,
      },
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    return { 
      success: true, 
      data: learningPlan,
      planId: savedLearningPlan.id 
    };

  } catch (error) {
    console.error('Error generating learning plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate learning plan' 
    };
  }
}

// Get existing learning plan for a student
export async function getStudentLearningPlan(studentId: string): Promise<{
  success: boolean;
  data?: LearningPlan;
  planId?: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get student to verify ownership
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        tutorId: session.user.id,
      },
    });

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Get latest learning plan for this student
    const learningPlan = await prisma.learningPlan.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!learningPlan) {
      return { success: false, error: 'No learning plan found' };
    }

    // Convert back to LearningPlan format
    const planData: LearningPlan = {
      selectedMethodology: learningPlan.selectedMethodology as 'CLT' | 'TBLT' | 'PPP' | 'TTT',
      methodologyReasoning: learningPlan.methodologyReasoning,
      topics: learningPlan.topics as Array<{
        lessonNumber: number;
        title: string;
        objective: string;
        vocabulary: string[];
        grammarFocus?: string;
        skills: string[];
        context: string;
        methodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
      }>,
    };

    return { 
      success: true, 
      data: planData,
      planId: learningPlan.id 
    };

  } catch (error) {
    console.error('Error fetching learning plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch learning plan' 
    };
  }
}

// Generate AI lesson
export async function generateLesson(
  studentId: string,
  lessonData: {
    lessonNumber: number;
    title: string;
    objective: string;
    vocabulary: string[];
    grammarFocus?: string;
    skills: string[];
    context: string;
    methodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
  },
  duration: 25 | 50 = 50
): Promise<{
  success: boolean;
  data?: { lesson: GeneratedLesson; lessonId: string };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check generation limit
    const canGenerate = await checkAndUpdateGenerationLimit(session.user.id);
    if (!canGenerate) {
      return { success: false, error: 'Daily generation limit reached. Try again tomorrow.' };
    }

    // Get student data
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        tutorId: session.user.id, // Ensure ownership
      },
    });

    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // Convert to StudentProfile
    const studentProfile: StudentProfile = {
      name: student.name,
      targetLanguage: student.targetLanguage,
      nativeLanguage: student.nativeLanguage,
      ageGroup: student.ageGroup,
      level: student.level,
      endGoals: student.endGoals,
      occupation: student.occupation || undefined,
      weaknesses: student.weaknesses || undefined,
      interests: student.interests || undefined,
    };

    // Generate lesson
    const generatedLesson = await geminiService.generateLesson(
      studentProfile,
      lessonData,
      duration
    );

    // Store lesson in database
    const savedLesson = await prisma.lesson.create({
      data: {
        title: generatedLesson.title,
        overview: `${generatedLesson.objective} | Skills: ${generatedLesson.skills.join(', ')} | Type: ${generatedLesson.lessonType}`,
        content: JSON.parse(JSON.stringify(generatedLesson)), // Convert to JSON-compatible format
        studentId: studentId,
        isRefined: true, // AI-generated lessons are considered refined
      },
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    return { 
      success: true, 
      data: { 
        lesson: generatedLesson, 
        lessonId: savedLesson.id 
      } 
    };

  } catch (error) {
    console.error('Error generating lesson:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate lesson' 
    };
  }
}