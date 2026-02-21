import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCourses } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CourseListPage() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading courses...</div>;
  if (error) return <div className="p-8 text-destructive">Failed to load courses.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-muted-foreground mb-8">Learn by building real projects, one test at a time.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{course.language}</Badge>
                  <Badge variant="secondary">{course.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {course.lesson_count} lessons · ~{course.estimated_hours}h
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
