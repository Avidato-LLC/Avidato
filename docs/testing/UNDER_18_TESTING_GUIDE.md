# Testing Under-18 Lesson Display - Complete Guide

## Overview

This guide provides steps to test the complete Under-18 lesson generation and display system after the recent fixes.

---

## Recent Fixes Applied

### 1. ✅ Lesson Type Generation (src/lib/gemini.ts:551)
- **What:** Fixed lesson generation to set `lessonType: "Under-18"` for students aged 6-17
- **Condition:** `student.ageGroup === 'child'` OR `student.ageGroup === 'teenager'`
- **Result:** Lessons generated for under-18 students now have the correct type flag

### 2. ✅ Dialogue Character Rendering (src/lib/lesson-displays/under-18-display.tsx:147-164)
- **What:** Fixed character extraction from dialogue exercise data
- **Issue:** Dialogue characters were generated as objects `{name, role, avatar}` but renderer expected strings
- **Fix:** Extract character names from objects before passing to DialogueRenderer
- **Result:** Dialogue exercises now render without React errors

---

## Test Scenario 1: Create and Generate Lesson for Child (6-12)

### Setup
```
1. Go to Dashboard → Students
2. Create new student with these details:
   - Name: Test Child
   - Age Group: Child (6-12 years)  ← KEY: Under-18 range
   - Level: A1 (Beginner)
   - Target Language: English
3. Save student
```

### Generate Lesson
```
1. Click on "Test Child" student
2. Go to "Generate Lesson" section
3. Select a topic (e.g., "Daily Routines")
4. Click "Generate Lesson"
5. Wait for AI to generate (~30 seconds)
```

### Verify Generation
```
✅ Check 1: Lesson created successfully
   - You should see new lesson in the lessons list
   - Status should show "Generated" or similar

✅ Check 2: Lesson type set correctly
   - Open browser DevTools (F12)
   - Console: Run this check:
     const lessonElement = document.querySelector('[data-lesson-id]')
     // Should show: lessonType: "Under-18"
```

### Test Display
```
1. Click on the generated lesson to open it
2. Verify you see the Under-18 display:
   ✅ Navigation bar showing exercise progress
   ✅ Learning objectives section
   ✅ Progress bar
   ✅ Exercise navigation buttons (Next/Previous)
```

---

## Test Scenario 2: Verify Each Exercise Type Renders

### Navigate Through Exercises

Navigate to each exercise and verify it renders without errors:

#### Exercise 1: Warm-up
```
✅ Expected:
- Questions displayed
- Instructions clear
- Timer showing "5-10 minutes"
- No React console errors
```

#### Exercise 2: Vocabulary
```
✅ Expected:
- Vocabulary items listed (6-8 items)
- Each item has: word, definition, example, synonym
- Practice activities visible
- No rendering errors
```

#### Exercise 3: Expressions
```
✅ Expected:
- Functional expressions displayed
- Example sentences shown
- Pronunciation guides visible
- No errors in console
```

#### Exercise 4: Dialogue ⭐ (Critical for this fix)
```
✅ Expected:
- Setting displayed at top
- Character pills/badges showing names (NOT objects)
  Examples: "Student" "Manager" "Director"
  NOT: "[object Object]"
- Dialogue exchanges with character names and text
- Translation toggle working
- Comprehension questions below dialogue
- CRITICAL: No React error about "Objects are not valid as a React child"
```

#### Exercise 5: Grammar
```
✅ Expected:
- Grammar rules displayed
- Practice sentences shown
- Instructions clear
- No errors
```

#### Exercise 6: Dialogue Completion
```
✅ Expected:
- Dialogue with blanks to fill
- Reveal button working
- Characters extracted properly
- No rendering errors
```

#### Exercise 7: Speaking
```
✅ Expected:
- Speaking prompts displayed
- Questions shown
- Instructions clear
- Recording button present (if audio enabled)
```

#### Exercise 8: Conversation
```
✅ Expected:
- Conversation scenarios displayed
- Response options shown
- Proper formatting
- No errors
```

#### Exercise 9: Challenge
```
✅ Expected:
- Challenge exercise displayed
- Difficulty level shown
- Tasks clear
- No rendering errors
```

---

## Test Scenario 3: Navigation Between Exercises

```
1. Start at Exercise 1
2. Click "Next Exercise" button
   ✅ Should navigate to Exercise 2
   ✅ Progress bar should update
   ✅ Exercise number should increment

3. Click "Previous Exercise" button
   ✅ Should navigate back to Exercise 1
   ✅ Progress bar should update correctly
   ✅ Exercise number should decrement

4. Click exercise number buttons directly
   ✅ Should jump to that exercise
   ✅ All content should load correctly
```

---

## Test Scenario 4: Test with Teenager (13-17)

### Setup
```
1. Create new student with:
   - Age Group: Teenager (13-17 years)  ← KEY: Under-18 range
   - Other details same as above
2. Generate lesson for this student
```

### Verify
```
✅ Should use same Under-18 display system
✅ All exercises should render correctly
✅ No difference from child student display
```

---

## Test Scenario 5: Test with Adult (18+)

### Setup
```
1. Create new student with:
   - Age Group: Adult (18-39 years)  ← NOT under-18
   - Other details same as above
2. Generate lesson for this student
```

### Verify
```
✅ Should use OLD rendering system (NOT new Under-18 display)
✅ Should show original exercise layout
✅ Should have different styling than Under-18 display
✅ All content should still render correctly
```

---

## Test Scenario 6: Mobile View

### Test on Mobile/Tablet
```
1. Open lesson on mobile device (or use Chrome DevTools device emulation)
2. Test each exercise renders properly
3. Verify:
   ✅ Text readable
   ✅ Navigation buttons accessible
   ✅ No horizontal scrolling needed
   ✅ Dialogue characters display correctly
   ✅ All interactive elements work
```

---

## Test Scenario 7: Dark Mode

```
1. Enable dark mode in browser settings
2. View lesson
3. Navigate through exercises
4. Verify:
   ✅ All text readable
   ✅ Colors contrasts adequate
   ✅ Dialogue renders properly
   ✅ No elements hidden in dark mode
```

---

## Console Error Checklist

### Before and After Testing

When viewing any Under-18 lesson, the browser console should show:

```
❌ ERRORS THAT SHOULD NOT APPEAR:
- "Objects are not valid as a React child (found: object with keys {name, role, avatar})"
- "Cannot read property 'name' of undefined"
- "TypeError: characters is not iterable"
- "Invalid prop 'characters' supplied"

✅ MAY APPEAR (but not critical):
- Warnings about unused props
- Network requests to AI API
- Cache-related messages
```

---

## Test Case Summary

| Test | Student Type | Expected | Status |
|------|-------------|----------|--------|
| Scenario 1 | Child (6-12) | Under-18 display | ⏳ |
| Scenario 2 | Child (6-12) | All 9 exercises render | ⏳ |
| Scenario 3 | Child (6-12) | Navigation works | ⏳ |
| Scenario 4 | Teenager (13-17) | Under-18 display | ⏳ |
| Scenario 5 | Adult (18+) | Old display | ⏳ |
| Scenario 6 | Child (6-12) | Mobile responsive | ⏳ |
| Scenario 7 | Child (6-12) | Dark mode works | ⏳ |

---

## Common Issues and Solutions

### Issue: Dialogue shows "[object Object]" instead of character names

**Cause:** Character extraction not working
**Solution:** Verify the fix in `under-18-display.tsx` lines 147-164
**Check:** 
```typescript
const characterNames = charactersArray.map((char) => 
  typeof char === 'string' ? char : char.name
);
```

### Issue: Lesson uses old display instead of new one

**Cause:** lessonType not set to "Under-18"
**Solution:** Verify the fix in `gemini.ts` line 551
**Check:**
```typescript
"lessonType": "${(student.ageGroup === 'child' || student.ageGroup === 'teenager') ? 'Under-18' : 'interactive'}",
```

### Issue: React error about "Objects are not valid as a React child"

**Cause:** One of the renderers receiving wrong data type
**Solution:** 
1. Check console error shows line number
2. Find corresponding renderer
3. Add data extraction/transformation as done for dialogue
4. Map objects to expected format

### Issue: Navigation buttons not working

**Cause:** Possible issue with exercise index state
**Solution:** 
1. Check browser console for errors
2. Verify exercise array is not empty
3. Test with different lesson
4. Check network tab for API errors

---

## Quick Verification Commands

### Check lessonType Setting
```javascript
// In browser console while viewing lesson
const content = document.querySelector('[data-lesson-content]')?.textContent;
console.log(content);
// Should contain or show: lessonType: "Under-18"
```

### Check Character Rendering
```javascript
// In browser console on Dialogue exercise
const characters = document.querySelectorAll('[data-character]');
characters.forEach(char => console.log(char.textContent));
// Should show: Student, Manager, Director
// NOT: [object Object]
```

### Check Exercise Array
```javascript
// Verify all 9 exercises are present
const exercises = document.querySelectorAll('[data-exercise-number]');
console.log(`Total exercises: ${exercises.length}`);
// Should show: Total exercises: 9
```

---

## Success Criteria

All tests pass when:

✅ Under-18 students see new display system with 9 exercises
✅ Each exercise renders without errors
✅ Dialogue exercises show character names (not objects)
✅ Navigation between exercises works smoothly
✅ Adult students see original display system unchanged
✅ Mobile and dark mode work correctly
✅ No React console errors about objects or rendering

---

## Reporting Issues

If you encounter any issues:

1. Note the specific exercise where error occurs
2. Check browser console for exact error message
3. Note student age group tested with
4. Try same test with different student age group
5. Report with:
   - Student age group
   - Exercise type
   - Exact error message
   - Browser/device used

