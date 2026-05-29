import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import {
  QUICK_BOOKING_BRANCHES,
  QUICK_BOOKING_HOURS,
  getBranchDisplayLabel,
  formatBookingDate,
  getMaxBookingDate,
  getTodayInputValue,
} from '../utils/quickBooking';

const QuickBookingBar = () => {
  const navigate = useNavigate();
  const todayValue = useMemo(() => getTodayInputValue(), []);
  const maxDateValue = useMemo(() => getMaxBookingDate(), []);

  const [branch, setBranch] = useState(QUICK_BOOKING_BRANCHES[0].value);
  const [bookingDate, setBookingDate] = useState(todayValue);
  const [bookingTime, setBookingTime] = useState(QUICK_BOOKING_HOURS[0].value);
  const [service, setService] = useState(specialityData[0]?.speciality || '');

  const currentHourValue = `${String(new Date().getHours()).padStart(2, '0')}:00`;
  const availableTimes = QUICK_BOOKING_HOURS.filter((option) => {
    if (bookingDate !== todayValue) {
      return true;
    }

    return option.value > currentHourValue;
  });

  useEffect(() => {
    if (availableTimes.length === 0) {
      setBookingTime('');
      return;
    }

    if (!availableTimes.some((item) => item.value === bookingTime)) {
      setBookingTime(availableTimes[0].value);
    }
  }, [availableTimes, bookingTime]);

  const handleSearch = () => {
    if (!branch || !bookingDate || !bookingTime || !service) {
      return;
    }

    if (bookingDate === todayValue && !availableTimes.some((item) => item.value === bookingTime)) {
      return;
    }

    const params = new URLSearchParams({
      branch,
      date: bookingDate,
      time: bookingTime,
      service,
    });

    navigate(`/stylists?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className='px-4 py-8 sm:px-0 sm:py-10'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-5 text-center'>
          <h2 className='text-2xl font-semibold text-slate-900 sm:text-3xl'>
            Đặt lịch nhanh
          </h2>
          <p className='mt-2 text-sm text-slate-500'>
            Chọn chi nhánh, thời gian và dịch vụ chỉ trong vài bước.
          </p>
        </div>

        <div className='rounded-[28px] bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.14)] ring-1 ring-black/5 overflow-hidden'>
          <div className='grid grid-cols-1 lg:grid-cols-[1.15fr_1.2fr_1fr_auto]'>
            <div className='border-b border-slate-200/80 px-5 py-4 lg:border-b-0 lg:border-r'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Chi nhánh
              </p>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className='mt-2 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none'
              >
                {QUICK_BOOKING_BRANCHES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} - {item.description}
                  </option>
                ))}
              </select>
              <p className='mt-2 text-xs text-slate-500'>
                Chọn một trong 3 chi nhánh đang hoạt động.
              </p>
            </div>

            <div className='border-b border-slate-200/80 px-5 py-4 lg:border-b-0 lg:border-r'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Ngày & giờ
              </p>
              <div className='mt-2 grid grid-cols-2 gap-3'>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <label className='block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Ngày
                  </label>
                  <input
                    type='date'
                    min={todayValue}
                    max={maxDateValue}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className='mt-1 w-full bg-transparent text-sm font-medium text-slate-900 outline-none'
                  />
                </div>
                <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <label className='block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Giờ
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className='mt-1 w-full bg-transparent text-sm font-medium text-slate-900 outline-none'
                  >
                    {availableTimes.length > 0 ? (
                      availableTimes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))
                    ) : (
                      <option value=''>Hết khung giờ</option>
                    )}
                  </select>
                </div>
              </div>
              <p className='mt-2 text-xs text-slate-500'>
                Khung giờ hiển thị từ 09:00 đến 20:00, tối đa 7 ngày tới.
              </p>
            </div>

            <div className='border-b border-slate-200/80 px-5 py-4 lg:border-b-0 lg:border-r'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Dịch vụ
              </p>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className='mt-2 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none'
              >
                {specialityData.map((item) => (
                  <option key={item.speciality} value={item.speciality}>
                    {item.speciality}
                  </option>
                ))}
              </select>
              <p className='mt-2 text-xs text-slate-500'>
                Chọn một dịch vụ đang có trong hệ thống.
              </p>
            </div>

            <button
              type='button'
              onClick={handleSearch}
              disabled={!availableTimes.length}
              className='min-h-[88px] bg-[#F97316] px-8 py-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#ea6a05] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#f59e6f] lg:min-w-[120px]'
            >
              Tìm lịch
            </button>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-3 text-sm text-slate-600'>
            <span>
              Đang chọn: <strong className='text-slate-900'>{getBranchDisplayLabel(branch)}</strong>
            </span>
            <span>
              {formatBookingDate(bookingDate)} - {bookingTime}
            </span>
            <span>
              Dịch vụ: <strong className='text-slate-900'>{service}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBookingBar;
