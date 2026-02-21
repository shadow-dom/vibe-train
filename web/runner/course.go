package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

type Course struct {
	ID             string   `yaml:"id" json:"id"`
	Title          string   `yaml:"title" json:"title"`
	Description    string   `yaml:"description" json:"description"`
	Language       string   `yaml:"language" json:"language"`
	Difficulty     string   `yaml:"difficulty" json:"difficulty"`
	EstimatedHours int      `yaml:"estimated_hours" json:"estimated_hours"`
	Prerequisites  []string `yaml:"prerequisites" json:"prerequisites"`
	Tags           []string `yaml:"tags" json:"tags"`
	Lessons        []Lesson `yaml:"lessons" json:"lessons"`
	Path           string   `yaml:"-" json:"-"` // filesystem path to course dir
}

type Lesson struct {
	Slug  string `yaml:"slug" json:"slug"`
	Title string `yaml:"title" json:"title"`
}

type LessonDetail struct {
	Slug         string `json:"slug"`
	Title        string `json:"title"`
	Readme       string `json:"readme"`
	StarterCode  map[string]string `json:"starter_code"`
	SolutionCode map[string]string `json:"solution_code"`
}

// LoadCourse reads a course.yaml file and returns the parsed Course.
func LoadCourse(yamlPath string) (*Course, error) {
	data, err := os.ReadFile(yamlPath)
	if err != nil {
		return nil, err
	}
	var c Course
	if err := yaml.Unmarshal(data, &c); err != nil {
		return nil, fmt.Errorf("parsing %s: %w", yamlPath, err)
	}
	c.Path = filepath.Dir(yamlPath)
	return &c, nil
}

// ScanCourses walks the coursesRoot directory looking for course.yaml files.
func ScanCourses(coursesRoot string) ([]*Course, error) {
	var courses []*Course
	err := filepath.Walk(coursesRoot, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == "course.yaml" {
			c, err := LoadCourse(path)
			if err != nil {
				fmt.Fprintf(os.Stderr, "warning: skipping %s: %v\n", path, err)
				return nil
			}
			courses = append(courses, c)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	sort.Slice(courses, func(i, j int) bool {
		return courses[i].ID < courses[j].ID
	})
	return courses, nil
}

// LoadLessonDetail reads readme, starter, and solution files for a lesson.
func LoadLessonDetail(course *Course, slug string) (*LessonDetail, error) {
	// Validate slug exists in course
	var lesson *Lesson
	for i := range course.Lessons {
		if course.Lessons[i].Slug == slug {
			lesson = &course.Lessons[i]
			break
		}
	}
	if lesson == nil {
		return nil, fmt.Errorf("lesson %q not found in course %q", slug, course.ID)
	}

	// Path traversal protection
	if strings.Contains(slug, "..") || strings.Contains(slug, "/") {
		return nil, fmt.Errorf("invalid lesson slug")
	}

	lessonDir := filepath.Join(course.Path, "lessons", slug)

	detail := &LessonDetail{
		Slug:  lesson.Slug,
		Title: lesson.Title,
	}

	// Read README
	readmePath := filepath.Join(lessonDir, "README.md")
	if data, err := os.ReadFile(readmePath); err == nil {
		detail.Readme = string(data)
	}

	// Read starter code files
	detail.StarterCode = readCodeDir(filepath.Join(lessonDir, "starter"))

	// Read solution code files
	detail.SolutionCode = readCodeDir(filepath.Join(lessonDir, "solution"))

	return detail, nil
}

// readCodeDir reads all files in a directory and returns filename -> content map.
func readCodeDir(dir string) map[string]string {
	files := make(map[string]string)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return files
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		files[e.Name()] = string(data)
	}
	return files
}
