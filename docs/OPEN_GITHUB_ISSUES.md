# Avidato Open GitHub Issues (Nov 6, 2025)

## Overview
**Total Open Issues:** 12
**Assignee:** All assigned to darrenodi
**Main Categories:** Lesson Generation (8), Public Lessons (4), UI (1), Backend (1)

---

## 🔴 High Priority - Lesson Generation Issues

### #44 - Option to generate additional lesson plans
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Add an option to generate additional lesson plans that review previous plans and introduce new vocabulary and topics. Ensure new lessons do not repeat previous content unnecessarily.

### #43 - Tailor writing lessons for writing goals
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Customize lessons based on student's writing goals (emails, reports, essays, etc.)

### #42 - Include grammar structures and practice in lesson plans
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Enhance lessons with explicit grammar focus and structured grammar practice exercises

### #41 - Ensure dialogues are natural and contextually fitting
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Improve dialogue quality - ensure they sound natural and fit the lesson context appropriately

### #40 - Make dialogue contexts clear and natural
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Similar to #41 - provide clearer context for dialogues so they feel more authentic

### #38 - Do not repeat warm-up questions in discussion
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Prevent duplicate questions between warm-up and discussion exercises

### #37 - Prevent repeated vocabulary in consecutive lessons
**Labels:** feature, lesson-generation
**Status:** Open
**Description:** Ensure vocabulary doesn't repeat between consecutive lessons for the same student

---

## 🟡 Medium Priority - Public Lessons Feature

### #28 - Public Lesson Visibility Logic
**Labels:** feature
**Status:** Open
**Description:** Implement visibility logic for making lessons public/private

### #26 - Public Lessons Listing & Filters
**Labels:** feature
**Status:** Open
**Description:** Create listing page and filtering options for public lessons

### #24 - Add 'Make Public' Toggle to Lesson Material
**Labels:** feature
**Status:** Open
**Description:** Add UI toggle to mark lessons as public when sharing with students

---

## 🟡 Medium Priority - Backend/UI Updates

### #27 - Update Content JSON Structure
**Labels:** backend
**Status:** Open
**Description:** Update/refactor the content JSON structure for lessons

### #25 - ESL Plans Sidebar Menu
**Labels:** ui
**Status:** Open
**Description:** Add ESL plans to the sidebar navigation menu

---

## Priority Roadmap

### Priority 1: Issue #37 (Vocabulary Repetition)
- **Impact:** High - affects lesson quality significantly
- **Complexity:** Medium
- **Related to:** Recent work on CEFR modules and lesson generation
- **Action:** Track previous lesson vocabulary, exclude from new lessons

### Priority 2: Issue #38 (Question Duplication)
- **Impact:** Medium - affects user experience
- **Complexity:** Low
- **Action:** Add deduplication logic between warm-up and discussion

### Priority 3: Issues #40/#41 (Dialogue Quality)
- **Impact:** High - core user experience
- **Complexity:** High
- **Related to:** AI prompt refinement for Gemini
- **Action:** Enhance dialogue generation prompts with context requirements

### Priority 4: Issue #42 (Grammar Focus)
- **Impact:** High - directly relates to under-18 grammar exercise
- **Complexity:** Medium
- **Related to:** Find the Mistake exercise just implemented! ✅
- **Status:** PARTIALLY COMPLETE - grammar exercise exists, may need enhancement

### Priority 5: Issue #43 (Writing Goals Tailoring)
- **Impact:** Medium - specialized feature
- **Complexity:** High
- **Action:** Requires analysis of student's writing goals during onboarding

### Priority 6: Issue #44 (Follow-up Lessons)
- **Impact:** Medium
- **Complexity:** High
- **Related to:** Issue #37
- **Action:** Build on vocabulary tracking to create follow-up lessons

### Priority 7: Public Lessons Feature (#24, #26, #28)
- **Impact:** Low (future feature)
- **Complexity:** Medium
- **Action:** Complete after core lesson quality is solid

### Priority 8: Issue #27 (JSON Structure)
- **Impact:** Medium
- **Complexity:** Low-Medium
- **Action:** May be prerequisite for other features

### Priority 9: Issue #25 (Sidebar Menu)
- **Impact:** Low
- **Complexity:** Low
- **Action:** UI polish item

---

## Recommended Next Steps

### Immediate (This Week)
1. ✅ **Close/Verify Issue #42** - Grammar focus already implemented with "Find the Mistake" exercise
2. **Start Issue #37** - Implement vocabulary repetition prevention
3. **Start Issue #38** - Add question deduplication

### Short Term (Next Sprint)
4. Improve dialogue quality (#40, #41) - refine AI prompts
5. Implement writing goals tailoring (#43)
6. Support follow-up lessons (#44)

### Medium Term
7. Public lessons feature (#24, #26, #28)
8. JSON structure update (#27)
9. UI improvements (#25)

---

## Connection to Recent Work

### ✅ Already Implemented
- **Issue #42 (Grammar)** - Find the Mistake exercise now available for under-18 students!
  - Proof: Recently pushed commit with grammar exercise renderer
  - Status: COMPLETE

### 🔄 Partially Related
- **CEFR Modules** - Support for Issue #37 (vocabulary tracking)
- **Lesson Generation** - Supports Issues #40, #41 (dialogue quality)

### ⏳ Next in Queue
- **Issue #37** - Needs integration of vocabulary tracking with CEFR modules
- **Issue #38** - Simple deduplication logic
- **Issues #40, #41** - Enhanced AI prompts for dialogue generation

---

## File Links
- GitHub Repo: https://github.com/Avidato-LLC/Avidato
- Issues: https://github.com/Avidato-LLC/Avidato/issues
- Main Branch: https://github.com/Avidato-LLC/Avidato/tree/main
