import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate, useSearchParams } from 'react-router-dom'

const quickAmounts = [50000, 100000, 200000]

const MyWallet = () => {
  const { backendUrl, token, userData, loadUserProfileData } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(100000)
  const [withdrawAmount, setWithdrawAmount] = useState(100000)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    bankName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const handledTopupRef = useRef(new Set())
  const [walletData, setWalletData] = useState({
    walletBalance: 0,
    walletTransactions: [],
  })

  const walletTransactions = useMemo(() => {
    const transactions = Array.isArray(walletData?.walletTransactions) ? [...walletData.walletTransactions] : []
    return transactions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [walletData?.walletTransactions])

  const loadWalletData = async () => {
    try {
      if (!token) return
      setPageError('')
      setIsPageLoading(true)

      const { data } = await axios.get(
        backendUrl + '/api/user/wallet',
        { headers: { token } },
      )

      if (data.success) {
        setWalletData({
          walletBalance: Number(data.walletBalance || 0),
          walletTransactions: Array.isArray(data.walletTransactions) ? data.walletTransactions : [],
        })
      } else {
        setPageError(data.message || 'Không thể tải dữ liệu ví')
      }
    } catch (error) {
      console.log(error)
      setPageError(error.message || 'Không thể tải dữ liệu ví')
    } finally {
      setIsPageLoading(false)
    }
  }

  const startTopup = async () => {
    try {
      if (!token) {
        toast.warn('Vui lòng đăng nhập để nạp ví')
        return
      }

      const numericAmount = Number(amount)
      if (!Number.isFinite(numericAmount) || numericAmount < 10000) {
        toast.error('Số tiền nạp tối thiểu là 10.000 VND')
        return
      }

      setIsLoading(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/wallet/create-topup-url',
        { amount: numericAmount },
        { headers: { token } },
      )

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.message || 'Không thể tạo yêu cầu nạp ví')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Không thể tạo yêu cầu nạp ví')
    } finally {
      setIsLoading(false)
    }
  }

  const startWithdraw = async () => {
    try {
      if (!token) {
        toast.warn('Vui lòng đăng nhập để rút tiền')
        return
      }

      const numericAmount = Number(withdrawAmount)
      if (!Number.isFinite(numericAmount) || numericAmount < 10000) {
        toast.error('Số tiền rút tối thiểu là 10.000 VND')
        return
      }

      if (!withdrawForm.cardHolderName || !withdrawForm.cardNumber || !withdrawForm.bankName) {
        toast.error('Vui lòng nhập đầy đủ thông tin thẻ')
        return
      }

      setIsWithdrawing(true)

      const { data } = await axios.post(
        backendUrl + '/api/user/wallet/withdraw',
        {
          amount: numericAmount,
          cardHolderName: withdrawForm.cardHolderName,
          cardNumber: withdrawForm.cardNumber,
          bankName: withdrawForm.bankName,
        },
        { headers: { token } },
      )

      if (data.success) {
        toast.success(data.message || 'Rút tiền thành công')
        await loadUserProfileData()
        await loadWalletData()
        setShowWithdrawForm(false)
        setWithdrawForm({ cardHolderName: '', cardNumber: '', bankName: '' })
      } else {
        toast.error(data.message || 'Không thể rút tiền')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Không thể rút tiền')
    } finally {
      setIsWithdrawing(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadWalletData()
  }, [backendUrl, navigate, token])

  useEffect(() => {
    if (!token) return

    const vnpResponseCode = searchParams.get('vnp_ResponseCode')
    const walletRef = searchParams.get('vnp_TxnRef')
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo')
    const verifyKey = `${walletRef || ''}:${vnpTransactionNo || ''}`

    if (vnpResponseCode === '00' && walletRef) {
      // Guard duplicate effect runs so the same VNPay return is verified only once.
      if (handledTopupRef.current.has(verifyKey)) return
      handledTopupRef.current.add(verifyKey)

      const verifyTopup = async () => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/wallet/verify-topup',
            {
              walletRef,
              vnp_TransactionNo: vnpTransactionNo || null,
            },
            { headers: { token } },
          )

          if (data.success) {
            toast.success(data.message || 'Nạp ví thành công')
            await loadUserProfileData()
            await loadWalletData()
            navigate('/my-wallet', { replace: true })
          } else {
            toast.error(data.message || 'Không thể xác nhận nạp ví')
            handledTopupRef.current.delete(verifyKey)
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message || 'Không thể xác nhận nạp ví')
          handledTopupRef.current.delete(verifyKey)
        }
      }

      verifyTopup()
    }
  }, [backendUrl, loadUserProfileData, navigate, searchParams, token])

  if (isPageLoading) {
    return (
      <div className='mx-4 sm:mx-[10%] my-8'>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-gray-600'>
          Đang tải dữ liệu ví...
        </div>
      </div>
    )
  }

  return (
    <div className='mx-4 sm:mx-[10%] my-8'>
      <div className='rounded-3xl bg-gradient-to-r from-rose-50 via-white to-amber-50 border border-rose-100 p-6 shadow-sm'>
        <p className='text-3xl font-bold text-rose-700'>Ví của tôi</p>
        <h1 className='mt-1 text-lg font-medium text-gray-700'>Quản lý số dư</h1>
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          <p className='text-sm font-medium text-gray-500'>Số dư hiện tại</p>
          <p className='mt-2 text-4xl font-bold text-gray-900'>
            {(walletData?.walletBalance || 0).toLocaleString('vi-VN')} VND
          </p>

          {!!pageError && (
            <p className='mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>
              {pageError}
            </p>
          )}

          <div className='mt-6'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Số tiền nạp</label>
            <input
              type='number'
              min='10000'
              step='1000'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary'
            />
            <div className='mt-3 flex flex-wrap gap-2'>
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => setAmount(value)}
                  className='rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50'
                >
                  {value.toLocaleString('vi-VN')} VND
                </button>
              ))}
            </div>
            <button
              onClick={startTopup}
              disabled={isLoading}
              className='mt-5 w-full rounded-xl bg-primary px-5 py-3 text-white font-medium disabled:opacity-60'
            >
              {isLoading ? 'Đang chuyển sang VNPay...' : 'Nạp tiền bằng VNPay'}
            </button>

            <button
              type='button'
              onClick={() => setShowWithdrawForm((prev) => !prev)}
              className='mt-3 w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-800 font-medium hover:bg-gray-50'
            >
              {showWithdrawForm ? 'Ẩn form rút tiền' : 'Rút tiền'}
            </button>

            {showWithdrawForm && (
              <div className='mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4'>
                <p className='text-sm font-semibold text-amber-800'>Thông tin rút tiền về thẻ</p>
                <p className='mt-1 text-xs text-amber-700'>Hệ thống sẽ trừ số dư ví và lưu lịch sử giao dịch.</p>

                <div className='mt-3 space-y-3'>
                  <input
                    type='number'
                    min='10000'
                    step='1000'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder='Số tiền rút'
                    className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary'
                  />
                  <input
                    type='text'
                    value={withdrawForm.cardHolderName}
                    onChange={(e) => setWithdrawForm((prev) => ({ ...prev, cardHolderName: e.target.value }))}
                    placeholder='Tên chủ thẻ'
                    className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary'
                  />
                  <input
                    type='text'
                    value={withdrawForm.cardNumber}
                    onChange={(e) => setWithdrawForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder='Số thẻ'
                    className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary'
                  />
                  <input
                    type='text'
                    value={withdrawForm.bankName}
                    onChange={(e) => setWithdrawForm((prev) => ({ ...prev, bankName: e.target.value }))}
                    placeholder='Ngân hàng'
                    className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary'
                  />

                  <button
                    type='button'
                    onClick={startWithdraw}
                    disabled={isWithdrawing}
                    className='w-full rounded-xl bg-amber-600 px-5 py-3 text-white font-medium disabled:opacity-60'
                  >
                    {isWithdrawing ? 'Đang xử lý rút tiền...' : 'Xác nhận rút tiền'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
          <p className='text-lg font-semibold text-gray-800'>Tóm tắt ví</p>
          <div className='mt-4 space-y-3 text-sm text-gray-600'>
            <div className='flex justify-between rounded-xl bg-gray-50 px-4 py-3'>
              <span>Số dư khả dụng</span>
              <span className='font-semibold text-gray-900'>{(walletData?.walletBalance || 0).toLocaleString('vi-VN')} VND</span>
            </div>
            <div className='flex justify-between rounded-xl bg-gray-50 px-4 py-3'>
              <span>Số giao dịch</span>
              <span className='font-semibold text-gray-900'>{walletTransactions.length}</span>
            </div>
          </div>

          <p className='mt-6 text-lg font-semibold text-gray-800'>Lịch sử hoạt động</p>
          <div className='mt-3 max-h-[420px] space-y-3 overflow-y-auto pr-1'>
            {walletTransactions.length > 0 ? walletTransactions.map((item, index) => {
              const isIncoming = Number(item.amount || 0) > 0
              return (
                <div key={item.reference || index} className='rounded-xl border border-gray-100 px-4 py-3'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='font-medium text-gray-800'>{item.description || 'Giao dịch ví'}</p>
                      <p className='mt-1 text-xs text-gray-500'>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <div className={`text-sm font-semibold ${isIncoming ? 'text-green-600' : 'text-rose-600'}`}>
                      {isIncoming ? '+' : ''}{Number(item.amount || 0).toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                  <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
                    <span>
                      {item.type === 'topup'
                        ? 'Nạp tiền'
                        : item.type === 'withdrawal'
                          ? 'Rút tiền'
                          : 'Thanh toán lịch hẹn'}
                    </span>
                    <span>{item.status === 'success' ? 'Thành công' : item.status === 'pending' ? 'Đang chờ' : 'Thất bại'}</span>
                  </div>
                </div>
              )
            }) : (
              <p className='text-sm text-gray-500'>Chưa có lịch sử giao dịch.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyWallet
