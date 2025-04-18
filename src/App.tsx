import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CourseDetail from "./pages/CourseDetail";
import LearningPathDetail from "./pages/LearningPathDetail";
import TestLessonPage from "./pages/TestLessonPage";
import LessonPage from "./pages/LessonPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/path/:id" element={<LearningPathDetail />} />
              <Route path="/lessons/:lessonId" element={<LessonPage />} />
              <Route path="/test-lesson" element={<TestLessonPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
