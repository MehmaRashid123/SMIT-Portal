import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import StudentCard from '../../components/StudentCard'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import { supabase } from '../../lib/supabaseClient'

export default function StudentIDCard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: enrollments } = useSelector(s => s.enrollment)
  const [pictureUrl, setPictureUrl] = useState(null)
  const [regCourse, setRegCourse]   = useState(null)
  const [regEnroll, setRegEnroll]   = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      // Fetch enrollments
      await dispatch(fetchEnrollments(user.id))

      // Fetch registration data (picture + course from registration)
      const { data: reg } = await supabase
        .from('registrations')
        .select('picture_url, campus, city, courses(name, category, duration)')
        .eq('id_number', user.cnic)
        .eq('status', 'approved')
        .single()

      if (reg) {
        setPictureUrl(reg.picture_url || null)
        setRegCourse(reg.courses || null)
        setRegEnroll({ campus: reg.campus, city: reg.city })
      }
      setLoading(false)
    }
    load()
  }, [dispatch, user])

  // Prefer enrollment course over registration course
  const enrollment = enrollments[0]
  const course     = enrollment?.courses || regCourse
  const enroll     = enrollment || regEnroll
  const student    = { ...user, picture_url: pictureUrl }

  return (
    <StudentLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My ID Card</h1>
          <p className="text-sm text-gray-400 mt-1">Download and present this card for QR attendance</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            Loading your ID card...
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex justify-center">
              <StudentCard student={student} course={course} enrollment={enroll} />
            </div>

            {/* Roll number highlight */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Roll Number</p>
                  <p className="text-2xl font-extrabold mt-1" style={{ color:'#0B73B7' }}>{user?.roll_number || '—'}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(user?.roll_number || ''); }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background:'#0B73B7', color:'#fff' }}>
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-700 text-sm mb-2">How to use your ID Card</p>
              <p>• Download and save your ID card image</p>
              <p>• Show the QR code to your teacher/admin for attendance</p>
              <p>• The QR code contains your unique student information</p>
              <p>• Each scan marks you present for today's class</p>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  )
}
