import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Homepage from './components/Homepage'; 
import SignIn from './components/SignIn'; 
import Register from './components/Register'; 
import ForgotPassword from './components/ForgotPassword';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherCourses from './pages/TeacherCourses';
import StudentCourses from './pages/StudentCourses';
import TeacherProjects from './pages/TeacherProjects';
import StudentProjects from './pages/StudentProjects';
import CalendarPage from './pages/CalendarPage';
import Settings from './components/Settings/Settings';
import StudentProjectGroups from './pages/StudentProjectGroups';
import TeacherProjectGroups from './pages/TeacherProjectGroups';
import StudentGroupDetail from './pages/StudentGroupDetail';
import TeacherGroupDetail from './pages/TeacherGroupDetail';
import TeacherAllGroups from './pages/TeacherAllGroups';
import TeacherAllProjects from './pages/TeacherAllProjects';
import StudentAllGroups from './pages/StudentAllGroups';
import StudentAllProjects from './pages/StudentAllProjects';
import AiTestPage from './components/AiFeatures/AiTestPage';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/dashboard/student" element={<StudentDashboard theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/courses/teacher" element={<TeacherCourses />} />
          <Route path="/courses/student" element={<StudentCourses />} />
          <Route path="/courses/teacher/projects/:courseId" element={<TeacherProjects />} />
          <Route path="/courses/student/:courseId/projects" element={<StudentProjects />} />
          <Route path="/calendar/teacher" element={<CalendarPage role="teacher" />} />
          <Route path="/calendar/student" element={<CalendarPage role="student" />} />
          <Route path="/settings/teacher" element={<Settings userRole="teacher" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/settings/student" element={<Settings userRole="student" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/projects/:projectId/groups/student" element={<StudentProjectGroups userRole="student" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/projects/:projectId/groups/teacher" element={<TeacherProjectGroups userRole="teacher" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/groups/:groupId/student-detail" element={<StudentGroupDetail userRole="student" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/groups/:groupId/teacher-detail" element={<TeacherGroupDetail userRole="teacher" theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/groups/teacher" element={<TeacherAllGroups theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/projects/teacher" element={<TeacherAllProjects theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/groups/student" element={<StudentAllGroups theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/projects/student" element={<StudentAllProjects theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/all-groups/teacher" element={<TeacherAllGroups theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/all-projects/teacher" element={<TeacherAllProjects theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/all-groups/student" element={<StudentAllGroups theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/all-projects/student" element={<StudentAllProjects theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/ai-test" element={<AiTestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;