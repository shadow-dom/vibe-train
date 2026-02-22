import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchCourse, fetchLesson } from "@/lib/api";
import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { LessonContent } from "@/components/LessonContent";
import { CodeEditor } from "@/components/CodeEditor";
import { TestOutput } from "@/components/TestOutput";
import { TerminalPanel } from "@/components/TerminalPanel";
import { useTestRunner } from "@/hooks/useTestRunner";
import { SuccessModal } from "@/components/SuccessModal";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function LessonPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const { output, isRunning, exitCode, pointsEarned, runTests, reset: resetTests } = useTestRunner();
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [newFileName, setNewFileName] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasRunning, setWasRunning] = useState(false);

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

  // Track when tests finish running
  useEffect(() => {
    if (isRunning) {
      setWasRunning(true);
    } else if (wasRunning) {
      setWasRunning(false);
      if (exitCode === 0) {
        queryClient.invalidateQueries({ queryKey: ["course", id] });
        queryClient.invalidateQueries({ queryKey: ["courses"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        setShowSuccess(true);
      }
    }
  }, [isRunning, wasRunning, exitCode, id, queryClient]);

  // Set starter code when lesson loads — also clear test output
  useEffect(() => {
    if (lesson?.starter_code) {
      setFiles({ ...lesson.starter_code });
      const firstFile = Object.keys(lesson.starter_code)[0];
      if (firstFile) setActiveFile(firstFile);
      setShowSolution(false);
      setViewedSolution(false);
      setShowSuccess(false);
      resetTests();
    }
  }, [lesson, resetTests]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading lesson...</div>;
  if (!lesson) return <div className="p-8 text-destructive">Lesson not found.</div>;

  const isKubernetes = course?.language === "kubernetes";
  const fileNames = Object.keys(files);
  const starterFileNames = new Set(Object.keys(lesson.starter_code));
  const hasSolution = Object.keys(lesson.solution_code).length > 0;

  const handleFileChange = (value: string) => {
    setFiles((prev) => ({ ...prev, [activeFile]: value }));
  };

  const handleRun = () => {
    setShowTerminal(false);
    runTests(id!, slug!, files, viewedSolution);
  };

  const handleReset = () => {
    setFiles({ ...lesson.starter_code });
    const firstFile = Object.keys(lesson.starter_code)[0];
    if (firstFile) setActiveFile(firstFile);
    setShowSolution(false);
  };

  const handleShowSolution = () => {
    const newShowSolution = !showSolution;
    setShowSolution(newShowSolution);
    if (newShowSolution) {
      setFiles({ ...lesson.solution_code });
      const firstFile = Object.keys(lesson.solution_code)[0];
      if (firstFile) setActiveFile(firstFile);
      setViewedSolution(true);
    } else {
      setFiles({ ...lesson.starter_code });
      const firstFile = Object.keys(lesson.starter_code)[0];
      if (firstFile) setActiveFile(firstFile);
    }
  };

  const handleCreateFile = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || files[trimmed] !== undefined) return;
    setFiles((prev) => ({ ...prev, [trimmed]: "" }));
    setActiveFile(trimmed);
    setNewFileName(null);
  };

  const handleDeleteFile = (name: string) => {
    if (starterFileNames.has(name)) return; // can't delete starter files
    setFiles((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeFile === name) {
      const remaining = fileNames.filter((f) => f !== name);
      setActiveFile(remaining[0] ?? "");
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

        {/* Right panel: editor + bottom panel */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup orientation="vertical">
            {/* Code editor */}
            <ResizablePanel defaultSize={60} minSize={20}>
              <div className="h-full flex flex-col">
                {/* Toolbar with file tabs */}
                <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-card overflow-x-auto">
                  <div className="flex items-center gap-0.5 flex-1 min-w-0">
                    {fileNames.map((name) => (
                      <div
                        key={name}
                        className={`group flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-mono cursor-pointer whitespace-nowrap ${
                          name === activeFile
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => setActiveFile(name)}
                      >
                        {name}
                        {!starterFileNames.has(name) && (
                          <button
                            className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(name);
                            }}
                            title="Delete file"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {newFileName !== null ? (
                      <input
                        autoFocus
                        className="px-2 py-0.5 text-sm font-mono bg-background border rounded w-36"
                        placeholder="filename.ext"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateFile(newFileName);
                          if (e.key === "Escape") setNewFileName(null);
                        }}
                        onBlur={() => {
                          if (newFileName.trim()) handleCreateFile(newFileName);
                          else setNewFileName(null);
                        }}
                      />
                    ) : (
                      <button
                        className="px-1.5 py-0.5 text-muted-foreground hover:text-foreground text-sm"
                        onClick={() => setNewFileName("")}
                        title="New file"
                      >
                        +
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    {hasSolution && (
                      <Button
                        size="sm"
                        variant={showSolution ? "secondary" : "outline"}
                        onClick={handleShowSolution}
                      >
                        {showSolution ? "Hide Solution" : "Solution"}
                      </Button>
                    )}
                    {isKubernetes && (
                      <Button
                        size="sm"
                        variant={showTerminal ? "secondary" : "outline"}
                        onClick={() => setShowTerminal(!showTerminal)}
                      >
                        Terminal
                      </Button>
                    )}
                    <Button size="sm" onClick={handleRun} disabled={isRunning}>
                      {isRunning ? "Running..." : "Run Tests"}
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <CodeEditor
                    value={files[activeFile] ?? ""}
                    onChange={handleFileChange}
                    filename={activeFile}
                    language={course?.language ?? "go"}
                    theme={theme}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Bottom panel: test output or terminal */}
            <ResizablePanel defaultSize={40} minSize={15}>
              <div className="h-full flex flex-col">
                <div className="flex items-center px-3 py-2 border-b bg-card">
                  {isKubernetes ? (
                    <div className="flex gap-3">
                      <button
                        className={`text-sm font-medium ${!showTerminal ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setShowTerminal(false)}
                      >
                        Test Output
                      </button>
                      <button
                        className={`text-sm font-medium ${showTerminal ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setShowTerminal(true)}
                      >
                        Terminal
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium">Test Output</span>
                  )}
                  {exitCode !== null && !showTerminal && (
                    <span className={`ml-2 text-xs font-mono ${exitCode === 0 ? "text-green-500" : "text-red-500"}`}>
                      exit {exitCode}
                      {exitCode === 0 && pointsEarned !== null && pointsEarned > 0 && (
                        <span className="ml-2 text-green-500 font-semibold">+{pointsEarned} pts</span>
                      )}
                      {exitCode === 0 && pointsEarned !== null && pointsEarned === 0 && viewedSolution && (
                        <span className="ml-2 text-muted-foreground">(solution viewed)</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <div className={`absolute inset-0 ${showTerminal ? "hidden" : ""}`}>
                    <TestOutput lines={output} isRunning={isRunning} />
                  </div>
                  {isKubernetes && id && (
                    <div className={`absolute inset-0 ${showTerminal ? "" : "hidden"}`}>
                      <TerminalPanel courseId={id} visible={showTerminal} />
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        pointsEarned={pointsEarned}
        nextLessonTitle={nextLesson?.title}
        onNextLesson={nextLesson ? () => {
          setShowSuccess(false);
          navigate(`/courses/${id}/${nextLesson.slug}`);
        } : undefined}
      />
    </div>
  );
}
