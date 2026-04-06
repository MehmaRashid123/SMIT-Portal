import { useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'

const B = '#0B73B7'

export default function StudentPayment() {
  const { user } = useSelector(s => s.auth)

  return (
    <StudentLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Payment</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'#e8faf4' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">SMIT Education is Free!</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            All courses at Saylani Mass IT Training are completely free of cost for deserving students. No fees, no hidden charges.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background:'#e8f4fc' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <p className="font-bold text-gray-800 mb-1">No Payment Required</p>
          <p className="text-sm text-gray-400">Your enrollment is fully sponsored by Saylani Welfare International Trust.</p>
        </div>

        <div className="mt-4 p-4 rounded-2xl text-xs text-gray-500 leading-relaxed" style={{ background:'#f8fafc' }}>
          <strong>Note:</strong> Students are required to maintain good attendance and complete all assignments to continue enrollment.
        </div>
      </div>
    </StudentLayout>
  )
}
