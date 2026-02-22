import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { UsernameModal } from "@/components/UsernameModal";
import { CourseListPage } from "@/pages/CourseListPage";
import { CoursePage } from "@/pages/CoursePage";
import { LessonPage } from "@/pages/LessonPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { ProfilePage } from "@/pages/ProfilePage";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <UsernameModal />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/courses/:id/:slug" element={<LessonPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
