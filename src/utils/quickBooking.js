export const QUICK_BOOKING_BRANCHES = [
  {
    value: 'Chi nhánh 1',
    label: 'Chi nhánh 1',
    description: '70 Lê Đức Thọ',
  },
  {
    value: 'Chi nhánh 2',
    label: 'Chi nhánh 2',
    description: '43 Nơ Trang Long',
  },
  {
    value: 'Chi nhánh 3',
    label: 'Chi nhánh 3',
    description: '59 Trần Xuân Soạn',
  },
];

export const getBranchDisplayLabel = (branchValue = '') => {
  const branch = QUICK_BOOKING_BRANCHES.find((item) => item.value === branchValue);

  if (!branch) {
    return branchValue;
  }

  return `${branch.label} - ${branch.description}`;
};

export const QUICK_BOOKING_HOURS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 9;
  return {
    value: `${String(hour).padStart(2, '0')}:00`,
    label: `${String(hour).padStart(2, '0')}:00`,
  };
});

export const QUICK_BOOKING_DAYS = 7;

export const formatBookingDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getMaxBookingDate = (days = QUICK_BOOKING_DAYS) => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + days);

  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, '0');
  const day = String(maxDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
