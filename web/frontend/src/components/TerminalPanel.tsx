import { useTerminal } from "@/hooks/useTerminal";
import { useEffect } from "react";
import "@xterm/xterm/css/xterm.css";

interface TerminalPanelProps {
  courseId: string;
  visible: boolean;
}

export function TerminalPanel({ courseId, visible }: TerminalPanelProps) {
  const { attach, refit } = useTerminal({ courseId });

  // Re-fit when becoming visible (container may have resized while hidden)
  useEffect(() => {
    if (visible) refit();
  }, [visible, refit]);

  return (
    <div className={`h-full flex flex-col ${visible ? "" : "hidden"}`}>
      <div ref={attach} className="flex-1 min-h-0 bg-[#1e1e1e] p-1" />
    </div>
  );
}
