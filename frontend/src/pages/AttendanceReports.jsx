/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3, Download, Filter, Clock, Check, X } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { downloadCsv, formatDisplayDate, getFriendlyError, percentageClass, toDateKey } from '../lib/helpers';

const AttendanceReports = () => {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'backdated'
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [backdatedLogs, setBackdatedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    classKey: 'all',
    subjectId: 'all',
    from: '',
    to: '',
    isBackdated: 'all'
  });
  
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [attendanceRes, subjectsRes, backdatedRes] = await Promise.all([
        axios.get('/attendance'),
        axios.get('/subjects'),
        axios.get('/backdated-logs').catch(() => ({ data: { data: [] } }))
      ]);
      setAttendance(attendanceRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      setBackdatedLogs(backdatedRes.data.data || []);
    } catch (err) {
      setError(getFriendlyError(err, 'Could not load attendance reports.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const classOptions = useMemo(() => {
    const options = attendance.map((record) => {
      const student = record.studentId || {};
      return buildClassKey(student.department, student.semester, record.section);
    }).filter(Boolean);
    return [...new Set(options)].sort();
  }, [attendance]);

  const filteredRows = useMemo(() => {
    return attendance.filter((record) => {
      const student = record.studentId || {};
      const recordClassKey = buildClassKey(student.department, student.semester, record.section);
      const recordSubjectId = record.subjectId?._id || record.subjectId;
      const dateKey = toDateKey(record.date);
      
      const classMatches = filters.classKey === 'all' || recordClassKey === filters.classKey;
      const subjectMatches = filters.subjectId === 'all' || recordSubjectId === filters.subjectId;
      const fromMatches = !filters.from || dateKey >= filters.from;
      const toMatches = !filters.to || dateKey <= filters.to;
      const backdatedMatches = filters.isBackdated === 'all' || 
                               (filters.isBackdated === 'true' ? record.isBackdated : !record.isBackdated);
                               
      return classMatches && subjectMatches && fromMatches && toMatches && backdatedMatches;
    });
  }, [attendance, filters]);

  const summary = useMemo(() => {
    const presentScore = filteredRows.reduce((total, record) => {
      if (record.status === 'Present') return total + 1;
      if (record.status === 'Late') return total + 0.5;
      return total;
    }, 0);
    const percentage = filteredRows.length ? Math.round((presentScore / filteredRows.length) * 100) : 0;
    return { total: filteredRows.length, percentage };
  }, [filteredRows]);

  const exportCsv = () => {
    if (!filteredRows.length) {
      showToast('No report data available to export.', 'error');
      return;
    }

    const rows = [
      ['Date', 'Student', 'Roll Number', 'Class', 'Subject', 'Lecture', 'Status', 'Is Backdated'],
      ...filteredRows.map((record) => {
        const student = record.studentId || {};
        return [
          formatDisplayDate(record.date),
          student.name || 'N/A',
          student.rollNumber || 'N/A',
          buildClassKey(student.department, student.semester, record.section) || 'N/A',
          record.subjectId?.subjectName || 'N/A',
          record.lecture_no || 'N/A',
          record.status || 'N/A',
          record.isBackdated ? 'Yes' : 'No'
        ];
      }),
    ];
    downloadCsv(`attendance-report-${Date.now()}.csv`, rows);
    showToast('Attendance report exported as CSV.', 'success');
  };

  const handleUpdateBackdatedStatus = async (logId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      const res = await axios.put(`/backdated-logs/${logId}`, { adminStatus: status });
      setBackdatedLogs(current => current.map(log => log._id === logId ? res.data.data : log));
      showToast(`Request ${status} successfully.`, 'success');
      if (status === 'rejected') {
         // Refresh attendance data to show absent students
         fetchData();
      }
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to update request.'), 'error');
    }
  };

  if (loading) return <Spinner label="Loading attendance reports..." />;

  const pendingRequestsCount = backdatedLogs.filter(log => log.adminStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <BarChart3 className="text-primary" size={30} />
            Attendance Reports
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Filter reports or manage backdated requests.</p>
        </div>
        {activeTab === 'reports' && (
          <button
            type="button"
            onClick={exportCsv}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('reports')}
        >
          General Reports
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'backdated' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('backdated')}
        >
          Backdated Requests
          {pendingRequestsCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{pendingRequestsCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
            <Filter className="hidden self-center text-slate-400 md:block" size={22} />
            <select value={filters.classKey} onChange={(e) => setFilters((c) => ({ ...c, classKey: e.target.value }))} className="input-field min-h-11">
              <option value="all">All Classes</option>
              {classOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={filters.subjectId} onChange={(e) => setFilters((c) => ({ ...c, subjectId: e.target.value }))} className="input-field min-h-11">
              <option value="all">All Subjects</option>
              {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.subjectName}</option>)}
            </select>
            <select value={filters.isBackdated} onChange={(e) => setFilters((c) => ({ ...c, isBackdated: e.target.value }))} className="input-field min-h-11">
              <option value="all">All Entries</option>
              <option value="false">Regular Only</option>
              <option value="true">Backdated Only</option>
            </select>
            <div className="grid grid-cols-2 gap-3 md:col-span-1">
              <input type="date" value={filters.from} onChange={(e) => setFilters((c) => ({ ...c, from: e.target.value }))} className="input-field min-h-11" title="From Date" />
              <input type="date" value={filters.to} onChange={(e) => setFilters((c) => ({ ...c, to: e.target.value }))} className="input-field min-h-11" title="To Date" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Matching Records" value={summary.total} />
            <SummaryTile label="Attendance Percentage" value={`${summary.percentage}%`} tone={percentageClass(summary.percentage)} />
          </div>

          <div className="hidden md:block table-shell">
            <table className="w-full border-collapse text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((record) => {
                  const student = record.studentId || {};
                  return (
                    <tr key={record._id} className="table-row">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-700">{formatDisplayDate(record.date)}</p>
                        {record.isBackdated && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 mt-1"><Clock size={10}/> Backdated</span>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">{student.name || 'N/A'}</p>
                        <p className="text-sm font-medium text-slate-500">{student.rollNumber || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{buildClassKey(student.department, student.semester, record.section) || 'N/A'}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{record.subjectId?.subjectName || 'N/A'}</td>
                      <td className="px-5 py-4"><StatusBadge status={record.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredRows.length && <EmptyState label="No attendance records match the filters." />}
          </div>
          
          <div className="grid gap-3 md:hidden">
            {filteredRows.map((record) => {
              const student = record.studentId || {};
              return (
                <div key={record._id} className="mobile-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">{record.subjectId?.subjectName || 'N/A'}</h3>
                      <p className="text-sm font-semibold text-slate-500">{formatDisplayDate(record.date)}</p>
                      {record.isBackdated && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 mt-1"><Clock size={10}/> Backdated</span>}
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{student.name || 'N/A'} · {student.rollNumber || 'N/A'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{buildClassKey(student.department, student.semester, record.section) || 'N/A'}</p>
                </div>
              );
            })}
            {!filteredRows.length && <EmptyState label="No attendance records match the filters." />}
          </div>
        </div>
      )}

      {activeTab === 'backdated' && (
        <div className="space-y-4 animate-in fade-in">
           <div className="hidden md:block table-shell">
            <table className="w-full border-collapse text-left">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-4">Submitted At</th>
                  <th className="px-5 py-4">Faculty</th>
                  <th className="px-5 py-4">Subject & Date</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backdatedLogs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatDisplayDate(log.submittedAt)}</td>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">{log.facultyId?.name || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-700">{log.subjectId?.subjectName || 'N/A'}</p>
                      <p className="text-sm font-medium text-slate-500">For Date: {new Date(log.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 max-w-xs truncate">{log.reason}</td>
                    <td className="px-5 py-4"><RequestStatusBadge status={log.adminStatus} /></td>
                    <td className="px-5 py-4">
                      {log.adminStatus === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleUpdateBackdatedStatus(log._id, 'approved')} className="flex h-9 items-center gap-1 rounded bg-emerald-100 px-3 text-sm font-bold text-emerald-700 hover:bg-emerald-200">
                            <Check size={16} /> Approve
                          </button>
                          <button type="button" onClick={() => handleUpdateBackdatedStatus(log._id, 'rejected')} className="flex h-9 items-center gap-1 rounded bg-rose-100 px-3 text-sm font-bold text-rose-700 hover:bg-rose-200">
                            <X size={16} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 block text-right">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!backdatedLogs.length && <EmptyState label="No backdated requests found." />}
          </div>
          
          <div className="grid gap-3 md:hidden">
            {backdatedLogs.map((log) => (
              <div key={log._id} className="mobile-card">
                 <div className="flex items-start justify-between gap-3">
                   <div>
                     <h3 className="font-black text-slate-950">{log.facultyId?.name}</h3>
                     <p className="text-sm font-semibold text-slate-500">{log.subjectId?.subjectName} - {new Date(log.date).toLocaleDateString()}</p>
                   </div>
                   <RequestStatusBadge status={log.adminStatus} />
                 </div>
                 <div className="mt-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                   <p className="text-xs font-bold uppercase text-slate-400 mb-1">Reason</p>
                   <p className="text-sm font-medium text-slate-700">{log.reason}</p>
                 </div>
                 {log.adminStatus === 'pending' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => handleUpdateBackdatedStatus(log._id, 'approved')} className="tap-target rounded-lg border border-emerald-200 bg-emerald-50 font-bold text-emerald-700">Approve</button>
                      <button type="button" onClick={() => handleUpdateBackdatedStatus(log._id, 'rejected')} className="tap-target rounded-lg border border-rose-200 bg-rose-50 font-bold text-rose-700">Reject</button>
                    </div>
                 )}
              </div>
            ))}
            {!backdatedLogs.length && <EmptyState label="No backdated requests found." />}
          </div>
        </div>
      )}
    </div>
  );
};

const buildClassKey = (department, semester, section) => {
  const parts = [department, semester ? `Sem ${semester}` : '', section ? `Section ${section}` : ''].filter(Boolean);
  return parts.join(' · ');
};

const SummaryTile = ({ label, value, tone = 'bg-blue-50 text-primary border-blue-100' }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-slate-500">{label}</p>
    <span className={`mt-3 inline-flex rounded-full border px-4 py-2 text-2xl font-black ${tone}`}>{value}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const classes = status === 'Present'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'Late'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{status || 'N/A'}</span>;
};

const RequestStatusBadge = ({ status }) => {
  const classes = status === 'approved'
    ? 'bg-emerald-100 text-emerald-700'
    : status === 'rejected'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-amber-100 text-amber-700';
  
  const icon = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';

  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${classes}`}>{icon} {status}</span>;
};

const EmptyState = ({ label }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    {label}
  </div>
);

export default AttendanceReports;
