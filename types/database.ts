export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string; email: string; course: string | null; education_level: string | null; daily_study_hours: number | null; preferred_study_time: string | null; created_at: string; updated_at: string };
        Insert: { id: string; name: string; email: string; course?: string | null; education_level?: string | null; daily_study_hours?: number | null; preferred_study_time?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; email?: string; course?: string | null; education_level?: string | null; daily_study_hours?: number | null; preferred_study_time?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      subjects: {
        Row: { id: string; user_id: string; name: string; description: string | null; difficulty: string; progress: number; created_at: string };
        Insert: { id?: string; user_id: string; name: string; description?: string | null; difficulty?: string; progress?: number; created_at?: string };
        Update: { id?: string; user_id?: string; name?: string; description?: string | null; difficulty?: string; progress?: number; created_at?: string };
        Relationships: [{ foreignKeyName: "subjects_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      study_plans: {
        Row: { id: string; user_id: string; subject_id: string | null; topic: string; date: string; start_time: string | null; duration: number; priority: string; completed: boolean; created_at: string };
        Insert: { id?: string; user_id: string; subject_id?: string | null; topic: string; date: string; start_time?: string | null; duration: number; priority?: string; completed?: boolean; created_at?: string };
        Update: { id?: string; user_id?: string; subject_id?: string | null; topic?: string; date?: string; start_time?: string | null; duration?: number; priority?: string; completed?: boolean; created_at?: string };
        Relationships: [{ foreignKeyName: "study_plans_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }];
      };
      quizzes: {
        Row: { id: string; user_id: string; subject_id: string | null; topic: string; difficulty: string; total_questions: number; created_at: string };
        Insert: { id?: string; user_id: string; subject_id?: string | null; topic: string; difficulty?: string; total_questions: number; created_at?: string };
        Update: { id?: string; user_id?: string; subject_id?: string | null; topic?: string; difficulty?: string; total_questions?: number; created_at?: string };
        Relationships: [{ foreignKeyName: "quizzes_subject_id_fkey"; columns: ["subject_id"]; isOneToOne: false; referencedRelation: "subjects"; referencedColumns: ["id"] }];
      };
      quiz_questions: {
        Row: { id: string; quiz_id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation: string | null; created_at: string };
        Insert: { id?: string; quiz_id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation?: string | null; created_at?: string };
        Update: { id?: string; quiz_id?: string; question?: string; option_a?: string; option_b?: string; option_c?: string; option_d?: string; correct_answer?: string; explanation?: string | null; created_at?: string };
        Relationships: [{ foreignKeyName: "quiz_questions_quiz_id_fkey"; columns: ["quiz_id"]; isOneToOne: false; referencedRelation: "quizzes"; referencedColumns: ["id"] }];
      };
      quiz_results: {
        Row: { id: string; user_id: string; quiz_id: string; score: number; total_questions: number; percentage: number; created_at: string };
        Insert: { id?: string; user_id: string; quiz_id: string; score: number; total_questions: number; percentage: number; created_at?: string };
        Update: { id?: string; user_id?: string; quiz_id?: string; score?: number; total_questions?: number; percentage?: number; created_at?: string };
        Relationships: [{ foreignKeyName: "quiz_results_quiz_id_fkey"; columns: ["quiz_id"]; isOneToOne: false; referencedRelation: "quizzes"; referencedColumns: ["id"] }];
      };
      chat_messages: {
        Row: { id: string; user_id: string; role: string; message: string; created_at: string };
        Insert: { id?: string; user_id: string; role: string; message: string; created_at?: string };
        Update: { id?: string; user_id?: string; role?: string; message?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};