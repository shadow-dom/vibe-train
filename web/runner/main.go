package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
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

	srv := newServer(courses)
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("runner listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, srv))
}
