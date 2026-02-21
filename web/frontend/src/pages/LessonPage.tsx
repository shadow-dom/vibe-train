import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchCourse, fetchLesson } from "@/lib/api";
import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { LessonContent } from "@/components/LessonContent";
import { CodeEditor } from "@/components/CodeEditor";
import { TestOutput } from "@/components/TestOutput";
import { useTestRunner } from "@/hooks/useTestRunner";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export function LessonPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const { theme } = useTheme();
  const { output, isRunning, exitCode, runTests } = useTestRunner();
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", id, slug],
    queryFn: () => fetchLesson(id!, slug!),
    enabled: !!id && !!slug,
  });

  // Set starter code when lesson loads
  useEffect(() => {
    if (lesson?.starter_code) {
      const firstFile = Object.keys(lesson.starter_code)[0];
      if (firstFile) {
        setCode(lesson.starter_code[firstFile]);
      }
      setShowSolution(false);
    }
  }, [lesson]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading lesson...</div>;
  if (!lesson) return <div className="p-8 text-destructive">Lesson not found.</div>;

  const mainFile = Object.keys(lesson.starter_code)[0] ?? "main.go";

  const handleRun = () => {
    runTests(id!, slug!, { [mainFile]: code });
  };

  const handleReset = () => {
    const firstFile = Object.keys(lesson.starter_code)[0];
    if (firstFile) setCode(lesson.starter_code[firstFile]);
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    const firstFile = Object.keys(lesson.solution_code)[0];
    if (firstFile) {
      setShowSolution(!showSolution);
      setCode(showSolution ? lesson.starter_code[firstFile] : lesson.solution_code[firstFile]);
    }
  };

  // Find prev/next lessons
  const currentIndex = course?.lessons.findIndex((l) => l.slug === slug) ?? -1;
  const prevLesson = currentIndex > 0 ? course?.lessons[currentIndex - 1] : null;
  const nextLesson = course && currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Left panel: lesson content */}
        <ResizablePanel defaultSize={45} minSize={25}>
          <div className="h-full overflow-auto">
            <LessonContent markdown={lesson.readme} />
            {/* Prev/Next navigation */}
            <div className="flex justify-between p-6 pt-0">
              {prevLesson ? (
                <Link
                  to={`/courses/${id}/${prevLesson.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← {prevLesson.title}
                </Link>
              ) : <span />}
              {nextLesson ? (
                <Link
                  to={`/courses/${id}/${nextLesson.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {nextLesson.title} →
                </Link>
              ) : <span />}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel: editor + output */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup orientation="vertical">
            {/* Code editor */}
            <ResizablePanel defaultSize={60} minSize={20}>
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-card">
                  <span className="text-sm font-mono text-muted-foreground">{mainFile}</span>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant={showSolution ? "secondary" : "outline"}
                      onClick={handleShowSolution}
                    >
                      {showSolution ? "Hide Solution" : "Solution"}
                    </Button>
                    <Button size="sm" onClick={handleRun} disabled={isRunning}>
                      {isRunning ? "Running..." : "Run Tests"}
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={course?.language ?? "go"}
                    theme={theme}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Test output */}
            <ResizablePanel defaultSize={40} minSize={15}>
              <div className="h-full flex flex-col">
                <div className="flex items-center px-3 py-2 border-b bg-card">
                  <span className="text-sm font-medium">Test Output</span>
                  {exitCode !== null && (
                    <span className={`ml-2 text-xs font-mono ${exitCode === 0 ? "text-green-500" : "text-red-500"}`}>
                      exit {exitCode}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <TestOutput lines={output} isRunning={isRunning} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
