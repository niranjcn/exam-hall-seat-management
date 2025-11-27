import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Hall {
  id: string;
  name: string;
  rows: number;
  columns: number;
  seats_per_bench: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Seat {
  id: string;
  hall_id: string;
  row_number: number;
  column_number: number;
  seat_number: number;
  register_number: string | null;
  student_name: string | null;
  department: string | null;
  is_assigned: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  hall_id: string;
  exam_name: string;
  subject: string;
  exam_date: string;
  created_at: string;
}
