🚀 **Avidato Rebuild Progress Tracker (v1.0)**

### 📘 Avidato (MVP)

**🌍 Overview**
Avidato is an AI-powered productivity tool that helps language tutors prepare lessons faster. Tutors can manage students, auto-generate course outlines and detailed lesson plans using AI, and share read-only lesson links with students.

*   🚫 **Not** a tutoring marketplace (like Preply or Italki).
*   ✅ **A** back-office tool that improves planning efficiency for existing professionals.

---

### 📌 **Guiding Principles & Rules**

1.  **Consistent Fonts:** All typography (headings, paragraphs, etc.) must be consistent, using the primary project font (Inter).
2.  **Theme Adherence:** All components must use the defined theme colors (e.g., `bg-background`, `text-foreground`, `bg-primary`). Buttons, backgrounds, and other elements must adapt correctly to both light and dark modes.
3.  **Thorough Code Comments:** All non-obvious code, components, and functions must be well-commented to explain their purpose and logic.
4.  **Complete File Structure:** When requested, the complete and accurate file structure of the relevant directories must be provided.
5.  **Strict Modularity:** The application must be built with small, single-purpose, and reusable components whenever possible to ensure maintainability.

---

### 🛠 Tech Stack

| Area           | Tool                               |
| :------------- | :--------------------------------- |
| Framework      | Next.js (App Router, TypeScript)   |
| Styling        | Tailwind CSS (with Dark Mode)      |
| Auth & Database| Next-Auth, PostgreSQL & Prisma     |
| AI Integration | Google Gemini API (Gemini 1.5 Pro) |
| Hosting        | Vercel                             |

---

### 🗺️ Project Roadmap
This roadmap outlines the structured rebuild of the Avidato application.

Phase 1: Foundation & Authentication
Goal: Establish a stable project foundation with a complete, secure authentication system.

ID	Task	Status
#1	Setup: Initialize Next.js 14 Project	🚧 In Progress
#2	Feat: Port Existing Landing Page, Navbar, and Footer	⬜️ To Do
#3	Setup: Integrate Prisma and Connect to Database	⬜️ To Do
#4	Feat(Auth): Configure Next-Auth with Prisma Adapter	⬜️ To Do
#5	Feat(Auth): Implement Session & Protected Middleware	⬜️ To Do
#6	UI(Auth): Create Login and Signup Pages	⬜️ To Do
#7	Feat(Auth): Create Server Actions for Signup/Login	⬜️ To Do
#8	UI(Dashboard): Create Main Dashboard Layout	⬜️ To Do
Phase 2: Core CRUD Functionality (Students)
Goal: Implement the complete lifecycle for student management.

ID	Task	Status
#9	UI(Students): Create "Add Student" Page and Form	⬜️ To Do
#10	Feat(Students): Create Server Action to Add Student	⬜️ To Do
#11	Feat(Students): Display List of All Students	⬜️ To Do
#12	Feat(Students): Create Dynamic Page for Student	⬜️ To Do
#13	UI(Students): Create "Edit Student" Page	⬜️ To Do
#14	Feat(Students): Create Server Action to Update	⬜️ To Do
#15	Feat(Students): Create Server Action to Archive	⬜️ To Do
Phase 3: AI & Lesson Management (Upcoming)
Goal: Integrate the core AI features for generating and viewing lessons.

ID	Task	Status
TBD	Feat(AI): Generate Lesson Outlines	⬜️ To Do
TBD	Feat(AI): Generate Full Lesson Details	⬜️ To Do
TBD	Feat(Lessons): Create Public View Page	⬜️ To Do
🚨 Current Status & Next Steps
Current Status: Project Re-initialization.
The project is being rebuilt from the ground up to ensure a stable and modular architecture. Core assets including the Prisma schema, .env variables, and public-facing UI components (Landing Page, Navbar, Footer) will be ported to the new structure.

Next Steps:
The immediate focus is on Issue #1: Initialize the new Next.js project with TypeScript and Tailwind CSS. Once the base project is established, work will proceed sequentially through the Phase 1 roadmap tasks.


File structure 

.
├── create_icons.sh
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
|___progress.md
└── src/
    └── app/
        ├── globals.css
        ├── layout.tsx
        └── page.tsx
    └── components/
        ├── ThemeProvider.tsx
        ├── icons/
        │   ├── AddIcon.tsx
        │   ├── ArrowForwardIcon.tsx
        │   ├── AutoAwesomeIcon.tsx
        │   ├── CheckCircleIcon.tsx
        │   ├── FactCheckIcon.tsx
        │   ├── ManageAccountsIcon.tsx
        │   ├── RuleIcon.tsx
        │   ├── SchemaIcon.tsx
        │   ├── ShareIcon.tsx
        │   └── TaskAltIcon.tsx
        └── layout/
            ├── PublicFooter.tsx
            └── PublicNavbar.tsx