import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Chatbot from './components/Chatbot'
import Footer from './components/Footer'

// Public
const Home     = lazy(() => import('./pages/Home'))
const Courses  = lazy(() => import('./pages/Courses'))
const Login    = lazy(() => import('./pages/Login'))
const Signup   = lazy(() => import('./pages/Signup'))
const Register = lazy(() => import('./pages/Register'))
const About    = lazy(() => import('./pages/About'))
const Campus      = lazy(() => import('./pages/Campus'))
const CheckResult = lazy(() => import('./pages/CheckResult'))
const EntryTest   = lazy(() => import('./pages/EntryTest'))

const CourseEnroll = lazy(() => import('./pages/CourseEnroll'))

const StudentDashboard   = lazy(() => import('./pages/student/Dashboard'))
const StudentLeaves      = lazy(() => import('./pages/student/Leaves'))
const StudentAssignments = lazy(() => import('./pages/student/Assignments'))
const StudentQuiz        = lazy(() => import('./pages/student/Quiz'))
const StudentProgress    = lazy(() => import('./pages/student/Progress'))
const StudentAttendance  = lazy(() => import('./pages/student/Attendance'))
const StudentPayment     = lazy(() => import('./pages/student/Payment'))
const StudentIDCard      = lazy(() => import('./pages/student/IDCard'))

// Teacher
const TeacherDashboard   = lazy(() => import('./pages/teacher/Dashboard'))
const ManageQuiz         = lazy(() => import('./pages/teacher/ManageQuiz'))
const ManageAssignments  = lazy(() => import('./pages/teacher/ManageAssignments'))
const ScanAttendance     = lazy(() => import('./pages/teacher/ScanAttendance'))
const TeacherStudents    = lazy(() => import('./pages/teacher/Students'))

// Admin
const AdminDashboard     = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents      = lazy(() => import('./pages/admin/Students'))
const AdminCourses       = lazy(() => import('./pages/admin/Courses'))
const AdminLeaves        = lazy(() => import('./pages/admin/Leaves'))
const AdminSettings      = lazy(() => import('./pages/admin/Settings'))
const AdminRegistrations = lazy(() => import('./pages/admin/Registrations'))
const AdminAttendance    = lazy(() => import('./pages/admin/Attendance'))
const AdminTeachers      = lazy(() => import('./pages/admin/Teachers'))
const AdminEnrollments   = lazy(() => import('./pages/admin/Enrollments'))
const AdminIDCard        = lazy(() => import('./pages/admin/AdminIDCard'))
const AdminEntryTest     = lazy(() => import('./pages/admin/EntryTestResults'))

const S = (role, el) => <ProtectedRoute requiredRole={role}>{el}</ProtectedRoute>

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<><Navbar /><div className="pt-16"><Home /></div><Footer /><Chatbot /></>} />
          <Route path="/courses" element={<><Navbar /><div className="pt-16"><Courses /></div><Footer /></>} />
          <Route path="/login"   element={<><Navbar /><div className="pt-16"><Login /></div></>} />
          <Route path="/signup"  element={<><Navbar /><div className="pt-16"><Signup /></div></>} />
          <Route path="/register" element={<Register />} />
          <Route path="/about"    element={<><Navbar /><div className="pt-16"><About /></div><Footer /></>} />
          <Route path="/campus"   element={<><Navbar /><div className="pt-16"><Campus /></div><Footer /></>} />
          <Route path="/result"   element={<><Navbar /><div className="pt-16"><CheckResult /></div><Footer /></>} />
          <Route path="/entry-test" element={<EntryTest />} />
          <Route path="/enroll"     element={<CourseEnroll />} />

          {/* Student */}
          <Route path="/student"             element={S('student', <StudentDashboard />)} />
          <Route path="/student/progress"    element={S('student', <StudentProgress />)} />
          <Route path="/student/attendance"  element={S('student', <StudentAttendance />)} />
          <Route path="/student/payment"     element={S('student', <StudentPayment />)} />
          <Route path="/student/assignments" element={S('student', <StudentAssignments />)} />
          <Route path="/student/quiz"        element={S('student', <StudentQuiz />)} />
          <Route path="/student/leaves"      element={S('student', <StudentLeaves />)} />
          <Route path="/student/idcard"      element={S('student', <StudentIDCard />)} />

          {/* Teacher */}
          <Route path="/teacher"             element={S('teacher', <TeacherDashboard />)} />
          <Route path="/teacher/quiz"        element={S('teacher', <ManageQuiz />)} />
          <Route path="/teacher/assignments" element={S('teacher', <ManageAssignments />)} />
          <Route path="/teacher/attendance"  element={S('teacher', <ScanAttendance />)} />
          <Route path="/teacher/students"    element={S('teacher', <TeacherStudents />)} />

          {/* Admin */}
          <Route path="/admin"               element={S('admin', <AdminDashboard />)} />
          <Route path="/admin/students"      element={S('admin', <AdminStudents />)} />
          <Route path="/admin/courses"       element={S('admin', <AdminCourses />)} />
          <Route path="/admin/registrations" element={S('admin', <AdminRegistrations />)} />
          <Route path="/admin/enrollments"   element={S('admin', <AdminEnrollments />)} />
          <Route path="/admin/teachers"      element={S('admin', <AdminTeachers />)} />
          <Route path="/admin/attendance"    element={S('admin', <AdminAttendance />)} />
          <Route path="/admin/leaves"        element={S('admin', <AdminLeaves />)} />
          <Route path="/admin/settings"      element={S('admin', <AdminSettings />)} />
          <Route path="/admin/idcard"        element={S('admin', <AdminIDCard />)} />
          <Route path="/admin/entry-test"    element={S('admin', <AdminEntryTest />)} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
