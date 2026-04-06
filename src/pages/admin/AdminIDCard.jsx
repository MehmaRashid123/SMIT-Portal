import { useSelector } from 'react-redux'
import AdminLayout from '../../components/AdminLayout'
import AdminCard from '../../components/AdminCard'

export default function AdminIDCard() {
  const { user } = useSelector(s => s.auth)
  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Admin Card</h1>
          <p className="text-sm text-gray-400 mt-1">Your official SMIT admin identification card</p>
        </div>
        <div className="flex justify-center">
          <AdminCard admin={user} />
        </div>
        <div className="mt-8 bg-purple-50 rounded-2xl p-5 border border-purple-100">
          <p className="font-bold text-purple-800 text-sm mb-2">Admin Card Info</p>
          <ul className="text-xs text-purple-700 space-y-1.5">
            <li>• This card identifies you as a SMIT system administrator</li>
            <li>• The QR code contains your admin credentials</li>
            <li>• Keep this card confidential and secure</li>
            <li>• Download and store safely for official use</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
