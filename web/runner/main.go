package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	coursesRoot := flag.String("courses-root", "/courses", "path to courses directory")
	port := flag.Int("port", 8081, "server port")
	flag.Parse()

	courses, err := ScanCourses(*coursesRoot)
	if err != nil {
		log.Fatalf("scanning courses: %v", err)
	}
	log.Printf("loaded %d course(s) from %s", len(courses), *coursesRoot)
	for _, c := range courses {
		log.Printf("  - %s (%d lessons)", c.ID, len(c.Lessons))
	}

	// Pre-spin clusters for kubernetes courses in the background
	for _, c := range courses {
		if c.Language == "kubernetes" {
			setupScript := filepath.Join(c.Path, "shared", "setup.sh")
			if _, err := os.Stat(setupScript); err == nil {
				go func(course *Course, script string) {
					log.Printf("pre-spinning cluster for %s...", course.ID)
					cmd := exec.Command("bash", script)
					cmd.Dir = course.Path
					cmd.Stdout = os.Stdout
					cmd.Stderr = os.Stderr
					cmd.Env = os.Environ()
					if err := cmd.Run(); err != nil {
						log.Printf("warning: cluster setup for %s failed: %v", course.ID, err)
					} else {
						log.Printf("cluster for %s is ready", course.ID)
					}
				}(c, setupScript)
			}
		}
	}

	srv := newServer(courses)
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("runner listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, srv))
}
