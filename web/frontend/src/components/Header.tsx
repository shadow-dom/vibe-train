import { Link, useParams } from "react-router-dom";
import { TrainFront, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const params = useParams();
  const { user } = useAuth();

  const handleSignIn = () => {
    localStorage.removeItem("vt_guest");
    window.location.reload();
  };

  return (
    <header className="border-b bg-card px-4 h-14 flex items-center justify-between shrink-0">
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/" className="font-bold text-lg hover:text-primary/80 flex items-center gap-2">
          <TrainFront className="size-5" />
          vibe train
        </Link>
        {params.id && (
          <>
            <span className="text-muted-foreground">/</span>
            <Link to={`/courses/${params.id}`} className="text-muted-foreground hover:text-foreground">
              {params.id}
            </Link>
          </>
        )}
        {params.slug && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{params.slug}</span>
          </>
        )}
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground">
          <Button variant="ghost" size="sm" className="gap-1">
            <Trophy className="size-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
        </Link>
        {user ? (
          <Link to="/profile" className="text-muted-foreground hover:text-foreground">
            <Button variant="ghost" size="sm" className="gap-1">
              <User className="size-4" />
              <span className="hidden sm:inline">{user.username}</span>
              {user.total_points !== undefined && user.total_points > 0 && (
                <span className="text-xs font-mono text-primary">{user.total_points} pts</span>
              )}
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleSignIn}>
            Sign in
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === "dark" ? "☀︎" : "☾"}
        </Button>
      </div>
    </header>
  );
}
