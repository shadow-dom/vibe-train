package main

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
)

const cookieName = "vt_user_id"

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{2,24}$`)

func getUserFromCookie(r *http.Request, store *Store) (*User, error) {
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		return nil, err
	}
	return store.GetUser(cookie.Value)
}

func handleCreateUser(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Username string `json:"username"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}

		if !usernameRegex.MatchString(body.Username) {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "username must be 2-24 characters, alphanumeric and underscores only",
			})
			return
		}

		user, err := store.CreateUser(body.Username)
		if err != nil {
			if isUniqueViolation(err) {
				writeJSON(w, http.StatusConflict, map[string]string{"error": "username already taken"})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create user"})
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    user.ID,
			Path:     "/",
			MaxAge:   365 * 24 * 60 * 60,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})

		writeJSON(w, http.StatusCreated, user)
	}
}

func handleGetMe(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := getUserFromCookie(r, store)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "not logged in"})
			return
		}

		totalPoints, _ := store.GetUserTotalPoints(user.ID)

		writeJSON(w, http.StatusOK, map[string]any{
			"id":           user.ID,
			"username":     user.Username,
			"created_at":   user.CreatedAt,
			"total_points": totalPoints,
		})
	}
}

func handleGetMyProgress(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := getUserFromCookie(r, store)
		if err != nil {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "not logged in"})
			return
		}

		completions, err := store.GetUserCompletions(user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get completions"})
			return
		}
		if completions == nil {
			completions = []Completion{}
		}

		counts, err := store.GetCompletedLessonCounts(user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get progress"})
			return
		}

		totalPoints, _ := store.GetUserTotalPoints(user.ID)

		writeJSON(w, http.StatusOK, map[string]any{
			"completions":     completions,
			"course_progress": counts,
			"total_points":    totalPoints,
		})
	}
}

func isUniqueViolation(err error) bool {
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed")
}
