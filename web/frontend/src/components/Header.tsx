import { Link, useParams } from "react-router-dom";
import { TrainFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const params = useParams();

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
      <Button variant="ghost" size="sm" onClick={toggleTheme}>
        {theme === "dark" ? "☀︎" : "☾"}
      </Button>
    </header>
  );
}
