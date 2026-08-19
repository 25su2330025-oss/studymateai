# StudyMate AI — GitHub Copilot Development Instructions

## Project

Build and complete a production-quality web application called:

**StudyMate AI — Your Personal AI Learning Companion**

Tagline:

**Study Smarter. Remember Longer. Succeed Faster.**

The application helps students create personalized study plans, learn through an AI tutor, generate quizzes, track performance, identify weak topics, and revise topics intelligently.

---

# 1. Technology Stack

Use the following stack unless there is a strong technical reason not to:

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React icons

### Backend

* Python
* FastAPI

### Database and Authentication

* Supabase
* PostgreSQL
* Supabase Authentication

### AI

Use an LLM API through the backend.

Never expose an AI API key in frontend code.

### Optional advanced features

* Vector embeddings
* pgvector / Supabase Vector
* RAG
* PDF text extraction

Do not implement advanced features until the core application works.

---

# 2. Important Development Rule

Do NOT attempt to build the entire application at once.

Work in small, independent phases.

Before modifying code:

1. Inspect the existing project.
2. Understand the current folder structure.
3. Reuse existing components.
4. Do not unnecessarily rewrite working code.
5. Make the smallest change necessary.
6. Check for TypeScript and runtime errors.
7. Only then continue.

Never replace the entire project with a new architecture unless explicitly requested.

---

# 3. Current Application Structure

Use this general structure:

```text
studymate-ai/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   ├── subjects/
│   │   ├── study-plan/
│   │   ├── quiz/
│   │   ├── tutor/
│   │   ├── progress/
│   │   └── profile/
│   │
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── hooks/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── utils/
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

You may improve this structure if necessary, but preserve the existing functionality.

---

# 4. Design System

The application should look like a modern AI SaaS product.

Use:

* Dark background
* Slate cards
* Blue primary accent
* Rounded cards
* Clean spacing
* Responsive design
* Subtle borders
* Clear typography
* Lucide icons

Preferred colors:

```text
Background: slate-950
Card: slate-900
Secondary: slate-800
Primary: blue-500
Hover: blue-600
Text: white
Muted: slate-400
```

Do not create excessive gradients, animations, or visual clutter.

The interface should feel professional enough for an AI project competition.

---

# 5. Main Pages

The application must eventually contain:

## Landing Page

Route:

```text
/
```

Include:

* StudyMate AI logo/name
* Hero section
* Tagline
* Explanation of the product
* Key features
* How it works
* Call-to-action
* Login
* Signup

---

## Login

Route:

```text
/login
```

Features:

* Email
* Password
* Login button
* Error handling
* Loading state
* Link to signup
* Supabase authentication

---

## Signup

Route:

```text
/signup
```

Features:

* Name
* Email
* Password
* Confirm password
* Validation
* Supabase authentication
* Redirect to onboarding/dashboard

---

## Dashboard

Route:

```text
/dashboard
```

Display:

* Greeting
* Overall progress
* Study time
* Average quiz score
* Today's study plan
* Weak topics
* Upcoming exams
* Quick actions
* AI Tutor shortcut
* Quiz shortcut

Dashboard data should eventually come from Supabase.

Do not hardcode final user data.

---

## Subjects

Route:

```text
/subjects
```

Features:

* List student's subjects
* Add subject
* Edit subject
* Delete subject
* Difficulty
* Progress
* Weak topics
* Subject details

---

## Study Plan

Route:

```text
/study-plan
```

Features:

* Daily plan
* Weekly plan
* Subject
* Topic
* Duration
* Priority
* Completion status
* Start task
* Mark complete
* AI-generated plan

The plan should eventually be generated based on:

* Subjects
* Available study hours
* Exam date
* Weak topics
* Previous performance
* Preferred study time

---

## AI Quiz

Route:

```text
/quiz
```

Features:

* Select subject
* Select topic
* Select difficulty
* Select number of questions
* Generate quiz
* Display questions
* Multiple-choice options
* Submit
* Calculate score
* Show correct answers
* Identify weak topics
* Save result to database

---

## AI Tutor

Route:

```text
/tutor
```

Features:

* Chat interface
* Student message
* AI response
* Loading state
* Error handling
* Conversation history
* Clear conversation

The AI request must go through the backend.

Never expose the AI API key to the browser.

---

## Progress

Route:

```text
/progress
```

Display:

* Overall performance
* Subject performance
* Quiz history
* Study time
* Strong topics
* Weak topics
* Recent activity
* Progress trends

Use charts only where they genuinely improve understanding.

---

## Profile

Route:

```text
/profile
```

Display/edit:

* Name
* Email
* Course
* Education level
* Daily study hours
* Preferred study time
* Learning preferences
* Exam information

---

# 6. Reusable Components

Create reusable components instead of duplicating UI.

Examples:

```text
Sidebar
Header
StatCard
SubjectCard
ProgressBar
TaskCard
QuizCard
ChatMessage
LoadingSpinner
EmptyState
ErrorMessage
Modal
Button
Input
```

Keep components simple and reusable.

---

# 7. Authentication

Use Supabase Authentication.

Required flow:

```text
Signup
↓
Supabase Auth
↓
Create profile
↓
Onboarding
↓
Dashboard
```

Login:

```text
Login
↓
Supabase Auth
↓
Dashboard
```

Protect private routes.

Unauthenticated users should not be able to access:

```text
/dashboard
/subjects
/study-plan
/quiz
/tutor
/progress
/profile
```

Do not store passwords manually.

---

# 8. Database

Use Supabase PostgreSQL.

Create tables for at least:

## profiles

```text
id
name
email
course
education_level
daily_study_hours
preferred_study_time
created_at
updated_at
```

## subjects

```text
id
user_id
name
description
difficulty
progress
created_at
```

## study_plans

```text
id
user_id
subject_id
topic
date
start_time
duration
priority
completed
created_at
```

## quizzes

```text
id
user_id
subject_id
topic
difficulty
total_questions
created_at
```

## quiz_questions

```text
id
quiz_id
question
option_a
option_b
option_c
option_d
correct_answer
explanation
```

## quiz_results

```text
id
user_id
quiz_id
score
total_questions
percentage
created_at
```

## chat_messages

```text
id
user_id
role
message
created_at
```

Use Row Level Security.

Users must only be able to access their own data.

---

# 9. Backend

Create a FastAPI backend.

Suggested routes:

```text
GET  /health

POST /ai/tutor

POST /ai/study-plan

POST /ai/quiz

POST /ai/explain

POST /ai/summarize
```

Keep AI logic inside services.

Example:

```text
backend/
├── main.py
├── routes/
│   ├── ai.py
│   └── health.py
│
├── services/
│   ├── ai_service.py
│   ├── quiz_service.py
│   └── study_plan_service.py
│
└── models/
```

Use environment variables for secrets.

Never hardcode API keys.

---

# 10. AI Tutor

The AI tutor should behave like a study assistant.

It should:

* Explain concepts clearly
* Adapt explanations to the student's level
* Give examples
* Answer follow-up questions
* Ask questions when useful
* Encourage active learning
* Avoid unnecessarily long responses

Example behavior:

Student:

```text
What is overfitting?
```

AI:

```text
Overfitting happens when a machine learning model
memorizes the training data instead of learning general
patterns.

Simple example:

Imagine studying only the exact questions from one
exam paper. You may score perfectly on that paper but
struggle with new questions.

That's similar to overfitting.
```

The tutor should not pretend to know information that it does not know.

---

# 11. AI Study Plan

The study-plan system should use:

```text
Student profile
+
Subjects
+
Weak topics
+
Available study time
+
Exam dates
+
Previous quiz performance
```

Generate:

```text
Date
Subject
Topic
Duration
Priority
Reason
```

Example:

```json
{
  "subject": "Machine Learning",
  "topic": "SVM Kernels",
  "duration": 40,
  "priority": "high",
  "reason": "Recent quiz performance was below 60%"
}
```

The AI should prioritize weak topics and upcoming exams.

---

# 12. AI Quiz

The AI should generate structured questions.

Each question should contain:

```text
question
options
correct_answer
explanation
topic
difficulty
```

Do not return malformed JSON.

Validate AI output before sending it to the frontend.

If AI output is invalid, handle the error gracefully.

---

# 13. Adaptive Learning

After a quiz:

```text
Quiz
↓
Score
↓
Analyze incorrect answers
↓
Identify weak topics
↓
Update subject/topic performance
↓
Adjust future study plan
```

Example:

```text
SVM = 85%
Decision Trees = 90%
Kernel Methods = 45%
```

The system should identify:

```text
Weak topic:
Kernel Methods
```

Then increase its revision priority.

---

# 14. Progress System

Do not use random progress numbers.

Calculate progress from actual stored data.

For example:

```text
Quiz performance
+
Completed study tasks
+
Topic mastery
```

Use deterministic calculations.

---

# 15. RAG — Advanced Feature

Implement RAG only after the main application works.

The flow should be:

```text
PDF upload
↓
Extract text
↓
Split text into chunks
↓
Create embeddings
↓
Store vectors
↓
Student asks question
↓
Retrieve relevant chunks
↓
Send context to LLM
↓
Generate answer
```

The student should be able to ask:

```text
Explain SVM from my uploaded notes.
```

The AI should answer using relevant uploaded material.

Do not add RAG before authentication, database, AI tutor, study plan and quiz are working.

---

# 16. Error Handling

Every API request must handle:

```text
Loading
Success
Error
Empty state
```

Never leave a button permanently stuck on loading.

Show useful messages such as:

```text
Something went wrong.
Please try again.
```

Do not expose internal API keys, stack traces, or sensitive backend information.

---

# 17. Validation

Validate:

* Email
* Password
* Required fields
* Subject names
* Study duration
* Quiz settings
* AI responses

Prevent invalid database records.

---

# 18. Security

Never:

* Put API keys in frontend code
* Commit `.env.local`
* Store passwords manually
* Allow users to access another user's data
* Trust AI-generated database queries
* Put secrets into GitHub

Ensure `.gitignore` includes:

```text
.env
.env.local
.env.*.local
__pycache__
node_modules
```

---

# 19. Performance

Keep the application lightweight.

Do not install unnecessary packages.

Do not create excessive components.

Do not add animations everywhere.

Avoid unnecessary API requests.

Cache data where appropriate.

---

# 20. Responsive Design

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop should have the sidebar.

Mobile should have a mobile navigation/menu.

Never allow horizontal scrolling caused by the UI.

---

# 21. Coding Rules

Use:

* TypeScript types
* React components
* Server/client components appropriately
* async/await
* clear variable names
* reusable functions
* environment variables
* error handling

Avoid:

* `any` unless absolutely necessary
* duplicated code
* huge files
* hardcoded user data
* hardcoded AI responses
* fake API calls in the final implementation
* unnecessary dependencies

---

# 22. Development Order

Implement the application in this exact order:

## Phase 1

Complete frontend UI.

## Phase 2

Supabase setup.

## Phase 3

Authentication.

## Phase 4

Profile and subjects database.

## Phase 5

FastAPI backend.

## Phase 6

AI Tutor.

## Phase 7

AI Study Plan.

## Phase 8

AI Quiz.

## Phase 9

Quiz results and weak-topic detection.

## Phase 10

Progress dashboard.

## Phase 11

Adaptive learning.

## Phase 12

RAG/PDF.

## Phase 13

Testing and bug fixing.

## Phase 14

Docker.

## Phase 15

Deployment.

---

# 23. Critical Copilot Rule

Do not implement multiple phases in one response.

When asked to implement a phase:

1. Inspect existing files.
2. List files that need modification.
3. Implement only that phase.
4. Preserve working functionality.
5. Check imports.
6. Check TypeScript errors.
7. Check API errors where applicable.
8. Tell the developer exactly what changed.
9. Do not automatically start the next phase.

If a required configuration or credential is missing, explain what is required instead of inventing it.

---

# 24. Current Goal

The immediate goal is:

**Build a complete, polished StudyMate AI application incrementally without breaking existing functionality.**

The application must eventually provide a real personalized learning experience rather than being a simple chatbot wrapper.

The most important product flow is:

```text
Student
↓
Profile
↓
Subjects
↓
Study goals
↓
AI-generated study plan
↓
Study
↓
AI quiz
↓
Performance analysis
↓
Weak topic detection
↓
Adaptive revision
↓
Improved performance
```

Always prioritize this core experience over unnecessary features.
