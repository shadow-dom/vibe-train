import { useRef, useEffect, useCallback, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

type TerminalStatus = "connected" | "disconnected";

interface UseTerminalOptions {
  courseId: string;
}

export function useTerminal({ courseId }: UseTerminalOptions) {
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<TerminalStatus>("disconnected");

  const refit = useCallback(() => {
    fitRef.current?.fit();
  }, []);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
      fitRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const createSession = useCallback(
    (el: HTMLDivElement) => {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
        },
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(el);
      fit.fit();

      termRef.current = term;
      fitRef.current = fit;

      // Connect WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/terminal`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "init", course_id: courseId }));
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "output") {
          term.write(msg.data);
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        term.write("\r\n\x1b[90m[session ended]\x1b[0m\r\n");
      };

      ws.onerror = () => {
        setStatus("disconnected");
      };

      // Send keystrokes
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "input", data }));
        }
      });

      // Send resize
      term.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "resize", cols, rows }));
        }
      });
    },
    [courseId]
  );

  const attach = useCallback(
    (el: HTMLDivElement | null) => {
      cleanup();
      containerRef.current = el;
      if (!el) return;
      createSession(el);
    },
    [cleanup, createSession]
  );

  const reconnect = useCallback(() => {
    cleanup();
    const el = containerRef.current;
    if (!el) return;
    createSession(el);
  }, [cleanup, createSession]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => fitRef.current?.fit();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      termRef.current?.dispose();
    };
  }, []);

  return { attach, refit, status, reconnect };
}
