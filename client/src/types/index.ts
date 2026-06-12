export interface User {
  id: number;
  username: string;
  name: string;
  role: 'child' | 'parent' | 'teacher';
  parent_id?: number;
}

export interface Block {
  id: string;
  label: string;
  color: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  category: 'logic' | 'loop' | 'condition' | 'project';
  difficulty: number;
  expected_blocks?: string[];
  goal_description: string;
  hints?: string[];
  blocks_available: Block[];
  order_matters: number;
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    stars: number;
    attempts: number;
  };
}

export interface Progress {
  id: number;
  student_id: number;
  level_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  stars: number | null;
  attempts: number;
  blocks_used: string | null;
  time_spent: number;
  completed_at: string | null;
  last_attempt_at: string | null;
  title?: string;
  category?: string;
  difficulty?: number;
  description?: string;
}

export interface Class {
  id: number;
  name: string;
  teacher_id: number;
  created_at: string;
  student_count?: number;
  level_count?: number;
}

export interface Student {
  id: number;
  name: string;
  username: string;
  completed_levels?: number;
  total_stars?: number;
}

export interface ChildInfo {
  id: number;
  name: string;
  username: string;
  completed_levels: number;
  total_levels: number;
  total_stars: number;
}
