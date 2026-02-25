export interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  diet_type: string | null;
  goal: string | null;
  medical_conditions: string[];
  allergies: string[];
  health_score: number;
  scans_this_month: number;
  created_at: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface DashboardStats {
  health_score: number;
  total_scans: number;
  total_workouts: number;
  avg_nutrition: number;
  avg_form: number;
  scans_this_month: number;
  plan: string;
}

export interface ScanItem {
  id: number;
  product_name: string;
  score: number;
  grade: string;
  calories: number | null;
  created_at: string;
}

export interface WorkoutItem {
  id: number;
  exercise_type: string;
  form_score: number;
  reps: number;
  duration_seconds: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MuscleTaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}
