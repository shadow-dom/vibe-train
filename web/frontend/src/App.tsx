import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { CourseListPage } from "@/pages/CourseListPage";
import { CoursePage } from "@/pages/CoursePage";
import { LessonPage } from "@/pages/LessonPage";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/courses/:id/:slug" element={<LessonPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
