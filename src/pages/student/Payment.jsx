import { useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'

const B = '#0B73B7'

export default function StudentPayment() {
  const { user } = useSelector(s => s.auth)

  return (
    <StudentLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Payment</h1>

        {/* SMIT is free notice */}
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

        {/* Fee status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50" style={{ background:'linear-gradient(135deg,#e8f4fc,#fff)' }}>
            <p className="font-bold text-gray-800">Fee Status</p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { month:'January 2026',  status:'paid',    amount:'Free' },
              { month:'February 2026', status:'paid',    amount:'Free' },
              { month:'March 2026',    status:'paid',    amount:'Free' },
              { month:'April 2026',    status:'current', amount:'Free' },
            ].map(row => (
              <div key={row.month} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{row.month}</p>
                  <p className="text-xs text-gray-400">Course Fee</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">{row.amount}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize
                    ${row.status==='paid'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>
                    {row.status==='paid' ? '✓ Paid' : 'Current'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl text-xs text-gray-500 leading-relaxed" style={{ background:'#f8fafc' }}>
          <strong>Note:</strong> SMIT courses are funded by Saylani Welfare International Trust. Students are required to maintain good attendance and complete all assignments to continue their enrollment.
        </div>
      </div>
    </StudentLayout>
  )
}
