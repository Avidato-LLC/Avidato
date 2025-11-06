# Age Check Logic: Under-18 Student Detection

## Overview
The system checks if a student is under 18 and should use the specialized lesson display system based on a **lesson type flag**, not actual age calculation.

---

## Where the Check is Performed

### Location: `src/app/lessons/[id]/page.tsx` - Line 573

```tsx
{lesson.content.lessonType === 'Under-18' ? (
  <Under18LessonDisplay
    lesson={transformToUnder18Lesson(lesson)}
    studentName={lesson.student.name}
    showObjectives={true}
    showProgressBar={true}
  />
) : (
  // ... existing exercise rendering for non-Under-18 lessons
)}
```

---

## How It Works

### 1. Data Structure: `LessonData` Interface
The API returns lesson data with this structure:

```typescript
interface LessonData {
  id: string
  title: string
  overview: string | null
  content: {
    title: string
    lessonType: string          // ← KEY FIELD: 'Under-18' or other value
    difficulty: number
    duration: number
    objective: string
    skills: string[]
    vocabulary: any[]
    context: string
    exercises: Exercise[]
    // ... other optional fields
  }
  createdAt: Date
  student: {
    id: string
    name: string
    targetLanguage: string
    level: string
  }
}
```

### 2. The Check Logic

**Simple String Comparison:**
```tsx
lesson.content.lessonType === 'Under-18'
```

**What this means:**
- If `lessonType` equals the string `'Under-18'` → Use new display system
- If `lessonType` is anything else → Use existing display system

### 3. Data Transformation

If the check passes (true), the `transformToUnder18Lesson()` function converts the API data:

```typescript
const transformToUnder18Lesson = (lessonData: LessonData) => {
  return {
    metadata: {
      id: lessonData.id,
      title: lessonData.content.title,
      level: lessonData.student.level,
      topic: lessonData.content.title,
      duration: lessonData.content.duration,
      difficulty: lessonData.content.difficulty,
      targetAudience: 'Students Under 18',
      ageGroup: 'Under 18'
    },
    learningObjectives: {
      communicative: [],
      linguistic: [],
      cultural: []
    },
    exercises: lessonData.content.exercises.map((exercise, index) => ({
      id: `exercise-${index}`,
      number: index + 1,
      type: exercise.type,
      title: exercise.title,
      description: exercise.description,
      timeMinutes: exercise.timeMinutes,
      instructions: exercise.description,
      content: (typeof exercise.content === 'object' && exercise.content !== null) 
        ? (exercise.content as Record<string, unknown>) 
        : {}
    }))
  }
}
```

---

## Flow Diagram

```
API Response (LessonData)
        ↓
Check: lesson.content.lessonType === 'Under-18' ?
        ↓
    YES ↓ NO
        ↓ ↓
        ↓ └→ Render with existing system
        ↓
    Transform to Under18Lesson format
        ↓
    Render <Under18LessonDisplay />
        ↓
    Display 9 specialized exercise renderers:
    - Warm-up
    - Vocabulary
    - Expressions
    - Dialogue
    - Grammar
    - Dialogue Completion
    - Speaking
    - Conversation
    - Challenge
```

---

## Important Notes

### ⚠️ This is NOT Actual Age Verification
- The system does **NOT** check the student's actual date of birth
- It uses a **lesson type flag** from the database
- The `LessonData.student` object does **NOT** contain age information
- It's metadata about how the lesson is designed, not about the student's actual age

### 🔑 Key Field: `lesson.content.lessonType`
- **Source:** Database/API response
- **Type:** String
- **Current values:** `'Under-18'` or other values
- **Location in LessonData:** `lesson.content.lessonType`

### 📊 Display Logic
| Condition | Result | Component Used |
|-----------|--------|-----------------|
| `lessonType === 'Under-18'` | TRUE | `<Under18LessonDisplay />` |
| `lessonType !== 'Under-18'` | FALSE | Original exercise rendering |
| `lessonType` is undefined | FALSE | Original exercise rendering |

---

## Related Files

### Core Implementation
- **`src/app/lessons/[id]/page.tsx`** (Line 573) - Contains the check and conditional rendering

### Data Transformation
- **Lines 71-101** - `transformToUnder18Lesson()` function

### Display Component
- **`src/lib/lesson-displays/under-18-display.tsx`** - Renders the 9 specialized exercises

### Supported Exercise Types
The new display supports these exercise types (defined in renderers):
- `warm-up` - Warm-up exercises
- `vocabulary` - Vocabulary learning
- `expressions` - Expression practice
- `dialogue` - Dialogue exercises
- `grammar` - Grammar exercises
- `dialogue-completion` - Complete the dialogue
- `speaking` - Speaking practice
- `conversation` - Conversation exercises
- `challenge` - Challenge exercises

---

## How to Test

### Test Case 1: Under-18 Lesson
1. Create or fetch a lesson with `lessonType: 'Under-18'`
2. Visit `/lessons/[id]`
3. Should display: New `Under18LessonDisplay` component with 9 exercises

### Test Case 2: Regular Lesson
1. Create or fetch a lesson with different `lessonType` value (e.g., `'Standard'` or `'General'`)
2. Visit `/lessons/[id]`
3. Should display: Original exercise rendering

### Test Case 3: No Lesson Type
1. Fetch a lesson without `lessonType` field
2. Visit `/lessons/[id]`
3. Should display: Original exercise rendering (falls through to else branch)

---

## Database Consideration

To support this system, ensure lessons in the database have:

```sql
-- Example lesson record
{
  id: "lesson-123",
  content: {
    title: "Daily Routines",
    lessonType: "Under-18",  -- ← This determines display system
    difficulty: 2,
    duration: 45,
    objective: "Learn daily routines",
    exercises: [...]
  }
}
```

---

## Future Enhancements

If actual age verification is needed, consider:

1. **Add age field to student profile:**
   ```typescript
   student: {
     id: string
     name: string
     dateOfBirth: Date  // ← New field
     targetLanguage: string
     level: string
   }
   ```

2. **Calculate age and check:**
   ```typescript
   const calculateAge = (dob: Date): number => {
     const now = new Date()
     return now.getFullYear() - dob.getFullYear()
   }
   
   const isUnder18 = calculateAge(student.dateOfBirth) < 18
   ```

3. **Use calculated age instead of lesson type flag:**
   ```tsx
   {isUnder18 ? <Under18LessonDisplay ... /> : ...}
   ```

