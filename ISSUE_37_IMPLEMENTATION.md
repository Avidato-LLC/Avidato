# Issue #37: Avoid Redundant Vocabulary Across Sequential Lessons

## Problem Statement
Previously, there was no mechanism to prevent vocabulary from being repeatedly taught across consecutive lessons. This meant:
- Students could encounter the same words in back-to-back lessons (waste of learning time)
- No tracking of which lessons were actually shared/taught to students
- No context for AI to understand the student's recent learning journey
- Vocabulary continuity was left to chance rather than design

## Solution Overview

### Core Concept
Each student's learning journey is tracked by marking lessons as **shared** (taught). When generating a new lesson, the system:
1. Retrieves vocabulary from the most recently shared lessons (last 1-3)
2. Passes this context to the AI prompt
3. AI naturally incorporates previous vocabulary into dialogues for reinforcement
4. Prevents explicit re-teaching of words from immediately preceding lessons

### Key Features
- **Tracked Sharing**: Lessons marked as "shared" with students via `sharedAt` timestamp
- **Vocabulary Context**: Extract and analyze vocabulary from shared lessons
- **Natural Reuse**: Previous vocabulary appears in dialogues when contextually appropriate
- **Intelligent Filtering**: Only vocabulary from 1-2 lessons back (fresh context)
- **Modular Architecture**: Clean separation of tracking, AI, and UI concerns

---

## Architecture: Modular Design

### 1. Database Layer (`prisma/schema.prisma`)
```prisma
model Lesson {
  // ... existing fields ...
  sharedAt  DateTime?  // Issue #37: When lesson was shared with student
  // ... relationships ...
}
```

**Migration**: `add_shared_at_to_lesson`

### 2. Business Logic Layer (`src/lib/vocabulary-tracker.ts`)

**Pure Functions** (no side effects):

```typescript
// Extract vocabulary from lesson content
extractVocabularyFromLesson(lessonContent): ExtractedVocabulary[]

// Merge multiple vocabulary lists
mergeVocabulary(vocabularies): ExtractedVocabulary[]

// Get vocabulary context for new lesson generation
getVocabularyContext(studentId): Promise<VocabularyContext>

// Mark lesson as shared
markLessonAsShared(lessonId): Promise<{ success, lesson }>

// Get complete vocabulary history
getVocabularyHistory(studentId): Promise<Array<{lessonTitle, vocabulary, sharedAt}>>
```

**Benefits**:
- Testable in isolation
- Reusable across API routes, server actions, hooks
- Clear interfaces and contracts
- No coupling to UI or generation logic

### 3. AI Service Integration (`src/lib/gemini.ts`)

Added vocabulary context section to lesson generation prompt:

```typescript
// In generateLesson() method
if (topic.shouldReuseVocabularyInDialogue && topic.previousVocabulary) {
  vocabularyContextSection = `
    ISSUE #37 - VOCABULARY CONTINUITY:
    The student has just completed: "${topic.previousLessonTitle}"
    From that lesson, they learned: [word list]
    
    CRITICAL INSTRUCTION FOR DIALOGUE EXERCISE:
    - Naturally incorporate 2-3 of these previously learned words
    - Do NOT re-teach them
    - Use ONLY if contextually appropriate
    - If not applicable, OMIT entirely
  `;
}
```

**Result**: AI knows student's recent vocabulary and can naturally reinforce it.

### 4. Type System (`src/types/lesson-template.ts`)

Extended `LearningTopic` interface:

```typescript
interface LearningTopic {
  // ... existing fields ...
  previousVocabulary?: Array<{
    word: string;
    definition: string;
    example?: string;
  }>;
  previousLessonTitle?: string;
  shouldReuseVocabularyInDialogue?: boolean;
}
```

**Benefits**:
- Type-safe vocabulary context passing
- Optional fields (backward compatible)
- Clear contract for AI service

### 5. Server Actions (`src/app/actions/ai-generation.ts`)

**generateLesson()**:
```typescript
// Step 1: Get vocabulary context
const vocabContext = await getVocabularyContext(studentId);

// Step 2: Pass to lesson data
const lessonDataWithContext = {
  ...lessonData,
  previousVocabulary: vocabContext.previousVocabulary,
  previousLessonTitle: vocabContext.previousLessonTitle,
  shouldReuseVocabularyInDialogue: vocabContext.shouldReuseInDialogue,
};

// Step 3: Generate with context
const generatedLesson = await geminiService.generateLesson(
  studentProfile,
  lessonDataWithContext,
  duration
);
```

**shareLesson()**:
```typescript
// Mark lesson as shared by setting sharedAt timestamp
await prisma.lesson.update({
  where: { id: lessonId },
  data: { sharedAt: new Date() },
});
```

**Benefits**:
- Centralized lesson generation logic
- Automatic vocabulary context fetching
- Transaction-like behavior (verify ownership before share)

### 6. React Hooks (`src/hooks/useLessonSharing.ts`)

**Modular Hook Pattern**:
```typescript
interface UseLessonSharingResult {
  isSharing: boolean;           // Loading state
  shareLesson: (id, studentId) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

export function useLessonSharing(): UseLessonSharingResult
```

**Usage**:
```typescript
const { isSharing, shareLesson, error } = useLessonSharing();
await shareLesson(lessonId, studentId);
```

**Benefits**:
- Reusable across any component that needs sharing
- Encapsulated state management
- Error handling built-in
- Can be tested independently

### 7. UI Component (`src/components/lesson/LessonCard.tsx`)

**Smart Card Component**:
- Displays lesson with metadata
- Shows share button (if not shared)
- Shows share icon and "Shared" badge (if shared)
- Loading states during API call
- Error display
- Optional callback on successful share

```tsx
<LessonCard
  lesson={{id, title, overview, createdAt, sharedAt}}
  studentId="student-123"
  onShare={() => { /* refetch lessons */ }}
/>
```

**Benefits**:
- Reusable lesson display
- Consistent UI across pages
- Single source of truth for sharing logic
- Easy to integrate into lists or grids

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Tutor Interface                          │
│              (Student Profile Page)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. Click "Share" on lesson card
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              LessonCard Component                           │
│         (src/components/lesson/LessonCard.tsx)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. Call useLessonSharing hook
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            useLessonSharing Hook                            │
│          (src/hooks/useLessonSharing.ts)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 3. Call shareLesson server action
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Server Action: shareLesson()                        │
│        (src/app/actions/ai-generation.ts)                   │
│                                                             │
│ - Verify student ownership                                 │
│ - Mark lesson.sharedAt = now()                             │
│ - Revalidate cache                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Database Updated    │
         │  (sharedAt timestamp) │
         └───────────────────────┘

────────────────────────────────────────────────────────────────

LATER: When Generating Next Lesson:

┌──────────────────────────────────────────────────────────────┐
│            Lesson Generation Flow                           │
│                                                              │
│ generateLesson(studentId, topic, duration)                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ 1. Fetch vocabulary context
                     ▼
┌──────────────────────────────────────────────────────────────┐
│    getVocabularyContext(studentId)                          │
│         (vocabulary-tracker.ts)                             │
│                                                              │
│ - Query: Find lessons WHERE sharedAt != null                │
│ - Sort by sharedAt DESC (most recent first)                 │
│ - Take last 3 shared lessons                                │
│ - Extract vocabulary from Exercise 1 of each                │
│ - Calculate lessonsBetween                                  │
│ - Determine if should reuse in dialogue                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ 2. Returns: VocabularyContext
                     │ {
                     │   previousLessonTitle: "...",
                     │   previousVocabulary: [words...],
                     │   lessonsBetween: 0,
                     │   shouldReuseInDialogue: true
                     │ }
                     ▼
┌──────────────────────────────────────────────────────────────┐
│         generateLesson() in GeminiService                    │
│            (src/lib/gemini.ts)                              │
│                                                              │
│ - Build vocabularyContextSection                            │
│ - Add to AI prompt: "Previous lesson vocabulary: ..."       │
│ - Instruct: "Naturally use 2-3 words if applicable"         │
│ - Instruct: "Do NOT re-teach, only reinforce"              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ 3. Call Gemini API with context
                     ▼
         ┌───────────────────────────┐
         │  Gemini AI Response       │
         │  Generated Lesson with:   │
         │  - New vocabulary (Exer 1)│
         │  - Dialogue using both    │
         │    new + previous words   │
         └───────────────────────────┘
```

---

## Implementation Checklist

### ✅ Completed
- [x] Add `sharedAt` field to Lesson model
- [x] Create `vocabulary-tracker.ts` module with 5 functions
- [x] Update `LearningTopic` type with vocabulary context
- [x] Modify `generateLesson()` to build vocabulary context
- [x] Update `generateLesson` server action to fetch context
- [x] Create `shareLesson` server action
- [x] Create `useLessonSharing` hook
- [x] Create `LessonCard` component with share button
- [x] Add migration `add_shared_at_to_lesson`

### 🔄 Pending
- [ ] Run `prisma migrate dev` once database is connected
- [ ] Regenerate Prisma client (auto on migration)
- [ ] Integration with existing StudentProfilePage to display lessons with cards
- [ ] End-to-end testing: share lesson → generate new → verify vocabulary reuse
- [ ] Performance testing (vocabulary context fetch time)

---

## Testing Strategy

### Unit Tests (For vocabulary-tracker.ts)
```typescript
// extractVocabularyFromLesson
- Empty lesson content → returns []
- Lesson with vocabulary → returns correct items
- Malformed vocabulary → skips invalid items

// mergeVocabulary
- Empty arrays → returns []
- Duplicate words → deduplicates (case-insensitive)
- Multiple lists → preserves order

// getVocabularyContext
- No shared lessons → returns empty context
- Recent shared lessons → returns correct vocabulary
- Lesson 3+ back → marked as shouldReuseInDialogue: false
```

### Integration Tests
```typescript
// Full workflow
1. Create student
2. Generate Lesson 1
3. Share Lesson 1 (set sharedAt)
4. Generate Lesson 2
   - Verify vocabulary context includes Lesson 1 vocab
   - Verify shouldReuseInDialogue = true
5. Verify generated Lesson 2 dialogue uses Lesson 1 vocabulary naturally
```

### Manual Testing
1. Tutor navigates to student profile
2. Sees list of generated lessons
3. Clicks "Share" on a lesson
4. Button changes to "✓ Shared" with green badge
5. Share icon displays on lesson card
6. Generate new lesson → Verify AI incorporated previous vocabulary

---

## Performance Considerations

### Database Queries
- **getVocabularyContext()**: 
  - Single query with take(3) - efficient
  - Only queries lessons with sharedAt != null
  - Could be cached per student (invalidate on share)

### AI API Impact
- Vocabulary context adds ~200 tokens to prompt
- No additional API calls needed
- Context helps AI generate better dialogue

### UI Responsiveness
- Share button shows loading state during API call (~1-2s)
- No blocking operations
- Error states graceful

---

## Future Enhancements

1. **Vocabulary Dashboard**
   - Show tutor which vocabularies have been covered
   - Identify gaps in learning
   - Suggest reinforcement lessons

2. **Adaptive Difficulty**
   - Track vocabulary mastery over lessons
   - Adjust new vocabulary introduction rate

3. **Spaced Repetition**
   - Systematically reintroduce vocabulary at optimal intervals
   - Based on cognitive science (forgetting curve)

4. **Vocabulary Clustering**
   - Group related vocabularies (word families)
   - Teach related words together

5. **AI Optimization**
   - Fine-tune vocabulary context weighting
   - Learn optimal reinforce/teach ratio per student

---

## Files Modified/Created

### Created Files
1. `src/lib/vocabulary-tracker.ts` (253 lines)
2. `src/hooks/useLessonSharing.ts` (54 lines)
3. `src/components/lesson/LessonCard.tsx` (117 lines)
4. `prisma/migrations/add_shared_at_to_lesson/` (migration)

### Modified Files
1. `prisma/schema.prisma` (added `sharedAt` field)
2. `src/types/lesson-template.ts` (extended `LearningTopic` interface)
3. `src/lib/gemini.ts` (added vocabulary context to prompt)
4. `src/app/actions/ai-generation.ts` (fetch context + share action)

### Summary
- **Total Lines Added**: ~424 lines of business logic + UI
- **Total Lines Removed**: 0 (backward compatible)
- **New Functions**: 6 (5 in tracker + 1 server action)
- **New Hooks**: 1
- **New Components**: 1
- **Database Migrations**: 1

---

## Issue Closure Criteria

- [x] Lessons can be marked as "shared" with timestamp
- [x] Previous vocabulary automatically fetched when generating new lessons
- [x] AI prompt includes vocabulary context for natural reuse
- [x] UI shows share button on lesson cards
- [x] Share functionality is modular and reusable
- [x] Vocabulary reuse is natural (in dialogue only, not re-teaching)
- [x] No breaking changes to existing functionality
- [ ] PR reviewed and merged to main
- [ ] Tested end-to-end in production

---

## Modularity Principles Applied

1. **Separation of Concerns**
   - Tracking logic ≠ Generation logic ≠ UI logic
   - Each module has single responsibility

2. **Pure Functions**
   - `extractVocabularyFromLesson()`, `mergeVocabulary()` are pure
   - Predictable, testable, cacheable

3. **Reusable Abstractions**
   - Hook pattern for share functionality
   - Component pattern for lesson card
   - Service pattern for vocabulary tracking

4. **Clear Interfaces**
   - Types define contracts between modules
   - Optional fields for backward compatibility

5. **DRY (Don't Repeat Yourself)**
   - `useLessonSharing` can be used in multiple components
   - `LessonCard` component standardizes lesson display
   - `vocabulary-tracker` functions used by multiple callers

---

## Troubleshooting

### Issue: TypeScript errors about `sharedAt`
- **Cause**: Prisma client not regenerated after migration
- **Fix**: Run `npx prisma generate` or `npx prisma migrate dev`

### Issue: Shared lessons not appearing with icon
- **Cause**: Cache not revalidated
- **Fix**: Ensure `revalidatePath()` called in `shareLesson` action

### Issue: Vocabulary not appearing in dialogue
- **Cause**: `shouldReuseInDialogue` = false
- **Fix**: Check `lessonsBetween` - only reuse if ≤ 2 lessons back

### Issue: Too many API calls for vocabulary context
- **Cause**: Fetching context on every lesson generation
- **Fix**: Cache vocabulary context per student (implement later)
