// src/hooks/useLessonPrefetch.ts
import { useRouter } from 'next/navigation'

export function useLessonPrefetch() {
  const router = useRouter()

  const prefetchLesson = (lessonId: string) => {
    // Prefetch the lesson page
    router.prefetch(`/lessons/${lessonId}`)
    
    // Preload the lesson data
    fetch(`/api/lessons/${lessonId}`)
      .then(response => response.json())
      .catch(error => console.log('Prefetch failed:', error))
  }

  const prefetchLessonList = (studentId: string) => {
    fetch(`/api/students/${studentId}/lessons`)
      .then(response => response.json())
      .catch(error => console.log('Lesson list prefetch failed:', error))
  }

  return { prefetchLesson, prefetchLessonList }
}