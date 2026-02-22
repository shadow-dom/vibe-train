package main

import "net/http"

func handleGetLeaderboard(store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		entries, err := store.GetLeaderboard(50)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to get leaderboard"})
			return
		}
		if entries == nil {
			entries = []LeaderboardEntry{}
		}
		writeJSON(w, http.StatusOK, entries)
	}
}
