Of course. Here is the complete, updated `PROGRESS.md` file.

---

### 📄 `PROGRESS.md`

🚀 **Avidato Rebuild Progress Tracker (v1.1)**

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
| Framework      | Next.js 14 (App Router, TypeScript) |
| Styling        | **Tailwind CSS v4** (with Dark Mode) |
| Auth & Database| Next-Auth, PostgreSQL & Prisma     |
| AI Integration | Google Gemini API (Gemini 1.5 Pro) |
| Hosting        | Vercel                             |

---

### ✅ **Completed Milestones**

✨ **Milestone Complete: Foundational UI & Theming System**

The project's visual foundation is now **complete and stable**. This involved porting the existing public UI and building a robust, production-ready theming system from the ground up, ensuring full compatibility with Tailwind CSS v4 and resolving all previous visibility and hydration issues.

*   **Public UI Ported:** The landing page, a fully responsive public navbar, and a public footer are implemented with a modular component structure.
*   **Theming System Established:** A comprehensive theming system has been built, featuring:
    *   A brand-aligned, high-contrast color palette.
    *   A semantic color system (`background`, `foreground`, `primary`, `border`, etc.).
    *   Automatic light/dark mode switching that respects user system preferences.
*   **Custom Font Integrated:** The Inter font is configured as the primary typeface for the entire application.
*   **Configuration Stabilized:** All build tool configurations (`tailwind.config.ts`, `postcss.config.mjs`) are now correct and stable.

---

### 🗺️ Project Roadmap

#### **Phase 1: Foundation & Authentication**
*Goal: Establish a stable project foundation with a complete, secure authentication system.*

| ID          | Task                                                   | Status                |
| :---------- | :----------------------------------------------------- | :-------------------- |
| **#1**      | `Setup: Initialize Next.js 14 Project`                 | ✅ Completed          |
| **#2**      | `Feat: Port Landing Page, Navbar, and Footer`          | ✅ Completed          |
| **#2B**     | `Feat: Implement Theme System (Colors, Fonts, Dark Mode)`| ✅ Completed          |
| **#3**      | `Setup: Integrate Prisma and Connect to Database`      | 🚧 **[Current Focus]** |
| **#4**      | `Feat(Auth): Configure Next-Auth with Prisma Adapter`  | ⬜️ To Do              |
| **#5**      | `Feat(Auth): Implement Session & Protected Middleware` | ⬜️ To Do              |
| **#6**      | `UI(Auth): Create Login and Signup Pages`              | ⬜️ To Do              |
| **#7**      | `Feat(Auth): Create Server Actions for Signup/Login`   | ⬜️ To Do              |
| **#8**      | `UI(Dashboard): Create Main Dashboard Layout`          | ⬜️ To Do              |

#### **Phase 2: Core CRUD Functionality (Students)**
*Goal: Implement the complete lifecycle for student management.*

| ID      | Task                                                  | Status   |
| :------ | :---------------------------------------------------- | :------- |
| **#9**  | `UI(Students): Create "Add Student" Page and Form`    | ⬜️ To Do |
| **#10** | `Feat(Students): Create Server Action to Add Student` | ⬜️ To Do |
| **#11** | `Feat(Students): Display List of All Students`        | ⬜️ To Do |
| **#12** | `Feat(Students): Create Dynamic Page for Student`     | ⬜️ To Do |
| **#13** | `UI(Students): Create "Edit Student" Page`            | ⬜️ To Do |
| **#14** | `Feat(Students): Create Server Action to Update`      | ⬜️ To Do |
| **#15** | `Feat(Students): Create Server Action to Archive`     | ⬜️ To Do |

#### **Phase 3: AI & Lesson Management (Upcoming)**
*Goal: Integrate the core AI features for generating and viewing lessons.*

| ID   | Task                                                     | Status   |
| :--- | :------------------------------------------------------- | :------- |
| TBD  | `UI(Lessons): Display Generated Lessons in Dashboard`    | ⬜️ To Do |
| TBD  | `Feat(AI): Generate Course Outlines via Server Action`   | ⬜️ To Do |
| TBD  | `Feat(AI): Generate Detailed Lesson Plans via Server Action` | ⬜️ To Do |
| TBD  | `Feat(Lessons): Create Public View Page for Shared Links`| ⬜️ To Do |
| TBD  | `Feat(Lessons): Server Action to Edit/Delete a Lesson`   | ⬜️ To Do |

---

### 🚨 Current Status & Next Steps

**Current Status:** The visual and stylistic foundation of the application is **stable and complete.** All previous build errors, hydration warnings, and UI visibility issues have been resolved.

**Next Steps:** With the frontend foundation secure, the immediate priority is to begin backend integration. We will now proceed with **Issue #3: Setup Prisma and Connect to Database.**


Folder structure 

.gitignore
PROGRESS.md
README.md
eslint.config.mjs
issues.txt
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public/file.svg
public/globe.svg
    public/images/tutor-hero.png
public/next.svg
public/vercel.svg
public/window.svg
    src/app/favicon.ico
    src/app/globals.css
    src/app/layout.tsx
    src/app/page.tsx
    src/components/ClientThemeProvider.tsx
    src/components/ThemeProvider.tsx
        src/components/icons/AddIcon.tsx
        src/components/icons/ArrowForwardIcon.tsx
        src/components/icons/AutoAwesomeIcon.tsx
        src/components/icons/CheckCircleIcon.tsx
        src/components/icons/FactCheckIcon.tsx
        src/components/icons/ManageAccountsIcon.tsx
        src/components/icons/RuleIcon.tsx
        src/components/icons/SchemaIcon.tsx
        src/components/icons/ShareIcon.tsx
        src/components/icons/TaskAltIcon.tsx
        src/components/layout/PublicFooter.tsx
        src/components/layout/PublicNavbar.tsx
tailwind.config.ts
tsconfig.json
