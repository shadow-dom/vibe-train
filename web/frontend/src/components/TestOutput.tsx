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
          <AnsiLine text={line.data} />
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
  // Don't apply line-level classes if the line has ANSI codes — let AnsiLine handle it
  if (/\x1b\[/.test(line.data)) return "";
  if (line.type === "stderr") return "text-red-300";
  if (line.data.includes("PASS")) return "text-green-400";
  if (line.data.includes("FAIL")) return "text-red-400";
  if (line.data.includes("---")) return "text-yellow-300";
  return "";
}

// ANSI SGR color map
const ANSI_COLORS: Record<number, string> = {
  30: "#4d4d4d", 31: "#f87171", 32: "#4ade80", 33: "#facc15",
  34: "#60a5fa", 35: "#c084fc", 36: "#22d3ee", 37: "#d4d4d4",
  90: "#737373", 91: "#fca5a5", 92: "#86efac", 93: "#fde047",
  94: "#93c5fd", 95: "#d8b4fe", 96: "#67e8f9", 97: "#ffffff",
};

interface Span {
  text: string;
  color?: string;
  bold?: boolean;
}

function parseAnsi(text: string): Span[] {
  const spans: Span[] = [];
  const re = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let color: string | undefined;
  let bold = false;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    // Push text before this escape
    if (match.index > lastIndex) {
      spans.push({ text: text.slice(lastIndex, match.index), color, bold });
    }
    lastIndex = re.lastIndex;

    // Parse SGR params
    const codes = match[1].split(";").map(Number);
    for (const code of codes) {
      if (code === 0) { color = undefined; bold = false; }
      else if (code === 1) { bold = true; }
      else if (ANSI_COLORS[code]) { color = ANSI_COLORS[code]; }
    }
  }

  // Remaining text
  if (lastIndex < text.length) {
    spans.push({ text: text.slice(lastIndex), color, bold });
  }

  return spans;
}

function AnsiLine({ text }: { text: string }) {
  if (!/\x1b\[/.test(text)) return <>{text}</>;

  const spans = parseAnsi(text);
  return (
    <>
      {spans.map((span, i) => (
        <span
          key={i}
          style={{
            color: span.color,
            fontWeight: span.bold ? "bold" : undefined,
          }}
        >
          {span.text}
        </span>
      ))}
    </>
  );
}
