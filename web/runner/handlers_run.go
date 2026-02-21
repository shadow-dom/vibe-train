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
	"path/filepath"
	"strings"
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

const defaultRunTimeout = 30 * time.Second
const kubernetesRunTimeout = 3 * time.Minute

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

		// Determine test command and timeout based on language
		var cmdName string
		var cmdArgs []string
		var cmdDir string
		var cmdEnv []string
		timeout := defaultRunTimeout

		switch course.Language {
		case "go":
			cmdName = "go"
			cmdArgs = []string{"test", "-v", "-count=1", "./..."}
			cmdDir = workDir
		case "python":
			cmdName = "python"
			cmdArgs = []string{"-m", "pytest", "-v"}
			cmdDir = workDir
		case "javascript", "typescript":
			cmdName = "npm"
			cmdArgs = []string{"test"}
			cmdDir = workDir
		case "kubernetes":
			timeout = kubernetesRunTimeout
			// Validate lesson slug for path safety
			if strings.Contains(req.LessonSlug, "..") || strings.Contains(req.LessonSlug, "/") {
				sendMsg(conn, "error", "invalid lesson slug")
				return
			}
			courseDir := course.Path
			lessonDir := filepath.Join(courseDir, "lessons", req.LessonSlug)

			// Run setup.sh first (from shared dir), then validate.sh
			setupScript := filepath.Join(courseDir, "shared", "setup.sh")
			validateScript := filepath.Join(lessonDir, "tests", "validate.sh")

			cmdName = "bash"
			cmdArgs = []string{"-c", fmt.Sprintf("bash %s && bash %s", setupScript, validateScript)}
			cmdDir = lessonDir
			cmdEnv = append(os.Environ(),
				"WORK_DIR="+workDir,
				"COURSE_DIR="+courseDir,
			)
		default:
			sendMsg(conn, "error", "unsupported language: "+course.Language)
			return
		}

		// Run with timeout
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()

		cmd := exec.CommandContext(ctx, cmdName, cmdArgs...)
		cmd.Dir = cmdDir
		if cmdEnv != nil {
			cmd.Env = cmdEnv
		}

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
				sendMsg(conn, "error", fmt.Sprintf("test timed out after %s", timeout))
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
