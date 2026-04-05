import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentLeaves from './pages/student/Leaves'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminCourses from './pages/admin/Courses'
import AdminLeaves from './pages/admin/Leaves'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/student/leaves" element={
          <ProtectedRoute requiredRole="student"><StudentLeaves /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute requiredRole="admin"><AdminCourses /></ProtectedRoute>
        } />
        <Route path="/admin/leaves" element={
          <ProtectedRoute requiredRole="admin"><AdminLeaves /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
