# Roleplay & Discussion Renderers - Exercise Type Complete Fix

## Problem

When viewing roleplay or discussion exercises, the app crashed:
```
Cannot read properties of undefined (reading 'map')
at ConversationRenderer (src/lib/lesson-displays/renderers/conversation.tsx:41:20)
```

The exercises were being routed to `ConversationRenderer`, which expected `questions` field, but roleplay and discussion have completely different data structures.

---

## Root Cause - Multiple Data Structure Mismatch

### Data Structures

**Roleplay Exercise (from Gemini):**
```typescript
{
  "type": "roleplay",
  "title": "Exercise 5: Role Play",
  "content": {
    "scenario": "You and your partner are...",
    "roles": [
      {
        "name": "Student A",
        "description": "You are...",
        "keyPoints": ["Use vocabulary", "Keep natural"]
      },
      {
        "name": "Student B",
        "description": "You are...",
        "keyPoints": ["Ask questions", "Use context"]
      }
    ],
    "instructions": "Have a 5-minute conversation"
  }
}
```

**Discussion Exercise (from Gemini):**
```typescript
{
  "type": "discussion",
  "title": "Exercise 6: Discussion",
  "content": {
    "questions": [  // ← Array of STRINGS, not objects!
      "Question encouraging vocabulary use",
      "Question about personal experience",
      "Question requiring opinion with vocabulary"
    ],
    "instructions": "Discuss these questions"
  }
}
```

**Conversation Exercise (from Gemini):**
```typescript
{
  "type": "conversation",
  "content": {
    "questions": [  // ← Array of OBJECTS with question/followUpQuestions
      {
        "question": "What is your hobby?",
        "followUpQuestions": ["Why do you like it?"],
        "vocabulary": ["hobby", "interest"]
      }
    ]
  }
}
```

### The Problem

All three were being routed to `ConversationRenderer`:
```typescript
case 'conversation':
case 'free-conversation':
case 'roleplay':      // ❌ Wrong - has scenario & roles, not questions
case 'discussion':    // ❌ Wrong - has string[], not object[]
  return <ConversationRenderer ... />
```

`ConversationRenderer` tried to map over `questions`:
```typescript
{questions.map((prompt, index) => (...))}
                 ↑
        undefined for roleplay (has no questions field)
        or wrong format for discussion (string[] not object[])
```

---

## Solution

### 1. Created RoleplayRenderer

**File:** `src/lib/lesson-displays/renderers/roleplay.tsx` (NEW)

Handles role-play scenarios with:
- ✅ Scenario description display
- ✅ Multiple roles with descriptions
- ✅ Key points for each role (expandable)
- ✅ Role numbering and visual indication
- ✅ Practice instructions
- ✅ Purple color theme

```typescript
interface RoleplayRendererProps {
  title: string
  instructions: string
  scenario: string
  roles: Array<{
    name: string
    description: string
    keyPoints?: string[]
  }>
  timeMinutes: number
}
```

### 2. Created DiscussionRenderer

**File:** `src/lib/lesson-displays/renderers/discussion.tsx` (NEW)

Handles discussion questions with:
- ✅ Open-ended question display
- ✅ Expandable think-about prompts
- ✅ Discussion tips for each question
- ✅ Question numbering
- ✅ Cyan color theme
- ✅ Support for string array questions

```typescript
interface DiscussionRendererProps {
  title: string
  instructions: string
  questions: string[]  // ← Simple strings, not objects
  timeMinutes: number
}
```

### 3. Updated Exercise Routing

**File:** `src/lib/lesson-displays/under-18-display.tsx`

Now properly routes each exercise type:
```typescript
// Roleplay with roles and scenarios
case 'roleplay':
  return <RoleplayRenderer scenario={...} roles={...} />

// Discussion with string questions
case 'discussion':
  return <DiscussionRenderer questions={...} />

// Conversation with object questions
case 'conversation':
case 'free-conversation':
  return <ConversationRenderer questions={...} />
```

### 4. Updated Exports

**File:** `src/lib/lesson-displays/index.ts`

Added both renderers to exports:
```typescript
export { RoleplayRenderer } from './renderers/roleplay'
export { DiscussionRenderer } from './renderers/discussion'
```

---

## Exercise Type Support Matrix

| Exercise # | Type | Renderer | Data Structure | Status |
|-----------|------|----------|-----------------|--------|
| 1 | warm-up | WarmUpRenderer | questions[] | ✅ |
| 2 | vocabulary | VocabularyRenderer | vocabulary[] | ✅ |
| 3 | expressions | ExpressionsRenderer | expressions[] | ✅ |
| 4 | dialogue | DialogueRenderer | dialogue[] + setting | ✅ |
| 4 | comprehension | ComprehensionRenderer | questions[] | ✅ |
| 5 | **roleplay** | **RoleplayRenderer** | **scenario + roles[]** | **✅ NEW** |
| 6 | **discussion** | **DiscussionRenderer** | **questions: string[]** | **✅ NEW** |
| 7 | speaking | SpeakingRenderer | questions[] | ✅ |
| 8 | grammar | GrammarRenderer | sentences[] | ✅ |
| 9 | conversation | ConversationRenderer | questions[] (object) | ✅ |
| 10 | challenge | ChallengeRenderer | content: string | ✅ |

---

## Data Flow

### Before (❌ Crash)
```
Gemini: roleplay exercise
           ↓
Under-18 Display: Routes to ConversationRenderer
           ↓
ConversationRenderer tries:
  questions.map(...)  ← ❌ undefined (roleplay has no questions)
           ↓
ERROR: Cannot read properties of undefined
```

### After (✅ Works)
```
Gemini: roleplay exercise
           ↓
Under-18 Display: Routes to RoleplayRenderer
           ↓
RoleplayRenderer processes:
  scenario: display scenario ✅
  roles.map(...) ← ✅ roles exist
           ↓
Display: Scenario + roles with key points
           ↓
Student practice: Can expand roles and see details
```

---

## RoleplayRenderer Features

### Display Elements

1. **Scenario Box**
   - Purple-themed background
   - Clear scenario description
   - Context for the role play

2. **Roles Section**
   - Numbered role cards
   - Each shows: name and brief description
   - Expandable for full details

3. **Role Details (Expanded)**
   - Full role description
   - Key points list
   - Instructions for the student

4. **Practice Instructions**
   - How to conduct the role play
   - Tips for realistic conversation
   - Vocabulary usage emphasis

---

## DiscussionRenderer Features

### Display Elements

1. **Discussion Questions**
   - Numbered question list
   - Expandable for each question
   - First question expanded by default

2. **Expanded Question Content**
   - "Think About" prompts
   - Discussion tips checklist
   - Guidance for the student

3. **Discussion Tips**
   - Use complete sentences
   - Include new vocabulary
   - Ask follow-up questions
   - Focus on communication over perfection

4. **Practice Guidance**
   - Suggested practice methods
   - Emphasis on natural communication
   - Use of lesson vocabulary

---

## Files Modified/Created

### New Files
1. ✅ `src/lib/lesson-displays/renderers/roleplay.tsx` (NEW)
   - 172 lines
   - Handles scenario and role-based exercises

2. ✅ `src/lib/lesson-displays/renderers/discussion.tsx` (NEW)
   - 163 lines
   - Handles open-ended discussion questions

### Modified Files
1. ✅ `src/lib/lesson-displays/under-18-display.tsx`
   - Added: Imports for RoleplayRenderer, DiscussionRenderer
   - Added: `case 'roleplay':` handler
   - Added: `case 'discussion':` handler
   - Updated: `case 'conversation':` (removed incorrect routing)

2. ✅ `src/lib/lesson-displays/index.ts`
   - Added: Export RoleplayRenderer
   - Added: Export DiscussionRenderer

---

## Testing

### Test Case 1: Roleplay Exercise
```
1. Generate lesson for under-18 student
2. Navigate to roleplay exercise
3. Verify:
   ✅ Scenario description displays
   ✅ All roles show with numbers
   ✅ Can click to expand each role
   ✅ Expanded view shows full description + key points
   ✅ Practice instructions visible
   ✅ No console errors
```

### Test Case 2: Discussion Exercise
```
1. Generate lesson for under-18 student
2. Navigate to discussion exercise
3. Verify:
   ✅ All questions display as expandable cards
   ✅ First question expanded by default
   ✅ Can click to expand/collapse other questions
   ✅ Expanded view shows "Think About" prompts
   ✅ Expanded view shows discussion tips
   ✅ Practice guidance visible
   ✅ No console errors
```

### Test Case 3: Complete Lesson Flow
```
1. Create under-18 student
2. Generate lesson
3. Navigate through all exercises:
   ✅ All 10+ exercise types display correctly
   ✅ No "Unknown exercise type" errors
   ✅ All data renders properly
   ✅ Navigation between exercises works
   ✅ Can complete entire lesson end-to-end
```

### Test Case 4: Conversation Exercise Still Works
```
1. Generate lesson
2. Find conversation exercise
3. Verify:
   ✅ Not affected by new routing
   ✅ Still displays conversation prompts
   ✅ Still shows expandable prompts
   ✅ Distinguishable from discussion
```

---

## Exercise Type Resolution Summary

| Type | Data Has | Routed To | Renders |
|------|----------|-----------|---------|
| `roleplay` | scenario + roles | RoleplayRenderer | Role play scenarios |
| `discussion` | string[] questions | DiscussionRenderer | Discussion prompts |
| `conversation` | object[] questions | ConversationRenderer | Conversation starters |
| `comprehension` | object[] questions | ComprehensionRenderer | QA exercises |
| `dialogue` | dialogue[] + setting | DialogueRenderer | Dialogue exchanges |
| `vocabulary` | vocabulary[] | VocabularyRenderer | Vocab items |
| Other | various | Appropriate renderer | Specific exercise type |

---

## Summary

### Problems Fixed
1. ✅ Roleplay exercises no longer crash
2. ✅ Discussion exercises no longer crash
3. ✅ Each exercise type has dedicated renderer
4. ✅ Proper data structure matching
5. ✅ All 10+ AI-generated exercise types now supported

### Architecture Improvement
- One-to-one mapping between data structure and renderer
- Clear separation of concerns
- Scalable for future exercise types
- Each renderer optimized for its specific data

### Result
Under-18 lessons now display completely end-to-end with all exercise types handled correctly:
- Roleplay with scenario and roles
- Discussion with open-ended questions
- All other exercise types
- Complete learning experience from Exercise 1-10+
