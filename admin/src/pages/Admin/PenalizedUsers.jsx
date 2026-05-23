import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const PenalizedUsers = () => {
  const { aToken, penalizedUsers, getPenalizedUsers, resetUserPenalty, updateUserPenalty } = useContext(AdminContext)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editedPenaltyCount, setEditedPenaltyCount] = useState('0')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (aToken) {
      getPenalizedUsers()
    }
  }, [aToken])

  const openEditModal = (user) => {
    setSelectedUser(user)
    setEditedPenaltyCount(String(user.penaltyCount || 0))
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setSelectedUser(null)
    setEditedPenaltyCount('0')
    setEditModalOpen(false)
  }

  const handleUpdatePenalty = async () => {
    if (!selectedUser?._id) return

    if (!/^\d+$/.test(editedPenaltyCount)) {
      return
    }

    const parsedValue = Number(editedPenaltyCount)
    if (!Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 5) {
      return
    }

    const result = await updateUserPenalty(selectedUser._id, parsedValue)
    if (result?.success) {
      closeEditModal()
    }
  }

  const handleResetUserPenalty = async (userId) => {
    const accepted = window.confirm('Bạn có chắc muốn tạo lại tài khoản này? Hệ thống sẽ mở khóa và đặt số lần phạt về 0.')
    if (!accepted) return

    await resetUserPenalty(userId)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await getPenalizedUsers()
    } finally {
      setIsRefreshing(false)
    }
  }

  const increasePenaltyCount = () => {
    const currentValue = Number(editedPenaltyCount || 0)
    const nextValue = Math.min(5, currentValue + 1)
    setEditedPenaltyCount(String(nextValue))
  }

  const decreasePenaltyCount = () => {
    const currentValue = Number(editedPenaltyCount || 0)
    const nextValue = Math.max(0, currentValue - 1)
    setEditedPenaltyCount(String(nextValue))
  }

  return (
    <div className='m-5 w-full'>
      <div className='mb-3 flex items-center gap-3'>
        <p className='text-lg font-medium font-sans'>Tài khoản bị phạt</p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className='flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap'
          title='Làm mới dữ liệu'
        >
          <svg
            className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
            />
          </svg>
          <span className='hidden sm:inline'>{isRefreshing ? 'Đang làm...' : 'Làm mới'}</span>
        </button>
      </div>

      <div className='overflow-x-auto rounded border bg-white text-sm'>
        <div className='grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_2fr] items-center gap-3 border-b bg-gray-50 px-5 py-3 font-semibold text-gray-700'>
          <p>Người dùng</p>
          <p>Email</p>
          <p>Số điện thoại</p>
          <p>Số lần phạt</p>
          <p>Trạng thái</p>
          <p>Hành động</p>
        </div>

        {penalizedUsers.map((user) => (
          <div
            key={user._id}
            className='grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_2fr] items-center gap-3 border-b px-5 py-3 text-gray-600 hover:bg-gray-50'
          >
            <p className='font-medium text-gray-800'>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.phone || 'Chưa cập nhật'}</p>
            <p className='font-semibold text-red-600'>{user.penaltyCount}</p>
            <p>
              {user.isBanned ? (
                <span className='rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'>
                  Đã khóa tài khoản
                </span>
              ) : (
                <span className='rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'>
                  Đang theo dõi
                </span>
              )}
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => openEditModal(user)}
                className='rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100'
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleResetUserPenalty(user._id)}
                className='rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100'
              >
                Tạo lại tài khoản
              </button>
            </div>
          </div>
        ))}

        {!penalizedUsers.length && (
          <p className='px-5 py-8 text-center text-gray-500'>Chưa có tài khoản nào bị phạt.</p>
        )}
      </div>

      {editModalOpen && selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h2 className='mb-2 text-xl font-bold text-gray-800'>Chỉnh sửa số lần phạt</h2>
            <p className='mb-4 text-sm text-gray-600'>
              Người dùng: <span className='font-semibold text-gray-800'>{selectedUser.name}</span>
            </p>

            <label className='mb-2 block text-sm font-medium text-gray-700'>Số lần phạt</label>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={decreasePenaltyCount}
                className='rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100'
              >
                -1
              </button>

              <input
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={1}
                value={editedPenaltyCount}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  let nextValue = event.target.value

                  if (nextValue.length > 1) {
                    nextValue = nextValue.slice(-1)
                  }

                  if (!/^\d*$/.test(nextValue)) {
                    return
                  }

                  if (nextValue === '') {
                    setEditedPenaltyCount('')
                    return
                  }

                  const numericValue = Number(nextValue)
                  if (numericValue < 0 || numericValue > 5) {
                    return
                  }

                  setEditedPenaltyCount(nextValue)
                }}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-center focus:border-primary focus:outline-none'
              />

              <button
                type='button'
                onClick={increasePenaltyCount}
                className='rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100'
              >
                +1
              </button>
            </div>

            <p className='mt-2 text-xs text-gray-500'>
              Chỉ được nhập từ 0 đến 5. Nếu nhập 5, tài khoản sẽ bị khóa. Nếu nhập 0, tài khoản sẽ không còn trong danh sách bị phạt.
            </p>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={closeEditModal}
                className='rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300'
              >
                Đóng
              </button>
              <button
                onClick={handleUpdatePenalty}
                className='rounded-md bg-primary px-4 py-2 text-white transition hover:opacity-90'
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PenalizedUsers
