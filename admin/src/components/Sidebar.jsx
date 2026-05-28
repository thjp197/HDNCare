import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { StylistContext } from '../context/StylistContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = ({ isMobileOpen = false, onClose = () => {} }) => {
  const { aToken } = useContext(AdminContext)
  const { sToken, isBranchManager } = useContext(StylistContext)

  const adminLinks = [
    { to: '/admin-dashboard', icon: assets.home_icon, label: 'Bảng điều khiển' },
    { to: '/all-appointments', icon: assets.appointment_icon, label: 'Lịch hẹn' },
    { to: '/add-stylist', icon: assets.add_icon, label: 'Thêm chuyên viên' },
    { to: '/stylists-list', icon: assets.people_icon, label: 'Danh sách chuyên viên' },
    { to: '/branch-management', icon: assets.add_icon, label: 'Quản lý Chi nhánh' },
    { to: '/discount-codes', icon: assets.add_icon, label: 'Mã giảm giá' },
    { to: '/penalized-users', icon: assets.list_icon, label: 'Tài khoản bị phạt' },
  ]

  const stylistLinks = [
    { to: '/stylist-dashboard', icon: assets.home_icon, label: 'Bảng điều khiển' },
    { to: '/stylist-appointments', icon: assets.appointment_icon, label: 'Lịch hẹn' },
    { to: '/stylist-profile', icon: assets.people_icon, label: 'Hồ sơ chuyên viên' },
  ]

  const branchManagerLinks = [
    { to: '/branch-manager-dashboard', icon: assets.home_icon, label: 'Bảng điều khiển Chi nhánh' },
    { to: '/branch-manager-appointments', icon: assets.appointment_icon, label: 'Lịch hẹn Chi nhánh' },
    { to: '/branch-manager-stylists', icon: assets.people_icon, label: 'Nhân viên Chi nhánh' },
  ]

  const navGroups = aToken
    ? [{ links: adminLinks }]
    : [
        { links: stylistLinks },
        ...(isBranchManager ? [{ title: 'QUẢN LÝ CHI NHÁNH', links: branchManagerLinks }] : []),
      ]

  const desktopLinkClass = ({ isActive }) =>
    `flex cursor-pointer items-center gap-3 whitespace-nowrap border-r-4 border-transparent px-9 py-3.5 text-sm md:min-w-72 ${
      isActive ? 'border-primary bg-[#f2f3ff]' : 'hover:bg-gray-50'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
      isActive ? 'bg-[#f2f3ff] text-primary' : 'text-gray-700 hover:bg-gray-50'
    }`

  const renderLinks = (className) =>
    navGroups.map((group, groupIndex) => (
      <div key={group.title || groupIndex} className={groupIndex ? 'mt-3 border-t border-gray-100 pt-3' : ''}>
        {group.title && (
          <p className='px-4 py-2 text-xs font-semibold text-gray-500'>{group.title}</p>
        )}
        {group.links.map((link) => (
          <NavLink key={link.to} className={className} to={link.to} onClick={onClose}>
            <img className='h-5 w-5 shrink-0' src={link.icon} alt='' />
            <p>{link.label}</p>
          </NavLink>
        ))}
      </div>
    ))

  return (
    <>
      <aside className='hidden min-h-screen bg-white border-r md:block'>
        <nav className='mt-5 text-[#515151]'>{renderLinks(desktopLinkClass)}</nav>
      </aside>

      {isMobileOpen && (
      <div className='fixed inset-0 z-40 md:hidden'>
        <div
          className='absolute inset-0 bg-black/40'
          onClick={onClose}
        />

        <aside
          className='absolute right-0 top-0 h-full w-[min(82vw,320px)] bg-white shadow-2xl'
        >
          <div className='flex items-center justify-between border-b px-5 py-4'>
            <p className='text-base font-semibold text-gray-900'>Menu</p>
            <button
              type='button'
              onClick={onClose}
              aria-label='Đóng menu'
              className='flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-gray-700 hover:bg-gray-100'
            >
              ×
            </button>
          </div>

          <nav className='space-y-1 overflow-y-auto px-3 py-4 text-[#515151]'>
            {renderLinks(mobileLinkClass)}
          </nav>
        </aside>
      </div>
      )}
    </>
  )
}

export default Sidebar
