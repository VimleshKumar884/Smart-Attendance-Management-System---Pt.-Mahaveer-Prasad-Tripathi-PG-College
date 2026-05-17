/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CalendarDays, Download, GraduationCap, UserCircle, Percent, Scan, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [attendanceRes, alertsRes] = await Promise.all([
          axios.get('/attendance'),
          axios.get('/sessions/alerts')
        ]);
        setRecords(attendanceRes.data.data || []);
        setAlerts(alertsRes.data.alerts || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load your dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
      showToast('No records available.', 'error');
      return;
    }
    const rows = [
      ['Subject', 'Total', 'Present', 'Absent', 'Late', 'Percentage'],
      ...subjectRows.map((row) => [row.subject, row.total, row.present, row.absent, row.late, `${row.percentage}%`]),
    ];
    downloadCsv(`attendance_report_${user?.rollNumber}.csv`, rows);
  };

  if (loading) return <Spinner label="Analyzing attendance data..." />;

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
           <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl dark:text-slate-100">
             <GraduationCap className="text-primary" size={30} />
             Student Portal
           </h1>
           <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Check your status below.</p>
        </motion.div>
        
        <Link to="/student/mark-attendance" className="tap-target inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-xl transition hover:bg-primary-dark active:scale-95">
           <Scan size={20} /> Mark Attendance
        </Link>
      </div>

      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm dark:bg-rose-900/10 dark:border-rose-900/30"
          >
            <div className="flex items-start gap-4">
               <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 dark:bg-rose-900/40">
                  <AlertCircle size={24} />
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-black text-rose-900 dark:text-rose-400 uppercase tracking-wide">Critical Attendance Warning</h3>
                  <p className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-500">You are below 75% in {alerts.length} subjects. Attend regular classes to avoid debarment.</p>
                  
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                     {alerts.map((alert, idx) => {
                        const subject = subjectRows.find(s => s.subject === (records.find(r => r.subjectId?._id === alert.subjectId)?.subjectId?.subjectName || ''));
                        return (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm dark:bg-slate-900 dark:border-rose-900/20">
                             <p className="text-xs font-black text-slate-500 uppercase">{subject?.subject || 'Unknown Subject'}</p>
                             <div className="flex items-end justify-between mt-2">
                                <span className="text-2xl font-black text-rose-600">{alert.percentage}%</span>
                                <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-1 rounded-full dark:bg-rose-900/30">Needs {alert.classesNeeded} more</span>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="profile" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-50 bg-blue-50 text-primary dark:bg-slate-800 dark:border-slate-800">
            <UserCircle size={64} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100">{user?.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">ID: {user?.rollNumber} · {user?.department}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500 dark:bg-slate-800">Semester {user?.semester}</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-500 dark:bg-slate-800">Section {user?.section}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center dark:bg-slate-900 dark:border-slate-800">
           <Percent size={32} className="text-indigo-500 mb-2"/>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate</p>
           <div className={`mt-2 text-5xl font-black ${percentageClass(overallPercentage)}`}>
             {overallPercentage}%
           </div>
           <p className="mt-2 text-[10px] font-bold text-slate-500">Based on {records.length} records</p>
        </div>
      </div>

      <section id="attendance" className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-slate-950 dark:text-slate-100">Performance Breakdown</h2>
           <button onClick={downloadReport} className="text-sm font-bold text-primary flex items-center gap-2">
             <Download size={16}/> CSV Export
           </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjectRows.map((row) => (
            <motion.div whileHover={{ y: -4 }} key={row.subject} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <h3 className="font-black text-slate-900 dark:text-slate-100">{row.subject}</h3>
                <span className={`text-sm font-black ${percentageClass(row.percentage)}`}>{row.percentage}%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                 <div className={`h-full ${row.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${row.percentage}%` }}></div>
              </div>
              <div className="mt-4 flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                 <span>P: {row.present}</span>
                 <span>A: {row.absent}</span>
                 <span>L: {row.late}</span>
                 <span>Total: {row.total}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-primary" size={25} />
            <h2 className="text-xl font-black text-slate-950 dark:text-slate-100">Monthly Tracker</h2>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase">
            <Legend color="bg-emerald-500" label="Present" />
            <Legend color="bg-rose-500" label="Absent" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-[10px] font-black text-slate-400">{day}</div>
          ))}
          {calendarDays.map((day) => (
            <div key={day.key} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative ${day.inMonth ? 'border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800' : 'border-transparent'}`}>
              {day.inMonth && (
                <>
                  <span className="text-xs font-bold text-slate-500">{day.date.getDate()}</span>
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {day.statuses.slice(0, 3).map((status, idx) => (
                      <div key={idx} className={`h-1.5 w-1.5 rounded-full ${status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
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

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);
    const statuses = [...new Set(statusMap[key] || [])];
    return { key, date, inMonth: date.getMonth() === month, statuses };
  });
};

const Legend = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    {label}
  </span>
);

export default StudentDashboard;
