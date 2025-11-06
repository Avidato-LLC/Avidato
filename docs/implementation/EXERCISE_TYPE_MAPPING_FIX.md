# Exercise Type Mapping Fix - Comprehension and Roleplay

## Problem

When viewing Under-18 lessons, the display showed errors for unknown exercise types:
```
Unknown exercise type: comprehension
Unknown exercise type: roleplay
```

This prevented certain exercises from rendering and displaying their content.

---

## Root Cause

The Gemini AI service generates lessons with various exercise types, including:
- **Exercise 4:** `comprehension` (Dialogue Comprehension)
- **Exercise 5:** `roleplay` (Role Play)

However, the Under-18 display system only had hardcoded renderers for specific types and didn't map these AI-generated types to existing renderers that could handle them.

---

## Solution

**File:** `src/lib/lesson-displays/under-18-display.tsx` - Lines 177-211

Added two exercise type mappings to the switch statement:

### 1. Comprehension → Dialogue Completion

```typescript
case 'dialogue-completion':
case 'dialogue_completion':
case 'comprehension':  // ← Added mapping
  return (
    <DialogueCompletionRenderer
      title={exercise.title}
      instructions={exercise.instructions}
      dialogue={content.dialogue as ...}
      timeMinutes={exercise.timeMinutes}
      difficulty={content.difficulty as string}
    />
  )
```

**Why this works:**
- Comprehension exercises contain dialogue with blanks to fill
- `DialogueCompletionRenderer` is designed to display dialogues with missing content
- The data structure matches

### 2. Roleplay → Conversation

```typescript
case 'conversation':
case 'free-conversation':
case 'roleplay':  // ← Added mapping
  return (
    <ConversationRenderer
      instructions={exercise.instructions}
      questions={content.questions as ...}
      timeMinutes={exercise.timeMinutes}
    />
  )
```

**Why this works:**
- Roleplay exercises provide conversation prompts and scenarios
- `ConversationRenderer` handles open-ended conversation exercises
- The data structure (questions/prompts) aligns well

---

## Exercise Type Mapping Chart

| Gemini Type | Mapped Renderer | File |
|-------------|-----------------|------|
| `warm-up` / `warmup` | `WarmUpRenderer` | warm-up.tsx |
| `vocabulary` | `VocabularyRenderer` | vocabulary.tsx |
| `expressions` / `functional-language` | `ExpressionsRenderer` | expressions.tsx |
| `dialogue` | `DialogueRenderer` | dialogue.tsx |
| `dialogue-completion` / `dialogue_completion` / **`comprehension`** | `DialogueCompletionRenderer` | dialogue-completion.tsx |
| `speaking` / `guided-speaking` | `SpeakingRenderer` | speaking.tsx |
| `conversation` / `free-conversation` / **`roleplay`** | `ConversationRenderer` | conversation.tsx |
| `grammar` / `correct-the-mistake` | `GrammarRenderer` | grammar.tsx |
| `challenge` | `ChallengeRenderer` | challenge.tsx |

---

## Data Flow

### Before (❌ Error)
```
Gemini generates: type: "comprehension"
                        ↓
Under-18 Display switch statement
                        ↓
No matching case → Falls to default
                        ↓
Displays: "Unknown exercise type: comprehension" ❌
```

### After (✅ Fixed)
```
Gemini generates: type: "comprehension"
                        ↓
Under-18 Display switch statement
                        ↓
Matches: case 'comprehension'
                        ↓
Renders: DialogueCompletionRenderer ✅
                        ↓
Displays: Dialogue with blanks to fill ✅
```

---

## Testing

### Test Case 1: Comprehension Exercise
```
1. Generate lesson for under-18 student
2. Navigate to Exercise 4 (Dialogue Comprehension)
3. Expected:
   ✅ Dialogue with blanks displays
   ✅ Reveal button works
   ✅ No "Unknown exercise type" error
   ✅ Students can interact with content
```

### Test Case 2: Roleplay Exercise
```
1. Generate lesson for under-18 student
2. Navigate to Exercise 5 (Role Play)
3. Expected:
   ✅ Conversation prompts display
   ✅ Questions shown with follow-ups
   ✅ No "Unknown exercise type" error
   ✅ Students can read and practice
```

### Test Case 3: Complete Lesson Flow
```
1. Create student (age 6-12 or 13-17)
2. Generate lesson
3. Navigate through all 9 exercises
4. Expected:
   ✅ All exercises render without errors
   ✅ No "Unknown exercise type" messages
   ✅ All content displays correctly
   ✅ Navigation works smoothly
```

---

## Files Modified

### `src/lib/lesson-displays/under-18-display.tsx`

**Changes:**
- Line 179: Added `case 'comprehension':` to dialogue-completion case group
- Line 201: Added `case 'roleplay':` to conversation case group

**No new files created** - Used existing renderers that were already compatible

---

## Backward Compatibility

✅ **Fully backward compatible:**
- Existing exercise types still work
- New mappings don't affect other types
- If Gemini generates other unknown types, they still show the unknown type message
- Can easily add more mappings in future

---

## Related Components

| Component | Purpose | Status |
|-----------|---------|--------|
| `under-18-display.tsx` | Exercise router/orchestrator | ✅ Fixed |
| `dialogue-completion.tsx` | Renders comprehension exercises | ✅ Used for comprehension |
| `conversation.tsx` | Renders conversation exercises | ✅ Used for roleplay |
| `gemini.ts` | AI lesson generator | ✅ Generates these types |

---

## Summary

The fix maps two AI-generated exercise types (`comprehension` and `roleplay`) to existing, compatible renderers:
- `comprehension` → `DialogueCompletionRenderer`
- `roleplay` → `ConversationRenderer`

This allows all AI-generated Under-18 lessons to display their full content without errors, while remaining flexible for future exercise types.

