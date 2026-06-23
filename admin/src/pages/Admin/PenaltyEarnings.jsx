import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const PenaltyEarnings = () => {
  const { aToken, penaltyEarningsData, penaltyStats, getPenaltyEarnings } = useContext(AdminContext)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    search: '',
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  useEffect(() => {
    if (aToken) {
      handleLoadData()
    }
  }, [aToken])

  const handleLoadData = async () => {
    setIsLoading(true)
    try {
      const filterParams = {
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
      }
      await getPenaltyEarnings(filterParams)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApplyFilter = () => {
    const filterParams = {
      ...filters,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      search: filters.search || undefined,
    }
    getPenaltyEarnings(filterParams)
    setShowFilterPanel(false)
  }

  const handleResetFilter = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      search: '',
    })
    getPenaltyEarnings()
    setShowFilterPanel(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const filterParams = {
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
      }
      await getPenaltyEarnings(filterParams)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + ' VND'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
  }

  return (
    <div className='w-full p-4 sm:p-5'>
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <p className='text-lg font-medium font-sans'>Quản lý tiền phạt hủy lịch</p>
        <div className='flex gap-2'>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className='flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 whitespace-nowrap'
            title='Bộ lọc'
          >
            <svg
              className='h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            <span>Bộ lọc</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap'
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
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className='mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-4 font-semibold text-gray-800'>Tùy chọn lọc</h3>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>Từ ngày</label>
              <input
                type='date'
                name='dateFrom'
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>Đến ngày</label>
              <input
                type='date'
                name='dateTo'
                value={filters.dateTo}
                onChange={handleFilterChange}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none'
              />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>Tìm kiếm (tên/email/SĐT)</label>
              <input
                type='text'
                name='search'
                placeholder='Nhập tên, email hoặc số điện thoại'
                value={filters.search}
                onChange={handleFilterChange}
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none'
              />
            </div>
          </div>
          <div className='mt-4 flex gap-2'>
            <button
              onClick={handleApplyFilter}
              className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90'
            >
              Áp dụng
            </button>
            <button
              onClick={handleResetFilter}
              className='rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-400'
            >
              Đặt lại
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className='mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          <p className='text-xs font-medium text-gray-600 uppercase'>Tổng lần phạt</p>
          <p className='mt-2 text-2xl font-bold text-gray-800'>{penaltyStats.totalPenalizations || 0}</p>
        </div>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <p className='text-xs font-medium text-red-600 uppercase'>Tổng tiền phạt</p>
          <p className='mt-2 text-xl font-bold text-red-700'>{formatCurrency(penaltyStats.totalPenaltyAmount || 0)}</p>
        </div>
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <p className='text-xs font-medium text-blue-600 uppercase'>Tổng hoàn lại</p>
          <p className='mt-2 text-xl font-bold text-blue-700'>{formatCurrency(penaltyStats.totalRefundAmount || 0)}</p>
        </div>
      </div>

      {/* Penalty List */}
      <div className='overflow-x-auto rounded border bg-white text-sm'>
        <div className='grid min-w-[1100px] grid-cols-[2fr_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-3 border-b bg-gray-50 px-5 py-3 font-semibold text-gray-700'>
          <p>Người dùng</p>
          <p>Chuyên gia</p>
          <p>Ngày đặt lịch</p>
          <p>Tiền phạt</p>
          <p>Tiền hoàn lại</p>
          <p>Thời gian phạt</p>
          <p>Hành động</p>
        </div>

        {isLoading ? (
          <div className='px-5 py-8 text-center text-gray-500'>
            <div className='flex items-center justify-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : penaltyEarningsData.length > 0 ? (
          penaltyEarningsData.map((item) => (
            <div
              key={item._id}
              className='grid min-w-[1100px] grid-cols-[2fr_2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-3 border-b px-5 py-3 text-gray-600 hover:bg-gray-50'
            >
              <div>
                <p className='font-medium text-gray-800'>{item.userName}</p>
                <p className='text-xs text-gray-500'>{item.userEmail}</p>
              </div>
              <p className='text-gray-800'>{item.stylistName}</p>
              <p className='text-xs'>
                {item.slotDate && item.slotTime ? `${item.slotDate} ${item.slotTime}` : 'N/A'}
              </p>
              <p className='font-semibold text-red-600'>{formatCurrency(item.penaltyAmount)}</p>
              <p className='font-semibold text-blue-600'>{formatCurrency(item.refundAmount)}</p>
              <p className='text-xs text-gray-600'>{formatDate(item.penalizedAt).split(' ')[0]}</p>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => {
                    const details = `Khách hàng: ${item.userName}\nEmail: ${item.userEmail}\nSĐT: ${item.userPhone}\nChuyên gia: ${item.stylistName}\nNgày đặt lịch: ${item.slotDate} ${item.slotTime}\nSố tiền thanh toán: ${formatCurrency(item.paidAmount)}\nPhạt 20%: ${formatCurrency(item.penaltyAmount)}\nHoàn 80%: ${formatCurrency(item.refundAmount)}\nThời gian phạt: ${formatDate(item.penalizedAt)}`
                    alert(details)
                  }}
                  className='rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100'
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className='px-5 py-8 text-center text-gray-500'>Chưa có lịch sử phạt nào.</p>
        )}
      </div>
    </div>
  )
}

export default PenaltyEarnings
