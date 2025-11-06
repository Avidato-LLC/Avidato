# Lesson Type Fix: Age-Based Under-18 Detection

## Problem

When generating lessons for students in the under-18 age groups (6-12, 13-17), the system was not automatically setting `lessonType` to `"Under-18"`. Instead, it hardcoded the value to `"interactive"`, causing these lessons to use the old rendering system instead of the new 9-exercise modular display system.

### Example Scenario
- Student: Age 8 (Child - 6-12 range)
- Lesson Generated: ❌ Used old functionality instead of new Under-18 display
- Expected: ✅ Should use new modular display system with 9 specialized exercise renderers

---

## Root Cause

**File:** `src/lib/gemini.ts` - Line 551

The `lessonType` was hardcoded in the prompt template:
```typescript
"lessonType": "interactive",  // ← ALWAYS this value
```

This meant:
- ✅ Adults (18+) → `"interactive"` → Old rendering
- ✅ Children (6-12) → `"interactive"` → Old rendering ❌ Should be "Under-18"
- ✅ Teenagers (13-17) → `"interactive"` → Old rendering ❌ Should be "Under-18"

---

## Solution

Changed the hardcoded value to a **dynamic conditional** based on student age group:

```typescript
"lessonType": "${(student.ageGroup === 'child' || student.ageGroup === 'teenager') ? 'Under-18' : 'interactive'}",
```

### How It Works Now

```
student.ageGroup = 'child' (6-12)
    ↓
Check: child OR teenager?
    ↓ YES
lessonType = 'Under-18'
    ↓
Uses new Under18LessonDisplay
    ↓
Displays 9 specialized exercise renderers ✅

---

student.ageGroup = 'teenager' (13-17)
    ↓
Check: child OR teenager?
    ↓ YES
lessonType = 'Under-18'
    ↓
Uses new Under18LessonDisplay
    ↓
Displays 9 specialized exercise renderers ✅

---

student.ageGroup = 'adult-18-39' (18-39)
    ↓
Check: child OR teenager?
    ↓ NO
lessonType = 'interactive'
    ↓
Uses old rendering system ✅
```

---

## Age Group Mapping

| Age Group | Age Range | lessonType | Display System |
|-----------|-----------|-----------|-----------------|
| `child` | 6-12 | `Under-18` | New (9 exercises) |
| `teenager` | 13-17 | `Under-18` | New (9 exercises) |
| `adult-18-39` | 18-39 | `interactive` | Old (existing) |
| `adult-40-59` | 40-59 | `interactive` | Old (existing) |
| `senior` | 60+ | `interactive` | Old (existing) |

---

## Files Modified

1. **`src/lib/gemini.ts`** - Line 551
   - Changed hardcoded `lessonType: "interactive"` to dynamic conditional
   - Now checks `student.ageGroup` at lesson generation time

---

## Impact

### What Changed
- ✅ New lessons for under-18 students will have `lessonType: "Under-18"`
- ✅ New lessons for 18+ students will have `lessonType: "interactive"`
- ✅ Existing lessons in database are unchanged (backward compatible)

### What Stays the Same
- ✅ Adult lessons still use original rendering
- ✅ No API changes needed
- ✅ No database migration needed
- ✅ Fully backward compatible

---

## Testing

### Test Case 1: Generate Lesson for Child (6-12)
```
1. Create student with ageGroup: "child"
2. Generate a lesson
3. Check: lesson.content.lessonType === "Under-18" ✅
4. View lesson page → Should display 9 exercise renderers ✅
```

### Test Case 2: Generate Lesson for Teenager (13-17)
```
1. Create student with ageGroup: "teenager"
2. Generate a lesson
3. Check: lesson.content.lessonType === "Under-18" ✅
4. View lesson page → Should display 9 exercise renderers ✅
```

### Test Case 3: Generate Lesson for Adult (18+)
```
1. Create student with ageGroup: "adult-18-39"
2. Generate a lesson
3. Check: lesson.content.lessonType === "interactive" ✅
4. View lesson page → Should display old rendering ✅
```

---

## How Lesson Rendering Works

### Data Flow (Lesson Page - `src/app/lessons/[id]/page.tsx`)

```
API Returns Lesson
        ↓
Check: lesson.content.lessonType === 'Under-18' ?
        ↓
    YES ↓ NO
        ↓ ├─→ Render: Original exercise display
        ↓
Transform Data
        ↓
Render: <Under18LessonDisplay />
        ↓
Display 9 Specialized Renderers:
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

## No Breaking Changes

✅ **Backward Compatible:**
- Old lessons in database are unaffected
- `lessonType` field is only used for display routing (line 573 of lesson page)
- If `lessonType` doesn't match, defaults to old rendering
- Adults continue to use existing system

✅ **Forward Compatible:**
- Future age groups can easily be added to the condition
- Only one line needs changing to add new age groups to Under-18 system

---

## Related Files

- **Generation:** `src/lib/gemini.ts` (Line 551) - ✅ FIXED
- **Routing:** `src/app/lessons/[id]/page.tsx` (Line 573) - Already in place
- **Display:** `src/lib/lesson-displays/under-18-display.tsx` - Renders 9 exercises
- **Age Mapping:** `src/lib/form-data-mappings.ts` - Defines age groups

---

## Summary

The system now correctly:

1. ✅ Detects when a lesson is being generated for an under-18 student
2. ✅ Sets `lessonType: "Under-18"` in the generated lesson
3. ✅ The lesson page recognizes this flag and uses the new display system
4. ✅ Users see the 9-exercise modular interface for under-18 students
5. ✅ Adults still get the original rendering
6. ✅ Everything is backward compatible

**Generation Flow:**
```
Student(age=8) → generateLesson() → AI checks ageGroup → Sets lessonType="Under-18" → 
DB stores lesson → User views → Page detects "Under-18" → Displays new system ✅
```
