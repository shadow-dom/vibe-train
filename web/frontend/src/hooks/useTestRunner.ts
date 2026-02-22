import { useState, useCallback, useRef } from "react";

interface RunMessage {
  type: "stdout" | "stderr" | "exit" | "error";
  data: string;
  points?: number;
}

interface UseTestRunnerReturn {
  output: RunMessage[];
  isRunning: boolean;
  exitCode: number | null;
  pointsEarned: number | null;
  runTests: (courseId: string, lessonSlug: string, code: Record<string, string>, viewedSolution?: boolean) => void;
  reset: () => void;
}

export function useTestRunner(): UseTestRunnerReturn {
  const [output, setOutput] = useState<RunMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const runTests = useCallback(
    (courseId: string, lessonSlug: string, code: Record<string, string>, viewedSolution: boolean = false) => {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      setOutput([]);
      setIsRunning(true);
      setExitCode(null);
      setPointsEarned(null);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/run`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            course_id: courseId,
            lesson_slug: lessonSlug,
            code,
            viewed_solution: viewedSolution,
          })
        );
      };

      ws.onmessage = (event) => {
        const msg: RunMessage = JSON.parse(event.data);
        if (msg.type === "exit") {
          setExitCode(parseInt(msg.data, 10));
          if (msg.points && msg.points > 0) {
            setPointsEarned(msg.points);
          }
          setIsRunning(false);
        } else {
          setOutput((prev) => [...prev, msg]);
        }
      };

      ws.onerror = () => {
        setIsRunning((running) => {
          if (running) {
            setOutput((prev) => [...prev, { type: "error", data: "WebSocket connection error" }]);
          }
          return false;
        });
      };

      ws.onclose = () => {
        setIsRunning(false);
      };
    },
    []
  );

  const reset = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setOutput([]);
    setIsRunning(false);
    setExitCode(null);
    setPointsEarned(null);
  }, []);

  return { output, isRunning, exitCode, pointsEarned, runTests, reset };
}
