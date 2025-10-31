// CEFRLessonGenerator selects the correct module and generates lessons for any CEFR level

import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';
import { CEFRLessonModule } from './CEFRLessonModule';
import { A1LessonModule } from './A1LessonModule';
import { A2LessonModule } from './A2LessonModule';
import { B1LessonModule } from './B1LessonModule';
import { B2LessonModule } from './B2LessonModule';
import { C1LessonModule } from './C1LessonModule';
import { C2LessonModule } from './C2LessonModule';

export class CEFRLessonGenerator {
  private modules: Record<string, CEFRLessonModule>;

  constructor() {
    this.modules = {
      A1: new A1LessonModule(),
      A2: new A2LessonModule(),
      B1: new B1LessonModule(),
      B2: new B2LessonModule(),
      C1: new C1LessonModule(),
      C2: new C2LessonModule(),
    };
  }

  /**
   * Selects the correct module based on student CEFR level and generates a lesson
   */
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
  const lessonModule = this.modules[student.level];
  if (!lessonModule) throw new Error(`Unsupported CEFR level: ${student.level}`);
  return lessonModule.generateLesson(student, topic, duration);
  }

  /**
   * Filters vocabulary for the student's CEFR level
   */
  getVocabularyForLevel(level: string, words: string[]): string[] {
  const lessonModule = this.modules[level];
  if (!lessonModule) throw new Error(`Unsupported CEFR level: ${level}`);
  return lessonModule.getVocabularyForLevel(words);
  }
}
