package main

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
)

// npmCacheMu serializes npm install per course to avoid races.
var npmCacheMu sync.Mutex

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

	// 1. Copy shared files (skip node_modules — handled separately)
	sharedDir := filepath.Join(course.Path, "shared")
	if err := copyDirSkip(sharedDir, tmpDir, "node_modules"); err != nil && !os.IsNotExist(err) {
		os.RemoveAll(tmpDir)
		return "", fmt.Errorf("copying shared: %w", err)
	}

	// For JS/TS courses, install node_modules into a per-course cache dir,
	// then symlink into the workspace to avoid copying thousands of files.
	if course.Language == "javascript" || course.Language == "typescript" {
		cacheDir := filepath.Join("/tmp", "node-cache-"+course.ID)
		cachedModules := filepath.Join(cacheDir, "node_modules")

		npmCacheMu.Lock()
		if _, err := os.Stat(cachedModules); os.IsNotExist(err) {
			os.MkdirAll(cacheDir, 0755)
			for _, f := range []string{"package.json", "package-lock.json"} {
				src := filepath.Join(sharedDir, f)
				if _, serr := os.Stat(src); serr == nil {
					copyFile(src, filepath.Join(cacheDir, f))
				}
			}
			cmd := exec.Command("npm", "install")
			cmd.Dir = cacheDir
			if out, err := cmd.CombinedOutput(); err != nil {
				npmCacheMu.Unlock()
				os.RemoveAll(tmpDir)
				return "", fmt.Errorf("npm install: %s: %w", string(out), err)
			}
		}
		npmCacheMu.Unlock()

		dstModules := filepath.Join(tmpDir, "node_modules")
		if err := os.Symlink(cachedModules, dstModules); err != nil {
			os.RemoveAll(tmpDir)
			return "", fmt.Errorf("symlinking node_modules: %w", err)
		}
	}

	// 2. Write student code files
	for filename, content := range code {
		// Sanitize filename — reject path traversal
		if strings.Contains(filename, "..") {
			os.RemoveAll(tmpDir)
			return "", fmt.Errorf("invalid filename: %s", filename)
		}
		dest := filepath.Join(tmpDir, filename)
		// Ensure the resolved path stays within tmpDir
		if !strings.HasPrefix(filepath.Clean(dest), filepath.Clean(tmpDir)+string(os.PathSeparator)) {
			os.RemoveAll(tmpDir)
			return "", fmt.Errorf("invalid filename: %s", filename)
		}
		// Create parent directories for nested files (e.g. "subdir/file.yaml")
		if dir := filepath.Dir(dest); dir != tmpDir {
			if err := os.MkdirAll(dir, 0755); err != nil {
				os.RemoveAll(tmpDir)
				return "", fmt.Errorf("creating directory for %s: %w", filename, err)
			}
		}
		if err := os.WriteFile(dest, []byte(content), 0644); err != nil {
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

// copyDirSkip copies all files from src to dst, skipping directories with the given name.
func copyDirSkip(src, dst, skip string) error {
	return filepath.WalkDir(src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() && d.Name() == skip {
			return filepath.SkipDir
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

// copyDir copies all files from src to dst.
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
