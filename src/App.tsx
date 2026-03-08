import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import PortalSelect from "./pages/PortalSelect";
import StudentAuth from "./pages/StudentAuth";
import InstructorAuth from "./pages/InstructorAuth";
import InstructorDashboard from "./pages/InstructorDashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="learhub-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              
              {/* Portal Selection & Auth */}
              <Route path="/auth" element={<PortalSelect />} />
              <Route path="/auth/student" element={<StudentAuth />} />
              <Route path="/auth/instructor" element={<InstructorAuth />} />
              
              {/* Student Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-dashboard" element={<Dashboard />} />
              
              {/* Instructor Routes */}
              <Route path="/instructor" element={<InstructorDashboard />} />
              
              {/* Shared Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
