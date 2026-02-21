package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type RunRequest struct {
	CourseID   string            `json:"course_id"`
	LessonSlug string           `json:"lesson_slug"`
	Code       map[string]string `json:"code"`
}

type RunMessage struct {
	Type string `json:"type"` // "stdout", "stderr", "exit", "error"
	Data string `json:"data"`
}

const runTimeout = 30 * time.Second

func handleRun(index map[string]*Course) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("websocket upgrade: %v", err)
			return
		}
		defer conn.Close()

		// Read the run request
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("read message: %v", err)
			return
		}

		var req RunRequest
		if err := json.Unmarshal(msg, &req); err != nil {
			sendMsg(conn, "error", "invalid request: "+err.Error())
			return
		}

		// Look up course
		course, ok := index[req.CourseID]
		if !ok {
			sendMsg(conn, "error", "course not found: "+req.CourseID)
			return
		}

		// Build workspace
		workDir, err := BuildWorkspace(course, req.LessonSlug, req.Code)
		if err != nil {
			sendMsg(conn, "error", "workspace error: "+err.Error())
			return
		}
		defer os.RemoveAll(workDir)

		// Determine test command based on language
		var cmdName string
		var cmdArgs []string
		switch course.Language {
		case "go":
			cmdName = "go"
			cmdArgs = []string{"test", "-v", "-count=1", "./..."}
		case "python":
			cmdName = "python"
			cmdArgs = []string{"-m", "pytest", "-v"}
		case "javascript", "typescript":
			cmdName = "npm"
			cmdArgs = []string{"test"}
		default:
			sendMsg(conn, "error", "unsupported language: "+course.Language)
			return
		}

		// Run with timeout
		ctx, cancel := context.WithTimeout(context.Background(), runTimeout)
		defer cancel()

		cmd := exec.CommandContext(ctx, cmdName, cmdArgs...)
		cmd.Dir = workDir

		// Capture stdout and stderr
		stdout, err := cmd.StdoutPipe()
		if err != nil {
			sendMsg(conn, "error", "pipe error: "+err.Error())
			return
		}
		stderr, err := cmd.StderrPipe()
		if err != nil {
			sendMsg(conn, "error", "pipe error: "+err.Error())
			return
		}

		if err := cmd.Start(); err != nil {
			sendMsg(conn, "error", "start error: "+err.Error())
			return
		}

		// Stream stdout
		done := make(chan struct{})
		go func() {
			scanner := bufio.NewScanner(stdout)
			for scanner.Scan() {
				sendMsg(conn, "stdout", scanner.Text())
			}
			done <- struct{}{}
		}()

		// Stream stderr
		go func() {
			scanner := bufio.NewScanner(stderr)
			for scanner.Scan() {
				sendMsg(conn, "stderr", scanner.Text())
			}
			done <- struct{}{}
		}()

		// Wait for both streams
		<-done
		<-done

		err = cmd.Wait()
		exitCode := 0
		if err != nil {
			if exitErr, ok := err.(*exec.ExitError); ok {
				exitCode = exitErr.ExitCode()
			} else if ctx.Err() == context.DeadlineExceeded {
				sendMsg(conn, "error", "test timed out after 30s")
				exitCode = -1
			} else {
				exitCode = -1
			}
		}

		sendMsg(conn, "exit", fmt.Sprintf("%d", exitCode))

		// Send a proper close frame so the client doesn't see a connection error
		conn.WriteMessage(websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	}
}

func sendMsg(conn *websocket.Conn, msgType, data string) {
	msg := RunMessage{Type: msgType, Data: data}
	b, _ := json.Marshal(msg)
	conn.WriteMessage(websocket.TextMessage, b)
}
