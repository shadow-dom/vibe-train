import { useTerminal } from "@/hooks/useTerminal";
import { useEffect } from "react";
import "@xterm/xterm/css/xterm.css";

interface TerminalPanelProps {
  courseId: string;
  visible: boolean;
}

export function TerminalPanel({ courseId, visible }: TerminalPanelProps) {
  const { attach, refit, status, reconnect } = useTerminal({ courseId });

  // Re-fit when becoming visible (container may have resized while hidden)
  useEffect(() => {
    if (visible) refit();
  }, [visible, refit]);

  return (
    <div className={`h-full flex flex-col ${visible ? "" : "hidden"}`}>
      <div className="flex-1 min-h-0 relative">
        <div ref={attach} className="absolute inset-0 bg-[#1e1e1e] p-1" />
        {status === "disconnected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <button
              onClick={reconnect}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm font-medium transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
