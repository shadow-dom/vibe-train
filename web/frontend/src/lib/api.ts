export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  estimated_hours: number;
  tags: string[];
  lesson_count: number;
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

const BASE = "/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
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
