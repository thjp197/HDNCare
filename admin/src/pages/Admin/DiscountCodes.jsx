import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'

const DiscountCodes = () => {
  const { aToken, discountCodes, getAllDiscountCodes, addDiscountCode, updateDiscountCode, deleteDiscountCode } = useContext(AdminContext)
  
  const [showModal, setShowModal] = useState(false)
  const [editingCode, setEditingCode] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiryDate: '',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (aToken) {
      getAllDiscountCodes()
    }
  }, [aToken])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleOpenModal = (code = null) => {
    if (code) {
      setEditingCode(code)
      setFormData({
        code: code.code,
        description: code.description,
        discountType: code.discountType,
        discountValue: code.discountValue,
        maxUses: code.maxUses || '',
        expiryDate: code.expiryDate ? code.expiryDate.split('T')[0] : '',
        isActive: code.isActive
      })
    } else {
      setEditingCode(null)
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        expiryDate: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCode(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.code || !formData.discountValue) {
      toast.error('Vui lòng nhập các trường bắt buộc')
      return
    }

    setIsSubmitting(true)
    let result

    if (editingCode) {
      result = await updateDiscountCode({
        discountCodeId: editingCode._id,
        ...formData
      })
    } else {
      result = await addDiscountCode(formData)
    }

    if (result?.success) {
      handleCloseModal()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (codeId) => {
    if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      await deleteDiscountCode(codeId)
    }
  }

  return (
    <div className='w-full p-4 sm:p-5'>
      <p className='mb-6 text-lg font-medium font-sans'>Quản Lý Mã Giảm Giá</p>

      <button
        onClick={() => handleOpenModal()}
        className='mb-6 rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100'
      >
        + Thêm Mã Giảm Giá
      </button>

      <div className='overflow-x-auto rounded border bg-white text-sm'>
        <div className='grid min-w-[860px] grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] items-center gap-3 border-b bg-gray-50 px-5 py-3 font-semibold text-gray-700'>
          <p>Mã Giảm Giá</p>
          <p>Loại Giảm</p>
          <p>Giá Trị</p>
          <p>Lượt Sử Dụng</p>
          <p>Hạn</p>
          <p>Trạng Thái</p>
          <p>Hành Động</p>
        </div>

        {discountCodes.map((code) => (
          <div
            key={code._id}
            className='grid min-w-[860px] grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] items-center gap-3 border-b px-5 py-3 text-gray-600 hover:bg-gray-50'
          >
            <p className='font-medium text-gray-800'>{code.code}</p>
            <p>{code.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</p>
            <p>
              {code.discountValue}
              {code.discountType === 'percentage' ? '%' : ' VND'}
            </p>
            <p>
              {code.usedCount}
              {code.maxUses ? `/${code.maxUses}` : ''}
            </p>
            <p>
              {code.expiryDate
                ? new Date(code.expiryDate).toLocaleDateString('vi-VN')
                : 'Không giới hạn'}
            </p>
            <p>
              {code.isActive ? (
                <span className='rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                  Kích hoạt
                </span>
              ) : (
                <span className='rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'>
                  Vô hiệu
                </span>
              )}
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => handleOpenModal(code)}
                className='rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100'
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(code._id)}
                className='rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100'
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {!discountCodes.length && (
          <p className='px-5 py-8 text-center text-gray-500'>Chưa có mã giảm giá nào.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6'>
            <h2 className='mb-4 text-xl font-bold text-gray-800'>
              {editingCode ? 'Chỉnh Sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá'}
            </h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>Mã Giảm Giá *</label>
                  <input
                    type='text'
                    name='code'
                    value={formData.code}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                    placeholder='VD: SUMMER2024'
                    disabled={editingCode}
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>Loại Giảm *</label>
                  <select
                    name='discountType'
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                  >
                    <option value='percentage'>Phần trăm (%)</option>
                    <option value='fixed'>Cố định (VND)</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Giá Trị Giảm *
                  </label>
                  <input
                    type='number'
                    name='discountValue'
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                    placeholder='Nhập giá trị'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>Lượt Sử Dụng Tối Đa</label>
                  <input
                    type='number'
                    name='maxUses'
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                    placeholder='(Để trống = không giới hạn)'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>Hạn Hết Hạn</label>
                  <input
                    type='date'
                    name='expiryDate'
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                  />
                </div>

                <div className='flex items-center'>
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      name='isActive'
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className='h-4 w-4 rounded border-gray-300 accent-primary'
                    />
                    <span className='text-sm font-medium text-gray-700'>Kích hoạt</span>
                  </label>
                </div>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>Mô Tả</label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none'
                  placeholder='Mô tả mã giảm giá'
                  rows='3'
                />
              </div>

              <div className='flex flex-col justify-end gap-3 pt-4 sm:flex-row'>
                <button
                  type='button'
                  onClick={handleCloseModal}
                  className='rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition hover:bg-gray-300'
                >
                  Đóng
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='rounded-md bg-primary px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Đang xử lý...' : editingCode ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountCodes
