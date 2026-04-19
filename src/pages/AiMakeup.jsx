import axios from 'axios'
import { useContext, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const AiMakeup = () => {
  const [hasLoadError, setHasLoadError] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const iframeRef = useRef(null)
  const navigate = useNavigate()
  const { token, setUserData, backendUrl } = useContext(AppContext)

  const filterUrl = useMemo(
    () => import.meta.env.VITE_AI_URL || import.meta.env.VITE_AR_URL || '/filter/index.html',
    []
  )

  const getCompressedCanvasBlob = async (canvas) => {
    const maxWidth = 1280
    const scale = canvas.width > maxWidth ? maxWidth / canvas.width : 1
    const targetWidth = Math.floor(canvas.width * scale)
    const targetHeight = Math.floor(canvas.height * scale)

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = targetWidth
    exportCanvas.height = targetHeight

    const ctx = exportCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)

    return await new Promise((resolve) => {
      exportCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
    })
  }

  const saveCurrentMakeupImage = async () => {
    if (!token) {
      toast.warn('Vui lòng đăng nhập để lưu ảnh')
      navigate('/login')
      return
    }

    try {
      setIsSavingImage(true)

      const canvas = iframeRef.current?.contentWindow?.document?.querySelector('canvas')

      if (!canvas) {
        toast.error('Không tìm thấy khung preview makeup để chụp ảnh')
        return
      }

      const imageBlob = await getCompressedCanvasBlob(canvas)

      if (!imageBlob) {
        toast.error('Không thể trích xuất ảnh từ preview')
        return
      }

      const formData = new FormData()
      formData.append('action', 'add')
      formData.append('image', imageBlob, `ai-makeup-${Date.now()}.jpg`)

      const { data: result } = await axios.patch(
        backendUrl + '/api/users/personal-images',
        formData,
        { headers: { token } }
      )

      if (result.success && Array.isArray(result.personalImages)) {
        setUserData((prev) => (prev ? { ...prev, personalImages: result.personalImages } : prev))
      }

      if (result.success) {
        toast.success('Đã lưu hình ảnh vào thư viện cá nhân')
      } else {
        toast.error(result.message || 'Không thể lưu hình ảnh')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSavingImage(false)
    }
  }

  return (
    <section className='my-6'>
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold text-center text-gray-800'>AI Makeup</h1>
        <p className='mt-1 text-md text-center font-semibold italic text-gray-600'>
            "Lưu giữ phong cách, kết nối chuyên gia: Hãy tự tay thiết kế diện mạo bạn yêu thích và chia sẻ trực tiếp với stylist để mỗi liệu trình làm đẹp đều trở nên thấu hiểu và hoàn hảo."        </p>
      </div>

      {hasLoadError && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          Không thể tải AI Makeup từ {filterUrl}. Hãy kiểm tra thư mục public/filter và thử tải lại trang.
        </div>
      )}

      <div className='relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <iframe
          ref={iframeRef}
          title='AI Makeup Filter'
          src={filterUrl}
          className='h-[78vh] w-full'
          onError={() => setHasLoadError(true)}
        />

        <button
          onClick={saveCurrentMakeupImage}
          disabled={isSavingImage}
          className='absolute bottom-4 right-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSavingImage ? 'Đang lưu...' : 'Lưu hình ảnh'}
        </button>
      </div>
    </section>
  )
}

export default AiMakeup