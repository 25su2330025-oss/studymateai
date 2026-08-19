create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  course text,
  education_level text,
  daily_study_hours numeric(4, 2),
  preferred_study_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null,
  date date not null,
  start_time time,
  duration integer not null check (duration > 0),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  total_questions integer not null check (total_questions > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  percentage numeric(5, 2) not null check (percentage between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student', 'tutor', 'user', 'assistant', 'system')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists subjects_user_id_idx on public.subjects(user_id);
create index if not exists study_plans_user_date_idx on public.study_plans(user_id, date);
create index if not exists quizzes_user_id_idx on public.quizzes(user_id);
create index if not exists quiz_questions_quiz_id_idx on public.quiz_questions(quiz_id);
create index if not exists quiz_results_user_id_idx on public.quiz_results(user_id);
create index if not exists chat_messages_user_created_idx on public.chat_messages(user_id, created_at);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.study_plans enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can view their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can create their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage their subjects" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their study plans" on public.study_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their quizzes" on public.quizzes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their quiz results" on public.quiz_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their chat messages" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view their quiz questions" on public.quiz_questions for select using (
  exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.user_id = auth.uid())
);
create policy "Users can create their quiz questions" on public.quiz_questions for insert with check (
  exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.user_id = auth.uid())
);
create policy "Users can update their quiz questions" on public.quiz_questions for update using (
  exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.user_id = auth.uid())
) with check (
  exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.user_id = auth.uid())
);
create policy "Users can delete their quiz questions" on public.quiz_questions for delete using (
  exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.user_id = auth.uid())
);