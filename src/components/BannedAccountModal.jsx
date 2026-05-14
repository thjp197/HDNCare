import React from 'react'
import { useNavigate } from 'react-router-dom'

const BannedAccountModal = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate()

  const handleClose = () => {
    if (onLogout) {
      onLogout()
    }
    onClose()
    navigate('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tài Khoản Đã Bị Khóa</h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              Tài khoản của bạn đã bị khóa do vi phạm chính sách hủy lịch <span className="font-bold text-red-600">5 lần</span> hoặc hơn.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-4">
              Vui lòng <span className="font-semibold">liên hệ quản trị viên</span> để giải quyết vấn đề này.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-900 text-sm font-medium">📞 Hỗ trợ khách hàng: 0567 276 276</p>
              <p className="text-blue-900 text-sm">📧 Email: hdncare@gmail.com</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-all"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  )
}

export default BannedAccountModal
