import { Link } from 'react-router-dom'

const FB_POSTS = [
  { id: 1, text: 'SMIT is offering free IT courses for youth. Apply now and transform your future!', date: 'March 28, 2026', likes: 342 },
  { id: 2, text: 'New batch starting for Web & Mobile App Development. Limited seats available.', date: 'March 20, 2026', likes: 218 },
  { id: 3, text: 'Congratulations to our graduates! 500+ students placed in top companies this year.', date: 'March 10, 2026', likes: 891 },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-green-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SMIT Connect Portal</h1>
        <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
          Saylani Mass IT Training — Empowering youth through free IT education
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/login" className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition">
            Student Login
          </Link>
          <Link to="/signup" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition">
            Student Signup
          </Link>
          <Link to="/courses" className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-400 transition">
            New Courses
          </Link>
        </div>
      </section>

      {/* Facebook Posts */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-blue-600">f</span> Latest from SMIT Facebook
        </h2>
        <div className="space-y-4">
          {FB_POSTS.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">SMIT Official</p>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{post.text}</p>
              <div className="mt-3 text-xs text-gray-400">👍 {post.likes} Likes</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
