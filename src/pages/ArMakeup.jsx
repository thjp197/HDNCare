import { useMemo, useState } from 'react'

const ArMakeup = () => {
  const [hasLoadError, setHasLoadError] = useState(false)

  const filterUrl = useMemo(
    () => import.meta.env.VITE_AR_URL || '/filter/index.html',
    []
  )

  return (
    <section className='my-6'>
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold text-center text-gray-800'>AR Makeup</h1>
        <p className='mt-1 text-md text-center font-semibold italic text-gray-600'>
            "Lưu giữ phong cách, kết nối chuyên gia: Hãy tự tay thiết kế diện mạo bạn yêu thích và chia sẻ trực tiếp với stylist để mỗi liệu trình làm đẹp đều trở nên thấu hiểu và hoàn hảo."        </p>
      </div>

      {hasLoadError && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          Không thể tải AR Makeup từ {filterUrl}. Hãy kiểm tra thư mục public/filter và thử tải lại trang.
        </div>
      )}

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <iframe
          title='AR Makeup Filter'
          src={filterUrl}
          className='h-[78vh] w-full'
          onError={() => setHasLoadError(true)}
        />
      </div>
    </section>
  )
}

export default ArMakeup