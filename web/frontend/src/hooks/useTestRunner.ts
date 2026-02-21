import { useState, useCallback, useRef } from "react";

interface RunMessage {
  type: "stdout" | "stderr" | "exit" | "error";
  data: string;
}

interface UseTestRunnerReturn {
  output: RunMessage[];
  isRunning: boolean;
  exitCode: number | null;
  runTests: (courseId: string, lessonSlug: string, code: Record<string, string>) => void;
}

export function useTestRunner(): UseTestRunnerReturn {
  const [output, setOutput] = useState<RunMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const runTests = useCallback(
    (courseId: string, lessonSlug: string, code: Record<string, string>) => {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      setOutput([]);
      setIsRunning(true);
      setExitCode(null);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/run`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            course_id: courseId,
            lesson_slug: lessonSlug,
            code,
          })
        );
      };

      ws.onmessage = (event) => {
        const msg: RunMessage = JSON.parse(event.data);
        if (msg.type === "exit") {
          setExitCode(parseInt(msg.data, 10));
          setIsRunning(false);
        } else {
          setOutput((prev) => [...prev, msg]);
        }
      };

      ws.onerror = () => {
        // Only show error if we never received an exit message
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

  return { output, isRunning, exitCode, runTests };
}
