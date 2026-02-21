import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { fetchCourse } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (error || !course) return <div className="p-8 text-destructive">Course not found.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline">{course.language}</Badge>
        <Badge variant="secondary">{course.difficulty}</Badge>
        <span className="text-sm text-muted-foreground">~{course.estimated_hours}h</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-muted-foreground mb-6">{course.description}</p>

      {course.prerequisites.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Prerequisites</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {course.prerequisites.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Lessons</h2>
      <div className="space-y-2">
        {course.lessons.map((lesson, i) => (
          <Link
            key={lesson.slug}
            to={`/courses/${course.id}/${lesson.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent transition-colors"
          >
            <span className="text-sm font-mono text-muted-foreground w-6 text-right">
              {i + 1}
            </span>
            <span className="font-medium">{lesson.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
