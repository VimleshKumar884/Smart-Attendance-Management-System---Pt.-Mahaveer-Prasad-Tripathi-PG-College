export const SYSTEM_NAME = 'Smart Attendance System';
export const INSTITUTION_NAME = 'Pt. Mahaveer Prasad Tripathi PG College';

export const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  'What was the name of your first school?',
  'What is your childhood nickname?',
  'What is your favourite subject?',
  "What was your first pet's name?",
  'What is your date of birth? (DD/MM/YYYY format)',
];

export const getFriendlyError = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 401) return 'Your session has expired or the credentials are incorrect.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested record could not be found.';
  if (message) return message;
  if (error.code === 'ERR_NETWORK') return 'Unable to connect to the server. Please check if the backend is running.';
  return fallback;
};

export const todayInputValue = () => new Date().toISOString().split('T')[0];

export const formatDisplayDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatLongDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const downloadCsv = (filename, rows) => {
  const csv = rows
    .map((row) => row.map((cell) => {
      const value = cell === null || cell === undefined ? '' : String(cell);
      return `"${value.replace(/"/g, '""')}"`;
    }).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const attendanceTone = (percentage) => {
  if (percentage >= 75) return 'green';
  if (percentage >= 60) return 'yellow';
  return 'red';
};

export const percentageClass = (percentage) => {
  const tone = attendanceTone(percentage);
  if (tone === 'green') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (tone === 'yellow') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

export const cx = (...classes) => classes.filter(Boolean).join(' ');
