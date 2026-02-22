import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchMe, createUser, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setDismissed] = useState(() =>
    localStorage.getItem("vt_guest") === "true"
  );

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes — refetch on invalidation after completions
  });

  const login = useCallback(async (username: string) => {
    await createUser(username);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    // Also refetch courses since they now include user progress
    await queryClient.invalidateQueries({ queryKey: ["courses"] });
  }, [queryClient]);

  const logout = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("vt_guest", "true");
  }, []);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
