import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import BannedAccountModal from './BannedAccountModal'

const GlobalBannedAccountModal = () => {
  const { showBannedAccountModal, setShowBannedAccountModal, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const handleBannedModalClose = () => {
    setShowBannedAccountModal(false)
    setToken(false)
    navigate('/login')
  }

  return (
    <BannedAccountModal 
      isOpen={showBannedAccountModal}
      onClose={handleBannedModalClose}
      onLogout={() => setToken(false)}
    />
  )
}

export default GlobalBannedAccountModal
