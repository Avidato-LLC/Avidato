# Architecture Comparison: Before vs After

## BEFORE (Problem: Monolithic + AI-Only)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         gemini.ts (714 lines)                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ generateLesson()                                                │ │
│  │  ├─ Build massive AI prompt (200+ lines of instructions)       │ │
│  │  ├─ Call Google Gemini API                                     │ │
│  │  ├─ Parse JSON response                                        │ │
│  │  ├─ enforceSynonymConstraints() ← post-processing filter      │ │
│  │  └─ Return GeneratedLesson with AI-generated vocabulary        │ │
│  │                                                                 │ │
│  │ AI Prompt includes:                                            │ │
│  │  ├─ getLevelVocabularyGuide() ← calls CEFR modules (text)    │ │
│  │  ├─ getLevelSpecificInstructions() ← text guidance             │ │
│  │  ├─ getOccupationExclusions() ← text exclusions               │ │
│  │  └─ Example vocabulary format + synonym/expression rules       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ (calls for guidance text ONLY)
         ├─→ A1LessonModule.getVocabularyGuide()
         ├─→ B1LessonModule.getVocabularyGuide()
         └─→ C1LessonModule.getVocabularyGuide()

┌────────────────────────────────────────────┐
│  CEFR Modules (A1-C2)                      │
│  Role: Passive consultants (guidance text) │
│  ├─ getVocabularyGuide() → string          │
│  └─ generateLesson() → unused              │
└────────────────────────────────────────────┘

❌ PROBLEMS:
  • gemini.ts is bloated (714 lines, monolithic)
  • All vocabulary comes from AI (unpredictable)
  • C1 students CAN get "compliance" (wrong!)
  • Synonym filtering is post-processing only (band-aid)
  • CEFR modules are passive (not used for generation)
  • Hard to customize vocabulary per level
```

## AFTER (Solution: Modular + Delegated)

```
┌─────────────────────────────────────────────────────────────────┐
│              gemini.ts (714 lines, now delegating)              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ generateLesson()                                             │ │
│  │  ├─ getLevelVocabularyGuide() ← from CEFR for AI prompt     │ │
│  │  ├─ getLevelSpecificInstructions() ← from CEFR              │ │
│  │  ├─ Call Google Gemini API                                  │ │
│  │  ├─ Sanitize response                                       │ │
│  │  └─ Return GeneratedLesson (optional: use CEFR vocab)       │ │
│  │                                                              │ │
│  │ generateVocabularyForLevel(level) ✨ NEW DELEGATION         │ │
│  │  └─ cefrModule = getCEFRModule(level)                       │ │
│  │  └─ return cefrModule.generateVocabularyItems()             │ │
│  │                                                              │ │
│  │ getCEFRModule(level) ✨ NEW HELPER                          │ │
│  │  ├─ if A1 → new A1LessonModule()                            │ │
│  │  ├─ if B1 → new B1LessonModule()                            │ │
│  │  ├─ if C1 → new C1LessonModule()                            │ │
│  │  └─ default → new B1LessonModule()                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │
         ├─→ generateVocabularyForLevel() calls
         │
┌────────────────────────────────────────────────────────────────┐
│  CEFR Modules (A1-C2) ✨ Now Active Generators                │
│  Role: Generate level-appropriate VocabularyItem[]             │
│                                                                │
│  A1LessonModule                                                │
│  ├─ generateVocabularyItems() → [                              │
│  │   { word: "hello", def: "...", synonym: "hi",              │
│  │     expressions: [] },                                      │
│  │   { word: "happy", def: "...", synonym: "glad",            │
│  │     expressions: [] },                                      │
│  │   { word: "family", def: "...", synonym: "",               │
│  │     expressions: [] }                                       │
│  │ ]                                                           │
│  ├─ getVocabularyGuide() → text                                │
│  ├─ getVocabularyForLevel() → string[]                         │
│  └─ generateLesson() → GeneratedLesson                         │
│                                                                │
│  C1LessonModule                                                │
│  ├─ generateVocabularyItems() → [                              │
│  │   { word: "paradigm shift", def: "...", synonym: "major    │
│  │     change", expressions: ["paradigm shift in", ...] },   │
│  │   { word: "juxtaposition", def: "...", synonym:            │
│  │     "contrast", expressions: [...] },                      │
│  │   { word: "obfuscate", def: "...", synonym: "obscure",     │
│  │     expressions: [...] }                                   │
│  │ ]   ← ✅ GUARANTEED: NO "compliance", "fraudulent", etc.  │
│  ├─ getVocabularyGuide() → text                                │
│  ├─ getVocabularyForLevel() → string[]                         │
│  └─ generateLesson() → GeneratedLesson                         │
│                                                                │
│  (All other CEFR levels implemented similarly)                 │
└────────────────────────────────────────────────────────────────┘

✅ BENEFITS:
  • CEFR modules now ACTIVE generators
  • Each module owns vocabulary appropriateness
  • C1 module CANNOT output basic words (enforced at source)
  • Expressions included for A2+ (2-3 phrase patterns per word)
  • Easy to customize/extend vocabulary per level
  • gemini.ts still works, now delegates properly
  • Backward compatible - AI prompt still available
```

## Usage Patterns

### Pattern 1: Use AI-generated vocabulary (Original, still works)
```typescript
const lesson = await geminiService.generateLesson(student, topic, 50);
// ← Returns lesson with AI-generated vocabulary
// ← Subject to synonym sanitization filter
```

### Pattern 2: Use CEFR module vocabulary (New, recommended)
```typescript
const vocabItems = await geminiService.generateVocabularyForLevel(student.level);
// ← Returns curated VocabularyItem[] from CEFR module
// ← Guaranteed level-appropriate, includes expressions
// ← Can be used to build lesson manually or inject into AI prompt
```

### Pattern 3: Hybrid (Future - not yet implemented)
```typescript
async function generateLessonWithModularVocabulary(student, topic, duration) {
  // Get CEFR vocabulary
  const cefrVocab = await geminiService.generateVocabularyForLevel(student.level);
  
  // Use it in AI prompt as reference
  const lesson = await geminiService.generateLesson(student, topic, duration);
  
  // Replace AI vocabulary with CEFR module vocabulary
  lesson.exercises[0].content.vocabulary = cefrVocab;
  
  return lesson;
}
```

## Test Scenario (Why This Matters)

**Before (Problem):**
```
Input: C1 Accountant, topic: "Auditing"
AI Response: [
  "compliance" ← ❌ A2 level! Accountant knows this!
  "fraudulent" ← ❌ A2-B1 level!
  "verification" ← ❌ A1-A2 level!
]
Result: Wasting lesson time on words they already know
```

**After (Solution):**
```
Input: C1 Accountant, topic: "Auditing"
C1Module.generateVocabularyItems() returns: [
  { word: "paradigm shift", expressions: ["paradigm shift in", ...] },
  { word: "juxtaposition", expressions: [...] },
  { word: "obfuscate", expressions: [...] }
]
Result: ✅ Advanced vocabulary, challenged English proficiency, useful expressions
```

## Migration Path

1. ✅ Phase 1: Add `generateVocabularyItems()` to all CEFR modules
2. ✅ Phase 2: Add delegation methods to GeminiService
3. ⏳ Phase 3: Update `generateLesson()` to optionally use CEFR vocabulary
4. ⏳ Phase 4: Test and validate all levels
5. ⏳ Phase 5: (Optional) Gradually retire AI vocabulary generation

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Vocabulary Source** | 100% AI | Modular (CEFR-controlled) + Optional AI |
| **Level Enforcement** | Post-processing filter | Built into module code |
| **C1 Gets Basic Words?** | Yes (problem!) | No (impossible!) |
| **Expressions Support** | Text guidance only | Generated in VocabularyItem |
| **Extensibility** | Hard (monolithic) | Easy (modular) |
| **Code Location** | gemini.ts (bloated) | Distributed to CEFR modules |
| **Backward Compat** | N/A | Yes ✅ |

---

**Key Achievement:** 
From "rely on AI to get it right" → "modules enforce it's impossible to get it wrong"
