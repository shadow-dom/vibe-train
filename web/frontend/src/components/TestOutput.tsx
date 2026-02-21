import { useRef, useEffect } from "react";

interface TestOutputProps {
  lines: { type: string; data: string }[];
  isRunning: boolean;
}

export function TestOutput({ lines, isRunning }: TestOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 overflow-auto">
      {lines.length === 0 && !isRunning && (
        <span className="text-muted-foreground">Click "Run Tests" to execute your code...</span>
      )}
      {lines.map((line, i) => (
        <div key={i} className={lineClass(line)}>
          {line.data}
        </div>
      ))}
      {isRunning && (
        <div className="text-yellow-400 animate-pulse">Running tests...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function lineClass(line: { type: string; data: string }): string {
  if (line.type === "error") return "text-red-400";
  if (line.type === "stderr") return "text-red-300";
  if (line.data.includes("PASS")) return "text-green-400";
  if (line.data.includes("FAIL")) return "text-red-400";
  if (line.data.includes("---")) return "text-yellow-300";
  return "";
}
