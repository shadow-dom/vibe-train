package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

type TerminalMessage struct {
	Type string `json:"type"` // "init", "input", "resize", "output"
	Data string `json:"data,omitempty"`
	// Init fields
	CourseID string `json:"course_id,omitempty"`
	// Resize fields
	Cols uint16 `json:"cols,omitempty"`
	Rows uint16 `json:"rows,omitempty"`
}

func handleTerminal(index map[string]*Course) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("terminal websocket upgrade: %v", err)
			return
		}
		defer conn.Close()

		// Wait for init message
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("terminal read init: %v", err)
			return
		}

		var initMsg TerminalMessage
		if err := json.Unmarshal(msg, &initMsg); err != nil || initMsg.Type != "init" {
			sendMsg(conn, "error", "expected init message")
			return
		}

		course, ok := index[initMsg.CourseID]
		if !ok {
			sendMsg(conn, "error", "course not found: "+initMsg.CourseID)
			return
		}

		// Start bash with PTY — inherit env so kubectl picks up kubeconfig from setup.sh
		cmd := exec.Command("bash", "--login")
		cmd.Dir = course.Path
		cmd.Env = append(os.Environ(),
			"TERM=xterm-256color",
			"COURSE_DIR="+course.Path,
			"PS1=\\[\\e[32m\\]k8s\\[\\e[0m\\]:\\w$ ",
		)

		ptmx, err := pty.Start(cmd)
		if err != nil {
			sendMsg(conn, "error", "pty start error: "+err.Error())
			return
		}
		defer func() {
			ptmx.Close()
			cmd.Process.Kill()
			cmd.Wait()
		}()

		// Read from PTY -> send to WebSocket
		go func() {
			buf := make([]byte, 4096)
			for {
				n, err := ptmx.Read(buf)
				if err != nil {
					return
				}
				out := TerminalMessage{Type: "output", Data: string(buf[:n])}
				b, _ := json.Marshal(out)
				if err := conn.WriteMessage(websocket.TextMessage, b); err != nil {
					return
				}
			}
		}()

		// Read from WebSocket -> write to PTY
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}

			var tmsg TerminalMessage
			if err := json.Unmarshal(msg, &tmsg); err != nil {
				continue
			}

			switch tmsg.Type {
			case "input":
				if _, err := ptmx.Write([]byte(tmsg.Data)); err != nil {
					return
				}
			case "resize":
				if tmsg.Cols > 0 && tmsg.Rows > 0 {
					pty.Setsize(ptmx, &pty.Winsize{
						Cols: tmsg.Cols,
						Rows: tmsg.Rows,
					})
				}
			}
		}
	}
}
