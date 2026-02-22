import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{2,24}$/;

export function UsernameModal() {
  const { user, isLoading, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dismissed = localStorage.getItem("vt_guest") === "true";

  if (isLoading || user || dismissed) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!USERNAME_REGEX.test(username)) {
      setError("2-24 characters, letters, numbers, and underscores only");
      return;
    }

    setSubmitting(true);
    try {
      await login(username);
    } catch (err: any) {
      const msg = err.message || "Failed to create user";
      if (msg.includes("409")) {
        setError("Username already taken");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <CardTitle>Choose a username</CardTitle>
          <CardDescription>Track your progress and earn points as you learn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                maxLength={24}
              />
              {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Creating..." : "Claim username"}
              </Button>
              <Button type="button" variant="ghost" onClick={logout}>
                Skip
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
