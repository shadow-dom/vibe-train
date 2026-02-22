import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function LeaderboardPage() {
  const { user } = useAuth();
  const { data: entries, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      {!entries || entries.length === 0 ? (
        <p className="text-muted-foreground">No completions yet. Be the first!</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground w-16">Rank</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Points</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Completed</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const isCurrentUser = user?.id === entry.user_id;
                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b last:border-0 ${isCurrentUser ? "bg-primary/5 font-medium" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 text-sm">
                      {entry.username}
                      {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">{entry.total_points}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{entry.completed_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
