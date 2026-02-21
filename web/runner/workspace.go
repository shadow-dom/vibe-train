package main

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// BuildWorkspace creates a temporary directory with shared files, student code, and tests.
func BuildWorkspace(course *Course, slug string, code map[string]string) (string, error) {
	// Validate slug
	if strings.Contains(slug, "..") || strings.Contains(slug, "/") {
		return "", fmt.Errorf("invalid lesson slug")
	}

	tmpDir, err := os.MkdirTemp("", "vibe-run-*")
	if err != nil {
		return "", fmt.Errorf("creating temp dir: %w", err)
	}

	// 1. Copy shared files
	sharedDir := filepath.Join(course.Path, "shared")
	if err := copyDir(sharedDir, tmpDir); err != nil && !os.IsNotExist(err) {
		os.RemoveAll(tmpDir)
		return "", fmt.Errorf("copying shared: %w", err)
	}

	// 2. Write student code files
	for filename, content := range code {
		// Sanitize filename
		if strings.Contains(filename, "..") || strings.Contains(filename, "/") {
			os.RemoveAll(tmpDir)
			return "", fmt.Errorf("invalid filename: %s", filename)
		}
		if err := os.WriteFile(filepath.Join(tmpDir, filename), []byte(content), 0644); err != nil {
			os.RemoveAll(tmpDir)
			return "", fmt.Errorf("writing %s: %w", filename, err)
		}
	}

	// 3. Copy test files
	testsDir := filepath.Join(course.Path, "lessons", slug, "tests")
	if err := copyDir(testsDir, tmpDir); err != nil && !os.IsNotExist(err) {
		os.RemoveAll(tmpDir)
		return "", fmt.Errorf("copying tests: %w", err)
	}

	return tmpDir, nil
}

// copyDir copies all files from src to dst (non-recursive for simplicity).
func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		dstPath := filepath.Join(dst, relPath)

		if d.IsDir() {
			return os.MkdirAll(dstPath, 0755)
		}

		return copyFile(path, dstPath)
	})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
