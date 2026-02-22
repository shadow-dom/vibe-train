package main

import "math"

var difficultyPoints = map[string]int{
	"beginner":     10,
	"intermediate": 20,
	"advanced":     40,
}

// CalcLessonPoints returns points for completing a lesson.
// Returns 0 if viewedSolution is true.
// Returns 1.5x if hasSolution is false (hard mode — no solution available).
func CalcLessonPoints(difficulty string, viewedSolution bool, hasSolution bool) int {
	if viewedSolution {
		return 0
	}
	base, ok := difficultyPoints[difficulty]
	if !ok {
		base = 10
	}
	if !hasSolution {
		return int(math.Round(float64(base) * 1.5))
	}
	return base
}

// CalcCourseBonus returns 50% of total base points for the course
// when all lessons are completed without peeking at any solution.
func CalcCourseBonus(difficulty string, lessonCount int) int {
	base, ok := difficultyPoints[difficulty]
	if !ok {
		base = 10
	}
	totalBase := base * lessonCount
	return totalBase / 2
}
