import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CalendarDays, Download, GraduationCap, UserCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  attendanceTone,
  downloadCsv,
  formatDisplayDate,
  getFriendlyError,
  percentageClass,
  toDateKey,
} from '../lib/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/attendance');
        setRecords(res.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load your attendance.'));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const subjectRows = useMemo(() => {
    const grouped = records.reduce((map, record) => {
      const subjectId = record.subjectId?._id || record.subjectId || 'general';
      const subjectName = record.subjectId?.subjectName || 'General Subject';
      if (!map[subjectId]) {
        map[subjectId] = {
          subject: subjectName,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
        };
      }
      map[subjectId].total += 1;
      if (record.status === 'Present') map[subjectId].present += 1;
      if (record.status === 'Late') map[subjectId].late += 1;
      if (record.status === 'Absent') map[subjectId].absent += 1;
      return map;
    }, {});

    return Object.values(grouped).map((row) => {
      const effectivePresent = row.present + row.late * 0.5;
      const percentage = row.total ? Math.round((effectivePresent / row.total) * 100) : 0;
      return { ...row, percentage };
    }).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [records]);

  const warningRows = subjectRows.filter((row) => row.percentage < 75);
  const hasWarnings = warningRows.length > 0;
  const hasAttendance = subjectRows.length > 0;

  const calendarDays = useMemo(() => buildMonthCalendar(records), [records]);

  const downloadReport = () => {
    if (!subjectRows.length) {
      showToast('No attendance records available to download.', 'error');
      return;
    }

    const rows = [
      ['Subject', 'Total Classes', 'Present', 'Absent', 'Late', 'Percentage'],
      ...subjectRows.map((row) => [row.subject, row.total, row.present, row.absent, row.late, `${row.percentage}%`]),
      [],
      ['Date', 'Subject', 'Lecture', 'Status'],
      ...records.map((record) => [
        formatDisplayDate(record.date),
        record.subjectId?.subjectName || 'General Subject',
        record.lecture_no || 'N/A',
        record.status || 'N/A',
      ]),
    ];

    downloadCsv(`my-attendance-report-${Date.now()}.csv`, rows);
    showToast('Attendance report downloaded as CSV.', 'success');
  };

  if (loading) return <Spinner label="Loading student dashboard..." />;

  return (
    <div className="space-y-6">
      <AttendanceBanner hasAttendance={hasAttendance} hasWarnings={hasWarnings} warningRows={warningRows} />

      <div id="profile" className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-blue-50 text-primary lg:mx-0">
          {user?.photo ? (
            <img src={user.photo} alt={user.name || 'Student'} className="h-full w-full object-cover" />
          ) : (
            <UserCircle size={58} />
          )}
        </div>
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{user?.name || 'Student'}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Roll No: {user?.rollNumber || 'N/A'}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProfileMeta label="Class" value={`Sem ${user?.semester || 'N/A'} · Section ${user?.section || 'N/A'}`} />
            <ProfileMeta label="Department" value={user?.department || 'N/A'} />
          </div>
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          <Download size={18} />
          Download My Attendance Report
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <section id="attendance" className="space-y-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-primary" size={26} />
          <h2 className="text-xl font-black text-slate-950">Subject-wise Attendance</h2>
        </div>

        <div className="hidden md:block table-shell">
          <table className="w-full border-collapse text-left">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Total Classes</th>
                <th className="px-5 py-4">Present</th>
                <th className="px-5 py-4">Absent</th>
                <th className="px-5 py-4">Percentage</th>
                <th className="px-5 py-4">Warning</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => (
                <tr key={row.subject} className="table-row">
                  <td className="px-5 py-4 font-black text-slate-900">{row.subject}</td>
                  <td className="px-5 py-4 font-bold text-slate-700">{row.total}</td>
                  <td className="px-5 py-4 font-bold text-emerald-700">{row.present}</td>
                  <td className="px-5 py-4 font-bold text-red-700">{row.absent}</td>
                  <td className="px-5 py-4"><AttendancePercent percentage={row.percentage} /></td>
                  <td className="px-5 py-4">
                    {row.percentage < 75 ? (
                      <p className="max-w-sm text-sm font-bold text-red-700">
                        Warning: {row.subject} attendance is {row.percentage}%. Minimum 75% required.
                      </p>
                    ) : (
                      <span className="text-sm font-semibold text-emerald-700">On track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!subjectRows.length && <EmptyState />}
        </div>

        <div className="grid gap-3 md:hidden">
          {subjectRows.map((row) => (
            <div key={row.subject} className="mobile-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 font-black text-slate-950">{row.subject}</h3>
                <AttendancePercent percentage={row.percentage} compact />
              </div>
              {row.percentage < 75 && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
                  Warning: {row.subject} attendance is {row.percentage}%. Minimum 75% required.
                </p>
              )}
            </div>
          ))}
          {!subjectRows.length && <EmptyState />}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <CalendarDays className="text-primary" size={25} />
          <h2 className="text-xl font-black text-slate-950">Monthly Attendance Calendar</h2>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-black uppercase tracking-wide text-slate-400">{day}</div>
          ))}
          {calendarDays.map((day) => (
            <div key={day.key} className={`min-h-[58px] rounded-lg border p-2 text-left ${day.inMonth ? 'border-slate-200 bg-slate-50' : 'border-transparent bg-transparent'}`}>
              {day.inMonth && (
                <>
                  <p className="text-xs font-black text-slate-700">{day.date.getDate()}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {day.statuses.map((status) => (
                      <span key={status} className={`h-2.5 w-2.5 rounded-full ${status === 'Present' ? 'bg-emerald-500' : status === 'Late' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
          <Legend color="bg-emerald-500" label="Present" />
          <Legend color="bg-red-500" label="Absent" />
          <Legend color="bg-amber-500" label="Late" />
        </div>
      </section>
    </div>
  );
};

const AttendanceBanner = ({ hasAttendance, hasWarnings, warningRows }) => {
  if (!hasAttendance) {
    return (
      <div className="sticky top-16 z-30 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-primary md:static">
        No attendance records are available yet.
      </div>
    );
  }

  if (hasWarnings) {
    return (
      <div className="sticky top-16 z-30 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm md:static">
        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
        <span>{warningRows.length} subject{warningRows.length > 1 ? 's are' : ' is'} below 75% attendance. Review the warning rows.</span>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-30 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 shadow-sm md:static">
      Great! Your attendance is on track.
    </div>
  );
};

const ProfileMeta = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const AttendancePercent = ({ percentage, compact = false }) => {
  const tone = attendanceTone(percentage);
  const label = tone === 'green' ? 'Green' : tone === 'yellow' ? 'Yellow' : 'Red';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${percentageClass(percentage)}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${tone === 'green' ? 'bg-emerald-500' : tone === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {percentage}% {!compact && <span className="hidden lg:inline">{label}</span>}
    </span>
  );
};

const buildMonthCalendar = (records) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const statusMap = records.reduce((map, record) => {
    const key = toDateKey(record.date);
    if (!key) return map;
    map[key] = [...(map[key] || []), record.status];
    return map;
  }, {});

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);
    const statuses = [...new Set(statusMap[key] || [])];
    return {
      key,
      date,
      inMonth: date.getMonth() === month,
      statuses,
    };
  });
};

const Legend = ({ color, label }) => (
  <span className="inline-flex items-center gap-2">
    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
    {label}
  </span>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    No attendance records found.
  </div>
);

export default StudentDashboard;
