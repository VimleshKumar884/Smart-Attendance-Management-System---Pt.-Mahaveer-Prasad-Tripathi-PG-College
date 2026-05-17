/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3, Filter, Eye, X, Clock, Check } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatDisplayDate, getFriendlyError, percentageClass } from '../lib/helpers';
import { AnimatePresence, motion } from 'framer-motion';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [backdatedLogs, setBackdatedLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    subjectId: 'all',
    from: '',
    to: '',
  });

  const [selectedSession, setSelectedSession] = useState(null); // For modal

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const [attRes, subRes, backRes] = await Promise.all([
          axios.get('/attendance'),
          axios.get('/subjects'), // Could just use assignments, but subjects gives names easily
          axios.get('/backdated-logs').catch(() => ({ data: { data: [] } }))
        ]);
        
        setAttendance(attRes.data.data || []);
        setSubjects(subRes.data.data || []);
        setBackdatedLogs(backRes.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load attendance history.'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const subjectOptions = useMemo(() => {
    // Unique subjects from attendance records
    const map = new Map();
    attendance.forEach(r => {
      if (r.subjectId) map.set(r.subjectId._id, r.subjectId.subjectName);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [attendance]);

  // Group attendance by Date + Subject + Lecture to form "Sessions"
  const sessions = useMemo(() => {
    const map = new Map();
    
    attendance.forEach(record => {
       const dateStr = new Date(record.date).toISOString().split('T')[0];
       const subjectId = record.subjectId?._id || record.subjectId;
       const lectureNo = record.lecture_no || 1;
       const key = `${dateStr}_${subjectId}_${lectureNo}`;
       
       if (!map.has(key)) {
          // Find backdated log if any
          const bLog = backdatedLogs.find(bl => 
             (bl.subjectId?._id || bl.subjectId) === subjectId && 
             new Date(bl.date).toISOString().split('T')[0] === dateStr
          );
          
          map.set(key, {
            id: key,
            date: dateStr,
            subjectId,
            subjectName: record.subjectId?.subjectName || 'Unknown Subject',
            subjectCode: record.subjectId?.subjectCode || '',
            lectureNo,
            isBackdated: record.isBackdated || !!bLog,
            backdatedStatus: bLog ? bLog.adminStatus : null, // 'pending', 'approved', 'rejected'
            records: []
          });
       }
       map.get(key).records.push(record);
    });

    // Compute aggregates per session
    const result = Array.from(map.values()).map(session => {
       let present = 0, absent = 0, late = 0;
       session.records.forEach(r => {
         if (r.status === 'Present') present++;
         else if (r.status === 'Absent') absent++;
         else if (r.status === 'Late') late++;
       });
       return { ...session, total: session.records.length, present, absent, late };
    });
    
    // Sort descending by date
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, backdatedLogs]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
       const sMatch = filters.subjectId === 'all' || session.subjectId === filters.subjectId;
       const fromMatch = !filters.from || session.date >= filters.from;
       const toMatch = !filters.to || session.date <= filters.to;
       return sMatch && fromMatch && toMatch;
    });
  }, [sessions, filters]);

  const summary = useMemo(() => {
    const totalClasses = filteredSessions.length;
    let totalP = 0, totalA = 0, totalL = 0;
    
    filteredSessions.forEach(s => {
      totalP += s.present;
      totalA += s.absent;
      totalL += s.late;
    });
    
    const effectivePresent = totalP + (totalL * 0.5);
    const totalStudentsMarked = totalP + totalA + totalL;
    
    const avgAttendance = totalStudentsMarked > 0 ? Math.round((effectivePresent / totalStudentsMarked) * 100) : 0;
    
    return { totalClasses, avgAttendance };
  }, [filteredSessions]);


  if (loading) return <Spinner label="Loading attendance history..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <BarChart3 className="text-primary" size={30} />
          Attendance History
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Review past classes, check backdated approvals, and view student details.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <Filter className="hidden self-center text-slate-400 md:block" size={22} />
        <select value={filters.subjectId} onChange={(e) => setFilters(c => ({ ...c, subjectId: e.target.value }))} className="input-field min-h-11">
          <option value="all">All Subjects</option>
          {subjectOptions.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <input type="date" value={filters.from} onChange={(e) => setFilters(c => ({ ...c, from: e.target.value }))} className="input-field min-h-11" title="From Date" />
          <input type="date" value={filters.to} onChange={(e) => setFilters(c => ({ ...c, to: e.target.value }))} className="input-field min-h-11" title="To Date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryTile label="Total Classes Taken" value={summary.totalClasses} tone="bg-indigo-50 text-indigo-700 border-indigo-200" />
        <SummaryTile label="Average Attendance" value={`${summary.avgAttendance}%`} tone={percentageClass(summary.avgAttendance)} />
      </div>

      <div className="hidden md:block table-shell">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Subject</th>
              <th className="px-5 py-4">Status / Type</th>
              <th className="px-5 py-4 text-center">Total</th>
              <th className="px-5 py-4 text-center text-emerald-600">Present</th>
              <th className="px-5 py-4 text-center text-rose-600">Absent</th>
              <th className="px-5 py-4 text-center text-amber-600">Late</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id} className="table-row">
                <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatDisplayDate(session.date)}</td>
                <td className="px-5 py-4 font-black text-slate-900">{session.subjectName}</td>
                <td className="px-5 py-4">
                   <SessionTypeBadge isBackdated={session.isBackdated} status={session.backdatedStatus} />
                </td>
                <td className="px-5 py-4 text-center font-bold text-slate-500">{session.total}</td>
                <td className="px-5 py-4 text-center font-black text-emerald-600">{session.present}</td>
                <td className="px-5 py-4 text-center font-black text-rose-600">{session.absent}</td>
                <td className="px-5 py-4 text-center font-black text-amber-600">{session.late}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedSession(session)} 
                      className="tap-target flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      <Eye size={16} /> Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredSessions.length && <EmptyState />}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredSessions.map((session) => (
          <div key={session.id} className="mobile-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-black text-slate-950">{session.subjectName}</h3>
                <p className="text-sm font-semibold text-slate-500">{formatDisplayDate(session.date)}</p>
              </div>
              <SessionTypeBadge isBackdated={session.isBackdated} status={session.backdatedStatus} />
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center my-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Total</p>
                  <p className="font-bold text-slate-700">{session.total}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-emerald-600">Present</p>
                  <p className="font-bold text-emerald-700">{session.present}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-rose-600">Absent</p>
                  <p className="font-bold text-rose-700">{session.absent}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-amber-600">Late</p>
                  <p className="font-bold text-amber-700">{session.late}</p>
               </div>
            </div>
            
            <button 
               type="button" 
               onClick={() => setSelectedSession(session)} 
               className="tap-target w-full rounded-lg border border-slate-200 py-2.5 text-sm font-bold text-slate-700 flex justify-center items-center gap-2"
            >
               <Eye size={18} /> View Details
            </button>
          </div>
        ))}
        {!filteredSessions.length && <EmptyState />}
      </div>

      <DetailsModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    </div>
  );
};

const SessionTypeBadge = ({ isBackdated, status }) => {
  if (!isBackdated) {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 border border-slate-200">Regular</span>;
  }
  
  if (status === 'approved') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700"><Check size={12}/> Approved</span>;
  if (status === 'rejected') return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-rose-700"><X size={12}/> Rejected</span>;
  
  return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700"><Clock size={12}/> Pending</span>;
};

const SummaryTile = ({ label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-slate-500">{label}</p>
    <span className={`mt-3 inline-flex rounded-full border px-4 py-2 text-2xl font-black ${tone}`}>{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    No history found for the selected filters.
  </div>
);

const DetailsModal = ({ session, onClose }) => {
  if (!session) return null;

  // Sort records by roll number
  const sortedRecords = [...session.records].sort((a, b) => {
    const ra = a.studentId?.rollNumber || '';
    const rb = b.studentId?.rollNumber || '';
    return ra.localeCompare(rb);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-black text-slate-950">{session.subjectName}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-sm font-bold text-slate-500">{formatDisplayDate(session.date)}</p>
                 <span className="text-slate-300">•</span>
                 <SessionTypeBadge isBackdated={session.isBackdated} status={session.backdatedStatus} />
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><X size={20} /></button>
          </div>
          
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex gap-6 text-sm font-bold">
            <span className="text-emerald-600">Present: {session.present}</span>
            <span className="text-rose-600">Absent: {session.absent}</span>
            <span className="text-amber-600">Late: {session.late}</span>
          </div>

          <div className="overflow-y-auto p-6">
             <div className="grid gap-3 sm:grid-cols-2">
                {sortedRecords.map(record => {
                  const student = record.studentId || {};
                  const isP = record.status === 'Present';
                  const isL = record.status === 'Late';
                  
                  const bg = isP ? 'bg-emerald-50 border-emerald-100' : isL ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';
                  const text = isP ? 'text-emerald-700' : isL ? 'text-amber-700' : 'text-rose-700';
                  const icon = isP ? '✅' : isL ? '🕐' : '❌';

                  return (
                    <div key={record._id} className={`flex items-center justify-between p-3 rounded-lg border ${bg}`}>
                       <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{student.name || 'Unknown'}</p>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{student.rollNumber || 'N/A'}</p>
                       </div>
                       <span className={`text-xs font-black uppercase tracking-wide flex items-center gap-1 ${text}`}>
                         {icon} {record.status}
                       </span>
                    </div>
                  )
                })}
             </div>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AttendanceHistory;
