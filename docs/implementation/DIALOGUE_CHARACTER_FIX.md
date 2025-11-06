# Dialogue Character Format Fix

## Problem

When displaying Under-18 lessons with dialogue exercises, the app threw this error:

```
Objects are not valid as a React child (found: object with keys {name, role, avatar}). 
If you meant to render a collection of children, use an array instead.
```

This error occurred in `DialogueRenderer` at line 149 when it tried to render character objects instead of strings.

---

## Root Cause

The Gemini AI service generates dialogue `characters` as an array of objects:

```typescript
"characters": [
  {"name": "Student", "role": "Learner", "avatar": "You are the student"},
  {"name": "Manager", "role": "Manager", "avatar": "professional"},
  {"name": "Director", "role": "Director", "avatar": "senior professional"}
]
```

However, the `DialogueRenderer` component expected an array of strings:

```typescript
interface DialogueRendererProps {
  characters: string[]  // ← Expected: ["Student", "Manager", "Director"]
  // ...
}
```

The code was incorrectly casting the object array as string array:

```typescript
characters={content.characters as string[]}  // ❌ Wrong
```

When React tried to render this, it attempted to render the objects directly as children, causing the error.

---

## Solution

**File:** `src/lib/lesson-displays/under-18-display.tsx` - Lines 147-164

Updated the dialogue case to extract character names from the object array:

```typescript
case 'dialogue': {
  // Handle characters as array of objects or strings
  const charactersArray = content.characters as Array<{name: string; role?: string; avatar?: string} | string>;
  const characterNames = charactersArray.map((char) => 
    typeof char === 'string' ? char : char.name
  );
  
  return (
    <DialogueRenderer
      title={exercise.title}
      setting={content.setting as string}
      characters={characterNames}  // ✅ Now array of strings: ["Student", "Manager", "Director"]
      dialogue={content.dialogue as Parameters<typeof DialogueRenderer>[0]['dialogue']}
      comprehensionQuestions={content.comprehensionQuestions as Parameters<typeof DialogueRenderer>[0]['comprehensionQuestions']}
      timeMinutes={exercise.timeMinutes}
    />
  )
}
```

---

## How It Works

### Before (❌ Broken)
```
Gemini generates: [{ name: "Student", role: "Learner", ... }, ...]
                          ↓
Cast as string[]: [{ name: "Student", ... }, ...]  ← Wrong type!
                          ↓
DialogueRenderer receives: [Object, Object, Object]
                          ↓
React tries to render: <span>{Object}</span>
                          ↓
Error: Objects are not valid as a React child
```

### After (✅ Fixed)
```
Gemini generates: [{ name: "Student", role: "Learner", ... }, ...]
                          ↓
Extract names: charactersArray.map(char => char.name)
                          ↓
Result: ["Student", "Manager", "Director"]
                          ↓
DialogueRenderer receives: ["Student", "Manager", "Director"]
                          ↓
React renders: <span>Student</span>, <span>Manager</span>, <span>Director</span>
                          ↓
✅ Works correctly!
```

---

## Type Safety

The fix includes proper TypeScript typing:

```typescript
const charactersArray = content.characters as Array<{name: string; role?: string; avatar?: string} | string>;
```

This union type allows the code to handle:
- **Objects:** `{name: "Student", role: "Learner", avatar: "..."}`
- **Strings:** `"Student"` (for backward compatibility if format changes)

---

## Testing

### Test Case: Dialogue Exercise for Under-18 Student

```
1. Create student with ageGroup: "child"
2. Generate lesson
3. View lesson page
4. Navigate to Dialogue exercise (Exercise 4)
5. Expected: ✅ Characters displayed as pills/badges
6. Expected: ✅ Dialogue rendered with proper formatting
7. Expected: ✅ No React errors
```

---

## Affected Components

- **Modified:** `src/lib/lesson-displays/under-18-display.tsx` (Lines 147-164)
  - Dialogue rendering case now extracts character names from objects

- **Unaffected:**
  - `DialogueRenderer` - Still receives array of strings as expected
  - Gemini AI service - Still generates same format
  - Database - No changes needed
  - Other exercise types - Already working correctly

---

## Related Issues

This fix resolves the rendering issue that prevented Under-18 lessons from displaying properly after the recent age-based lessonType fix.

### Timeline
1. ✅ Fixed lessonType generation (now set to "Under-18" for under-18 students)
2. ✅ Fixed dialogue character extraction (this fix)
3. ⏳ Next: Test full Under-18 lesson flow

---

## Summary

The fix properly handles the data transformation between what the Gemini API generates and what the React components expect, ensuring Under-18 lessons with dialogue exercises now render correctly.
