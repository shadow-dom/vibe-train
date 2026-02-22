import { useQuery } from "@tanstack/react-query";
import { fetchProgress, fetchCourses } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const difficultyColors: Record<string, string> = {
  beginner: "text-green-500 border-green-500",
  intermediate: "text-yellow-500 border-yellow-500",
  advanced: "text-red-500 border-red-500",
};

export function ProfilePage() {
  const { user } = useAuth();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: fetchProgress,
    enabled: !!user,
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    enabled: !!user,
  });

  if (!user) {
    return <div className="p-8 text-muted-foreground">Sign in to view your profile.</div>;
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Build course map for lookup
  const courseMap = new Map(courses?.map((c) => [c.id, c]) ?? []);

  // Find fully completed courses
  const completedCourses = courses?.filter((c) => {
    const count = progress?.course_progress[c.id] ?? 0;
    return count >= c.lesson_count;
  }) ?? [];

  return (
    <div className="p-8 max-w-3xl mx-auto overflow-auto h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
        <p className="text-4xl font-bold text-primary">{progress?.total_points ?? 0} pts</p>
      </div>

      {completedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Medals</h2>
          <div className="flex flex-wrap gap-3">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${difficultyColors[course.difficulty] ?? ""}`}
              >
                <span className="text-lg">
                  {course.difficulty === "advanced" ? "🥇" : course.difficulty === "intermediate" ? "🥈" : "🥉"}
                </span>
                <span className="text-sm font-medium">{course.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">History</h2>
        {!progress?.completions.length ? (
          <p className="text-muted-foreground">No completions yet.</p>
        ) : (
          <div className="space-y-2">
            {progress.completions.map((c) => {
              const course = courseMap.get(c.course_id);
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course?.title ?? c.course_id} / {c.lesson_slug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.completed_at + "Z").toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.viewed_solution && (
                      <Badge variant="outline" className="text-xs">peeked</Badge>
                    )}
                    <span className="text-sm font-mono font-medium">
                      {c.points > 0 ? `+${c.points}` : "0"} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
