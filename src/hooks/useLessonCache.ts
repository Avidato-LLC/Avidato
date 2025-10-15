// src/hooks/useLessonCache.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Lesson {
  id: string
  title: string
  content: Record<string, unknown>
  student: {
    id: string
    name: string
    level: string
  }
}

export function useLessonCache() {
  const queryClient = useQueryClient()

  const prefetchLesson = async (lessonId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['lesson', lessonId],
      queryFn: () => fetchLesson(lessonId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const invalidateLesson = (lessonId: string) => {
    queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
  }

  return { prefetchLesson, invalidateLesson }
}

async function fetchLesson(lessonId: string): Promise<Lesson> {
  const response = await fetch(`/api/lessons/${lessonId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch lesson')
  }
  return response.json()
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => fetchLesson(lessonId),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}