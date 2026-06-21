import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import BannedAccountModal from './BannedAccountModal'

const GlobalBannedAccountModal = () => {
  const { showBannedAccountModal, setShowBannedAccountModal, resetUserSession } = useContext(AppContext)
  const navigate = useNavigate()

  const handleBannedModalClose = () => {
    setShowBannedAccountModal(false)
    resetUserSession()
    navigate('/login')
  }

  return (
    <BannedAccountModal 
      isOpen={showBannedAccountModal}
      onClose={handleBannedModalClose}
      onLogout={resetUserSession}
    />
  )
}

export default GlobalBannedAccountModal
