/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CalendarDays, Download, GraduationCap, UserCircle, Percent, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const overallPercentage = useMemo(() => {
    if (!subjectRows.length) return 'N/A';
    let totalClasses = 0;
    let totalEffectivePresent = 0;
    subjectRows.forEach(row => {
      totalClasses += row.total;
      totalEffectivePresent += row.present + (row.late * 0.5);
    });
    return totalClasses ? Math.round((totalEffectivePresent / totalClasses) * 100) : 0;
  }, [subjectRows]);

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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
             <GraduationCap className="text-primary" size={30} />
             Student Dashboard
           </h1>
           <p className="mt-1 text-sm font-semibold text-slate-500">View your attendance performance and warnings.</p>
        </div>
        
        <Link to="/student/mark-attendance" className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
           <KeyRound size={18} /> Mark Attendance (OTP)
        </Link>
      </div>

      <AttendanceBanner hasAttendance={hasAttendance} hasWarnings={hasWarnings} warningRows={warningRows} />

      <div id="profile" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_250px]">
        {/* Profile Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-blue-50 text-primary">
            {user?.photo ? (
              <img src={user.photo} alt={user.name || 'Student'} className="h-full w-full object-cover" />
            ) : (
              <UserCircle size={58} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-950">{user?.name || 'Student Name'}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">Roll No: <span className="text-slate-700">{user?.rollNumber || 'N/A'}</span></p>
            <div className="mt-4 grid gap-3 grid-cols-2">
              <ProfileMeta label="Class" value={`Sem ${user?.semester || 'N/A'} · Sec ${user?.section || 'N/A'}`} />
              <ProfileMeta label="Department" value={user?.department || 'N/A'} />
            </div>
          </div>
        </div>

        {/* Overall Percentage Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center">
           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3">
             <Percent size={24}/>
           </div>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Overall Attendance</p>
           <span className={`mt-2 inline-flex items-center justify-center rounded-full border px-5 py-2 text-4xl font-black ${overallPercentage === 'N/A' ? 'bg-slate-100 text-slate-700 border-slate-200' : percentageClass(overallPercentage)}`}>
             {overallPercentage === 'N/A' ? 'N/A' : `${overallPercentage}%`}
           </span>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <section id="attendance" className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-slate-950">Subject-wise Attendance</h2>
           <button
             type="button"
             onClick={downloadReport}
             className="tap-target hidden md:inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
           >
             <Download size={18} />
             Export Report
           </button>
        </div>

        <div className="hidden md:block table-shell">
          <table className="w-full border-collapse text-left">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Total Classes</th>
                <th className="px-5 py-4 text-emerald-600">Present</th>
                <th className="px-5 py-4 text-rose-600">Absent</th>
                <th className="px-5 py-4 text-amber-600">Late</th>
                <th className="px-5 py-4">Percentage</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => (
                <tr key={row.subject} className="table-row">
                  <td className="px-5 py-4 font-black text-slate-900">{row.subject}</td>
                  <td className="px-5 py-4 font-bold text-slate-700">{row.total}</td>
                  <td className="px-5 py-4 font-bold text-emerald-700">{row.present}</td>
                  <td className="px-5 py-4 font-bold text-rose-700">{row.absent}</td>
                  <td className="px-5 py-4 font-bold text-amber-700">{row.late}</td>
                  <td className="px-5 py-4"><AttendancePercent percentage={row.percentage} /></td>
                  <td className="px-5 py-4">
                    {row.percentage < 75 ? (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black uppercase text-rose-700">
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black uppercase text-emerald-700">
                        On Track
                      </span>
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
              <div className="mt-3 flex gap-4 text-sm font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                 <span className="text-slate-600">Tot: {row.total}</span>
                 <span className="text-emerald-600">P: {row.present}</span>
                 <span className="text-rose-600">A: {row.absent}</span>
                 <span className="text-amber-600">L: {row.late}</span>
              </div>
              {row.percentage < 75 && (
                <p className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={16}/> Warning: Minimum 75% required.
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
            <div key={day.key} className={`min-h-[60px] rounded-lg border flex flex-col p-1.5 md:p-2 text-left ${day.inMonth ? 'border-slate-200 bg-slate-50' : 'border-transparent bg-transparent'}`}>
              {day.inMonth && (
                <>
                  <p className="text-xs font-black text-slate-700">{day.date.getDate()}</p>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {day.statuses.map((status, idx) => (
                      <span key={`${status}-${idx}`} className={`h-2.5 w-2.5 rounded-full ${status === 'Present' ? 'bg-emerald-500' : status === 'Late' ? 'bg-amber-500' : 'bg-red-500'}`} title={status} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <Legend color="bg-emerald-500" label="Present" />
          <Legend color="bg-rose-500" label="Absent" />
          <Legend color="bg-amber-500" label="Late" />
        </div>
      </section>
    </div>
  );
};

const AttendanceBanner = ({ hasAttendance, hasWarnings, warningRows }) => {
  if (!hasAttendance) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-primary shadow-sm">
        No attendance records are available yet.
      </div>
    );
  }

  if (hasWarnings) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800 shadow-sm">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-600" />
        <div>
           <p className="uppercase tracking-wide text-xs font-black text-rose-600 mb-1">Low Attendance Warning</p>
           <span>You have {warningRows.length} subject{warningRows.length > 1 ? 's' : ''} below the 75% required attendance minimum: {warningRows.map(r => r.subject).join(', ')}.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 shadow-sm flex items-center gap-3">
      <span className="flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full h-8 w-8">✅</span>
      <div>
        <p className="uppercase tracking-wide text-xs font-black text-emerald-600 mb-0.5">All Clear</p>
        <span>Great job! Your attendance is on track across all subjects.</span>
      </div>
    </div>
  );
};

const ProfileMeta = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-slate-800 truncate">{value}</p>
  </div>
);

const AttendancePercent = ({ percentage, compact = false }) => {
  const tone = attendanceTone(percentage);
  
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${percentageClass(percentage)}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${tone === 'green' ? 'bg-emerald-500' : tone === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
      {percentage}%
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