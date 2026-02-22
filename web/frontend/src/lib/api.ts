export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  estimated_hours: number;
  tags: string[];
  lesson_count: number;
  completed_lessons?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  estimated_hours: number;
  prerequisites: string[];
  tags: string[];
  lessons: LessonSummary[];
  user_progress?: Record<string, boolean>;
}

export interface LessonSummary {
  slug: string;
  title: string;
}

export interface LessonDetail {
  slug: string;
  title: string;
  readme: string;
  starter_code: Record<string, string>;
  solution_code: Record<string, string>;
}

export interface User {
  id: string;
  username: string;
  created_at: string;
  total_points?: number;
}

export interface UserProgress {
  completions: Completion[];
  course_progress: Record<string, number>;
  total_points: number;
}

export interface Completion {
  id: number;
  user_id: string;
  course_id: string;
  lesson_slug: string;
  points: number;
  viewed_solution: boolean;
  completed_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_points: number;
  completed_count: number;
}

const BASE = "/api";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export function fetchCourses() {
  return fetchJSON<CourseListItem[]>("/courses");
}

export function fetchCourse(id: string) {
  return fetchJSON<Course>(`/courses/${id}`);
}

export function fetchLesson(courseId: string, slug: string) {
  return fetchJSON<LessonDetail>(`/courses/${courseId}/lessons/${slug}`);
}

export function createUser(username: string) {
  return fetchJSON<User>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

export function fetchMe() {
  return fetchJSON<User>("/users/me");
}

export function fetchProgress() {
  return fetchJSON<UserProgress>("/users/me/progress");
}

export function fetchLeaderboard() {
  return fetchJSON<LeaderboardEntry[]>("/leaderboard");
}
