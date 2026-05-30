import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const dateTimeMenuRef = useRef(null);

  const [branch, setBranch] = useState(QUICK_BOOKING_BRANCHES[0].value);
  const [bookingDate, setBookingDate] = useState(todayValue);
  const [bookingTime, setBookingTime] = useState(QUICK_BOOKING_HOURS[0].value);
  const [service, setService] = useState(specialityData[0]?.speciality || '');
  const [isDateTimeOpen, setIsDateTimeOpen] = useState(false);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dateTimeMenuRef.current && !dateTimeMenuRef.current.contains(event.target)) {
        setIsDateTimeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  const selectedBranchData = QUICK_BOOKING_BRANCHES.find((item) => item.value === branch);
  const selectedDateLabel = formatBookingDate(bookingDate);
  const selectedTimeLabel = bookingTime || 'Chọn giờ';

  return (
    <div className='px-4 py-5 sm:px-0 sm:py-6'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-4 text-center'>
          <h2 className='text-xl font-semibold text-slate-900 sm:text-2xl'>
            Đặt lịch nhanh
          </h2>
          <p className='mt-1 text-sm text-slate-500'>
            Chọn chi nhánh, thời gian và dịch vụ chỉ trong vài bước.
          </p>
        </div>

        <div className='overflow-visible rounded-[24px] bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5'>
          <div className='grid grid-cols-1 lg:grid-cols-[1.05fr_1.25fr_1fr_auto]'>
            <div className='border-b border-slate-200/80 px-4 py-3.5 lg:border-b-0 lg:border-r'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Chi nhánh
              </p>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className='mt-1.5 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none'
              >
                {QUICK_BOOKING_BRANCHES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.displayLabel || `${item.label} - ${item.description}`}
                  </option>
                ))}
              </select>
              <p className='mt-1.5 text-xs text-slate-500'>
                Chọn khu vực chi nhánh đang hoạt động.
              </p>
            </div>

            <div className='border-b border-slate-200/80 px-4 py-3.5 lg:border-b-0 lg:border-r'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Ngày & giờ
              </p>
              <div ref={dateTimeMenuRef} className='relative mt-1.5'>
                <button
                  type='button'
                  onClick={() => setIsDateTimeOpen((prev) => !prev)}
                  className='flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-slate-300'
                >
                  <div>
                    <span className='block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                      Chọn ngày / giờ
                    </span>
                    <span className='mt-1 block text-sm font-medium text-slate-900'>
                      {selectedDateLabel || 'Chọn ngày'} · {selectedTimeLabel}
                    </span>
                  </div>
                  <span className={`ml-4 text-slate-400 transition-transform ${isDateTimeOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {isDateTimeOpen && (
                  <div className='absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_45px_rgba(15,23,42,0.15)]'>
                    <div className='rounded-2xl bg-slate-50 p-3'>
                      <label className='block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
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

                    <div className='mt-3 rounded-2xl bg-slate-50 p-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <label className='block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                          Giờ
                        </label>
                        <span className='text-[11px] text-slate-400'>
                          {availableTimes.length > 0 ? '09:00 - 20:00' : 'Hết khung giờ'}
                        </span>
                      </div>

                      <div className='mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4'>
                        {availableTimes.length > 0 ? (
                          availableTimes.map((item) => (
                            <button
                              key={item.value}
                              type='button'
                              onClick={() => {
                                setBookingTime(item.value);
                                setIsDateTimeOpen(false);
                              }}
                              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                                bookingTime === item.value
                                  ? 'border-[#F97316] bg-[#F97316] text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-[#F97316] hover:text-[#F97316]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))
                        ) : (
                          <p className='col-span-full text-sm text-slate-500'>
                            Không còn khung giờ khả dụng trong ngày này.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className='mt-1.5 text-xs text-slate-500'>
                Tối đa đặt trước 7 ngày, các khung giờ từ 09:00 đến 20:00.
              </p>
            </div>

            <div className='border-b border-slate-200/80 px-4 py-3.5 lg:border-b-0 lg:border-r'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500'>
                Dịch vụ
              </p>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className='mt-1.5 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none'
              >
                {specialityData.map((item) => (
                  <option key={item.speciality} value={item.speciality}>
                    {item.speciality}
                  </option>
                ))}
              </select>
              <p className='mt-1.5 text-xs text-slate-500'>
                Chọn một dịch vụ đang có trong hệ thống.
              </p>
            </div>

            <button
              type='button'
              onClick={handleSearch}
              disabled={!availableTimes.length}
              className='min-h-[78px] bg-[#F97316] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#ea6a05] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-[#f59e6f] lg:min-w-[120px]'
            >
              Tìm lịch
            </button>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5 text-xs text-slate-600 sm:text-sm'>
            <span>
              Đang chọn: <strong className='text-slate-900'>{selectedBranchData ? getBranchDisplayLabel(branch) : branch}</strong>
            </span>
            <span>
              {selectedDateLabel} - {bookingTime}
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
