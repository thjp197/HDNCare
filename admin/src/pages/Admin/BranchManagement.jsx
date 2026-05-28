import { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const BranchManagement = () => {
  const { aToken, backendUrl, branchesInfo, getBranchesInfo, assignBranch, assignBranchManager, removeBranchManager } = useContext(AdminContext)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedStylistForBranch, setSelectedStylistForBranch] = useState({})
  const [allStylists, setAllStylists] = useState([])
  const [loading, setLoading] = useState(false)

  const branches = [
    { id: 'Chi nhánh 1', name: 'Chi nhánh 1', location: 'Gò Vấp' },
    { id: 'Chi nhánh 2', name: 'Chi nhánh 2', location: 'Bình Thạnh' },
    { id: 'Chi nhánh 3', name: 'Chi nhánh 3', location: 'Quận 7' },
  ]

  useEffect(() => {
    if (aToken) {
      getBranchesInfo()
      getAllUnassignedStylists()
    } else {
      toast.error('Vui lòng đăng nhập lại')
    }
  }, [aToken])

  const getAllUnassignedStylists = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/admin/all-stylists', {}, { headers: { aToken } })
      if (data.success) {
        setAllStylists(data.stylists || [])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleAddStylistToBranch = async (stylistId) => {
    if (!selectedBranch) {
      toast.error('Vui lòng chọn chi nhánh')
      return
    }

    setLoading(true)
    const result = await assignBranch(stylistId, selectedBranch)
    setLoading(false)

    if (result.success) {
      setSelectedStylistForBranch(prev => {
        const updated = { ...prev }
        delete updated[selectedBranch]
        return updated
      })
    }
  }

  const handleAssignManager = async (stylistId) => {
    if (!selectedBranch) {
      toast.error('Vui lòng chọn chi nhánh')
      return
    }

    setLoading(true)
    const result = await assignBranchManager(stylistId, selectedBranch)
    setLoading(false)
  }

  const handleRemoveManager = async (stylistId) => {
    setLoading(true)
    const result = await removeBranchManager(stylistId)
    setLoading(false)
  }

  const getUnassignedStylists = () => {
    return allStylists.filter(stylist => !stylist.branch)
  }

  const currentBranchInfo = branchesInfo && branchesInfo.length > 0
    ? branchesInfo.find(b => b.name === selectedBranch)
    : null

  return (
    <div className='max-h-[90vh] overflow-y-auto p-4 font-sans sm:p-5'>
      <h1 className='mb-6 text-xl font-bold sm:text-2xl'>Quản lý Chi nhánh</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8'>
        {branches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedBranch === branch.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className='text-lg font-semibold'>{branch.name}</h3>
            <p className='text-gray-600 text-sm'>{branch.location}</p>
            <p className='text-gray-500 text-sm mt-2'>
              {currentBranchInfo && branchesInfo.find(b => b.name === branch.id) && branchesInfo.find(b => b.name === branch.id).stylistCount} nhân viên
            </p>
          </div>
        ))}
      </div>

      {selectedBranch && currentBranchInfo && (
        <div className='rounded-lg bg-white p-4 shadow-lg sm:p-6'>
          <h2 className='text-xl font-bold mb-4'>{selectedBranch} - Chi tiết</h2>

          {/* Current Manager Section */}
          <div className='mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
            <h3 className='text-lg font-semibold mb-2'>Trưởng Chi nhánh</h3>
            {currentBranchInfo.manager ? (
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='font-semibold'>{currentBranchInfo.manager.name}</p>
                  <p className='text-sm text-gray-600'>{currentBranchInfo.manager.speciality}</p>
                  <p className='text-sm text-gray-600'>Kinh nghiệm: {currentBranchInfo.manager.experience}</p>
                </div>
                <button
                  onClick={() => handleRemoveManager(currentBranchInfo.manager._id)}
                  disabled={loading}
                  className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400'
                >
                  Xóa quyền
                </button>
              </div>
            ) : (
              <p className='text-gray-600'>Chưa có trưởng chi nhánh</p>
            )}
          </div>

          {/* Current Stylists Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-3'>Danh sách Nhân viên trong Chi nhánh</h3>
            {currentBranchInfo.stylists && currentBranchInfo.stylists.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {currentBranchInfo.stylists.map((stylist) => (
                  <div
                    key={stylist._id}
                    className='flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='font-semibold'>{stylist.name}</p>
                      <p className='text-sm text-gray-600'>{stylist.speciality}</p>
                      <p className='text-sm text-gray-600'>Kinh nghiệm: {stylist.experience}</p>
                      {stylist.isBranchManager && (
                        <span className='inline-block mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded'>
                          Trưởng Chi nhánh
                        </span>
                      )}
                    </div>
                    {!stylist.isBranchManager && (
                      <button
                        onClick={() => handleAssignManager(stylist._id)}
                        disabled={loading}
                        className='px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400'
                      >
                        Gán quản lý
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-600'>Chưa có nhân viên trong chi nhánh này</p>
            )}
          </div>

          {/* Add Stylist Section */}
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <h3 className='text-lg font-semibold mb-3'>Thêm Nhân viên vào Chi nhánh</h3>
            {getUnassignedStylists().length > 0 ? (
              <div className='space-y-2'>
                {getUnassignedStylists().map((stylist) => (
                  <div
                    key={stylist._id}
                    className='flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='font-semibold'>{stylist.name}</p>
                      <p className='text-sm text-gray-600'>{stylist.speciality}</p>
                    </div>
                    <button
                      onClick={() => handleAddStylistToBranch(stylist._id)}
                      disabled={loading}
                      className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400'
                    >
                      Thêm vào
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-600'>Không có nhân viên chưa được gán chi nhánh</p>
            )}
          </div>
        </div>
      )}

      {!selectedBranch && (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-lg'>Vui lòng chọn một chi nhánh để bắt đầu</p>
        </div>
      )}
    </div>
  )
}

export default BranchManagement
