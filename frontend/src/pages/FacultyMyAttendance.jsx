/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import { getFriendlyError, percentageClass } from '../lib/helpers';

const FacultyMyAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchMyLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/faculty-logs/me');
        setLogs(res.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load attendance logs.'));
      } finally {
        setLoading(false);
      }
    };
    fetchMyLogs();
  }, []);

  const monthYearStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthLogs = useMemo(() => {
    return logs.filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [logs, currentMonth, currentYear]);

  const summary = useMemo(() => {
    let present = 0, halfDay = 0, absent = 0;
    
    currentMonthLogs.forEach(log => {
      if (log.status === 'present') present++;
      else if (log.status === 'half-day') halfDay++;
      else if (log.status === 'absent') absent++;
    });
    
    const effectivePresent = present + (halfDay * 0.5);
    const totalLogs = currentMonthLogs.length;
    
    let percentage = 100;
    if (totalLogs > 0) {
      percentage = Math.round((effectivePresent / totalLogs) * 100);
    } else if (totalLogs === 0 && currentDate.getMonth() === new Date().getMonth()) {
       percentage = 'N/A';
    } else {
       percentage = 0;
    }
    
    return { present, halfDay, absent, percentage };
  }, [currentMonthLogs, currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  
  const calendarDays = useMemo(() => {
    const days = [];
    // padding before
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, dateStr: null, log: null });
    }
    
    // actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
      const log = currentMonthLogs.find(l => new Date(l.date).toISOString().split('T')[0] === dateStr);
      days.push({ day: i, dateStr, log });
    }
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth, currentMonthLogs]);

  const warning = summary.percentage !== 'N/A' && summary.percentage < 75;

  if (loading) return <Spinner label="Loading your attendance..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <CalendarDays className="text-primary" size={30} />
          My Attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Track your daily logins, half-days, and absences.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {warning && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-sm animate-in slide-in-from-top-2">
          <AlertTriangle className="text-rose-600 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-black text-rose-800 uppercase tracking-wide">Low Attendance Warning</h3>
            <p className="mt-1 text-sm font-medium text-rose-700">
              Your attendance for {monthYearStr} has dropped to {summary.percentage}%. Please maintain a minimum of 75%.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile icon={CheckCircle2} label="Present" value={summary.present} tone="bg-emerald-50 text-emerald-700 border-emerald-200" />
        <SummaryTile icon={XCircle} label="Absent" value={summary.absent} tone="bg-rose-50 text-rose-700 border-rose-200" />
        <SummaryTile icon={Clock} label="Half-Day" value={summary.halfDay} tone="bg-amber-50 text-amber-700 border-amber-200" />
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
           <p className="text-sm font-bold text-slate-500">Attendance %</p>
           <span className={`mt-2 inline-flex self-start rounded-full border px-4 py-1.5 text-2xl font-black ${summary.percentage === 'N/A' ? 'bg-slate-100 text-slate-700 border-slate-200' : percentageClass(summary.percentage)}`}>
             {summary.percentage === 'N/A' ? 'N/A' : `${summary.percentage}%`}
           </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
           <button onClick={prevMonth} className="px-3 py-1 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100">&larr; Prev</button>
           <h2 className="text-lg font-black text-slate-900">{monthYearStr}</h2>
           <button onClick={nextMonth} disabled={currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()} className="px-3 py-1 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50">Next &rarr;</button>
        </div>
        
        <div className="p-6">
           <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2">{day}</div>
              ))}
              
              {calendarDays.map((cd, i) => {
                 if (!cd.day) {
                    return <div key={i} className="aspect-square rounded-lg bg-slate-50/50"></div>;
                 }
                 
                 const status = cd.log?.status;
                 let bgClass = 'bg-slate-50 border-slate-100 text-slate-600';
                 if (status === 'present') bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
                 if (status === 'half-day') bgClass = 'bg-amber-50 border-amber-200 text-amber-700 font-bold';
                 if (status === 'absent') bgClass = 'bg-rose-50 border-rose-200 text-rose-700 font-bold';
                 
                 return (
                    <div key={i} className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 md:p-2 transition-transform hover:scale-[1.02] ${bgClass}`}>
                       <span className="text-sm md:text-lg">{cd.day}</span>
                       {status && <span className="text-[10px] uppercase tracking-wide hidden md:block mt-1">{status}</span>}
                    </div>
                 );
              })}
           </div>
        </div>
      </div>

    </div>
  );
};

const SummaryTile = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
       <div className={`p-2 rounded-lg ${tone.replace('border-', '')}`}>
          <Icon size={24} />
       </div>
       <div>
         <p className="text-sm font-bold text-slate-500">{label}</p>
         <span className="text-2xl font-black text-slate-900">{value}</span>
       </div>
    </div>
  </div>
);

export default FacultyMyAttendance;
