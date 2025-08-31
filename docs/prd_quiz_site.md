# 📄 PRD – Markdown Quiz Mini Site (Supabase Version)

## 1. Overview
A quiz mini site where admins create quizzes in **Markdown files**. These are parsed, stored in Supabase, and published to the frontend. Users can take quizzes without creating an account, and their responses are collected directly in Supabase via REST API.

---

## 2. Objectives
- Support **Markdown-based quiz authoring**.  
- Manage publishing directly via Supabase tables.  
- Allow **anonymous quiz-taking** (no login).  
- Collect quiz answers in Supabase (via REST API).  
- Provide basic reporting through Supabase or admin dashboard.

---

## 3. User Roles
### Quiz Takers
- Access quizzes without login.  
- Answer multiple-choice or true/false questions.  
- Submit answers anonymously.  

### Admins
- Upload Markdown quiz files.  
- Store parsed quiz in Supabase (`quizzes`, `questions`).  
- Control publish/unpublish state.  
- Export results (via Supabase CSV download or admin UI).

---

## 4. Functional Requirements

### 4.1 Quiz Authoring
- Quizzes authored in Markdown using a consistent schema.  
- Example:
  ```markdown
  ## Q1
  What does AI stand for?
  - [ ] Artificial Input
  - [x] Artificial Intelligence
  - [ ] Automated Interface
  ```
- Parsing tool converts Markdown → JSON → inserts into Supabase.

### 4.2 Storage (Supabase Tables)
- **quizzes**  
  - `id`, `title`, `description`, `tags`, `published` (boolean), `created_at`
- **questions**  
  - `id`, `quiz_id`, `content`, `options (jsonb)`, `answer_key (jsonb)`, `order`
- **responses**  
  - `id`, `quiz_id`, `session_id`, `answers (jsonb)`, `submitted_at`

### 4.3 Quiz Delivery (Frontend)
- React/Tailwind (or Next.js).  
- Fetch quiz via Supabase REST API (`GET /quizzes?id=eq.X`).  
- Render multiple choice/true-false questions.  
- Optional features: randomize order, timer.  

### 4.4 Answer Submission
- On submit, POST answers → Supabase REST API (`/responses`).  
- Each submission linked with `session_id` (stored in browser `localStorage` or generated UUID).  
- Anonymous; no user auth required.  

### 4.5 Reporting
- Admin pulls results directly from Supabase (`GET /responses?quiz_id=eq.X`).  
- Export via Supabase dashboard or custom admin UI.  
- Auto-grading supported if `answer_key` exists.

---

## 5. Non-Functional Requirements
- **Authentication:** Disabled for quiz takers. Only admins need Supabase access key for uploads.  
- **Scalability:** Handle ~1000 submissions per quiz.  
- **Data privacy:** No personal info stored.  
- **Performance:** REST calls <200ms typical latency.  

---

## 6. Technical Architecture

### Frontend
- Next.js or Vite + React  
- Fetch/push data via Supabase REST API  
- Markdown → Quiz renderer  

### Backend = Supabase
- **Postgres DB + REST API**  
- **Row Level Security (RLS)** rules:  
  - `quizzes`: read allowed for all (only published = true).  
  - `questions`: read allowed for all (only published quizzes).  
  - `responses`: insert allowed for all; read only for admins (via service key).  

---

## 7. Success Metrics
- # of quizzes published.  
- # of responses per quiz.  
- Avg completion rate.  
- % of correct answers (if auto-graded).  

---

## 8. Future Enhancements
- Certificates & scoring.  
- Quiz analytics dashboards.  
- Multi-language Markdown.  
- Integration with ClassHub / LMS.  
