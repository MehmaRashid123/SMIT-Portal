import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, role } = useSelector(s => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="bg-green-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">SMIT Connect</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/courses" className="hover:underline">Courses</Link>
        {!user && (
          <>
            <Link to="/login" className="hover:underline">Student Login</Link>
            <Link to="/signup" className="bg-white text-green-700 px-3 py-1 rounded font-semibold hover:bg-green-100">Sign Up</Link>
          </>
        )}
        {user && role === 'student' && (
          <>
            <Link to="/student/leaves" className="hover:underline">My Leaves</Link>
            <button onClick={handleLogout} className="bg-white text-green-700 px-3 py-1 rounded font-semibold hover:bg-green-100">Logout</button>
          </>
        )}
        {user && role === 'admin' && (
          <>
            <Link to="/admin" className="hover:underline">Dashboard</Link>
            <button onClick={handleLogout} className="bg-white text-green-700 px-3 py-1 rounded font-semibold hover:bg-green-100">Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
