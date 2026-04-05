import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const CARDS = [
  { label: 'Student Management', desc: 'Upload students via Excel, view all students', to: '/admin/students', icon: '👥' },
  { label: 'Course Management', desc: 'Add, edit, and manage courses', to: '/admin/courses', icon: '📚' },
  { label: 'Leave Management', desc: 'Review and approve/reject leave requests', to: '/admin/leaves', icon: '📋' },
  { label: 'Admin Settings', desc: 'Add admins, reset password', to: '/admin/settings', icon: '⚙️' },
]

export default function Dashboard() {
  const { user } = useSelector(s => s.auth)
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, {user?.name || user?.username}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CARDS.map(card => (
            <Link key={card.to} to={card.to} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:border-green-400 hover:shadow-md transition group">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h2 className="font-semibold text-gray-800 text-lg group-hover:text-green-700">{card.label}</h2>
              <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
