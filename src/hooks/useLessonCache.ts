// src/hooks/useLessonCache.ts
// TODO: Install @tanstack/react-query before using this hook
// import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  // const queryClient = useQueryClient()

  const prefetchLesson = async (lessonId: string) => {
    // TODO: Implement with React Query when available
    console.log('Prefetching lesson:', lessonId)
    // await queryClient.prefetchQuery({
    //   queryKey: ['lesson', lessonId],
    //   queryFn: () => fetchLesson(lessonId),
    //   staleTime: 5 * 60 * 1000, // 5 minutes
    // })
  }

  const invalidateLesson = (lessonId: string) => {
    // TODO: Implement with React Query when available
    console.log('Invalidating lesson:', lessonId)
    // queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
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
  // TODO: Implement with React Query when available
  console.log('Using lesson hook for:', lessonId)
  return { data: null, isLoading: false, error: null }
  // return useQuery({
  //   queryKey: ['lesson', lessonId],
  //   queryFn: () => fetchLesson(lessonId),
  //   staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  //   cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  // })
}