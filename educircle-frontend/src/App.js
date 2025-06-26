import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Homepage from './components/Homepage'; 
import SignIn from './components/SignIn'; 
import Register from './components/Register'; 
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherCourses from './pages/TeacherCourses';
import StudentCourses from './pages/StudentCourses';
import TeacherProjects from './pages/TeacherProjects';
import StudentProjects from './pages/StudentProjects';
import CalendarPage from './pages/CalendarPage';
import './App.css'; 

function App() {
  return (
    <Router> {}
      <div className="App">
        <Routes> {}
          <Route path="/" element={<Homepage />} /> {}
          <Route path="/signin" element={<SignIn />} /> {}
          <Route path="/register" element={<Register />} /> {}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} /> {}
          <Route path="/dashboard/student" element={<StudentDashboard />} /> {}
          <Route path="/courses/teacher" element={<TeacherCourses />} /> {}
          <Route path="/courses/student" element={<StudentCourses />} />
          <Route path="/courses/teacher/projects/:courseId" element={<TeacherProjects />} />
          <Route path="/courses/student/:courseId/projects" element={<StudentProjects />} />
          <Route path="/calendar/teacher" element={<CalendarPage role="teacher" />} />
          <Route path="/calendar/student" element={<CalendarPage role="student" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;