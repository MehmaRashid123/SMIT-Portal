import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'

// Public
import Home    from './pages/Home'
import Courses from './pages/Courses'
import Login   from './pages/Login'
import Signup   from './pages/Signup'
import Register from './pages/Register'

// Student portal
import StudentDashboard   from './pages/student/Dashboard'
import StudentLeaves      from './pages/student/Leaves'
import StudentAssignments from './pages/student/Assignments'
import StudentQuiz        from './pages/student/Quiz'
import StudentProgress    from './pages/student/Progress'
import StudentAttendance  from './pages/student/Attendance'
import StudentPayment     from './pages/student/Payment'
import StudentIDCard      from './pages/student/IDCard'

// Teacher portal
import TeacherDashboard      from './pages/teacher/Dashboard'
import ManageQuiz            from './pages/teacher/ManageQuiz'
import ManageAssignments     from './pages/teacher/ManageAssignments'
import ScanAttendance        from './pages/teacher/ScanAttendance'
import TeacherStudents       from './pages/teacher/Students'

// Admin portal
import AdminDashboard  from './pages/admin/Dashboard'
import AdminStudents   from './pages/admin/Students'
import AdminCourses    from './pages/admin/Courses'
import AdminLeaves     from './pages/admin/Leaves'
import AdminSettings   from './pages/admin/Settings'
import AdminRegistrations from './pages/admin/Registrations'
import AdminAttendance from './pages/admin/Attendance'
import AdminTeachers   from './pages/admin/Teachers'
import AdminEnrollments from './pages/admin/Enrollments'
import AdminIDCard     from './pages/admin/AdminIDCard'

const S = (role, el) => <ProtectedRoute requiredRole={role}>{el}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* Public — with Navbar */}
        <Route path="/" element={<><Navbar /><div className="pt-16"><Home /></div><Footer /><Chatbot /></>} />
        <Route path="/courses" element={<><Navbar /><div className="pt-16"><Courses /></div><Footer /></>} />
        <Route path="/login"    element={<><Navbar /><div className="pt-16"><Login /></div></>} />
        <Route path="/signup"   element={<><Navbar /><div className="pt-16"><Signup /></div></>} />
        <Route path="/register" element={<Register />} />

        {/* Student portal — full screen, no navbar */}
        <Route path="/student"             element={S('student', <StudentDashboard />)} />
        <Route path="/student/progress"    element={S('student', <StudentProgress />)} />
        <Route path="/student/attendance"  element={S('student', <StudentAttendance />)} />
        <Route path="/student/payment"     element={S('student', <StudentPayment />)} />
        <Route path="/student/assignments" element={S('student', <StudentAssignments />)} />
        <Route path="/student/quiz"        element={S('student', <StudentQuiz />)} />
        <Route path="/student/leaves"      element={S('student', <StudentLeaves />)} />
        <Route path="/student/idcard"      element={S('student', <StudentIDCard />)} />

        {/* Teacher portal */}
        <Route path="/teacher"             element={S('teacher', <TeacherDashboard />)} />
        <Route path="/teacher/quiz"        element={S('teacher', <ManageQuiz />)} />
        <Route path="/teacher/assignments" element={S('teacher', <ManageAssignments />)} />
        <Route path="/teacher/attendance"  element={S('teacher', <ScanAttendance />)} />
        <Route path="/teacher/students"    element={S('teacher', <TeacherStudents />)} />

        {/* Admin portal */}
        <Route path="/admin"          element={S('admin', <AdminDashboard />)} />
        <Route path="/admin/students" element={S('admin', <AdminStudents />)} />
        <Route path="/admin/courses"  element={S('admin', <AdminCourses />)} />
        <Route path="/admin/leaves"   element={S('admin', <AdminLeaves />)} />
        <Route path="/admin/settings" element={S('admin', <AdminSettings />)} />
        <Route path="/admin/registrations" element={S('admin', <AdminRegistrations />)} />
        <Route path="/admin/attendance"    element={S('admin', <AdminAttendance />)} />
        <Route path="/admin/teachers"      element={S('admin', <AdminTeachers />)} />
        <Route path="/admin/enrollments"   element={S('admin', <AdminEnrollments />)} />
        <Route path="/admin/idcard"        element={S('admin', <AdminIDCard />)} />
      </Routes>
    </BrowserRouter>
  )
}
