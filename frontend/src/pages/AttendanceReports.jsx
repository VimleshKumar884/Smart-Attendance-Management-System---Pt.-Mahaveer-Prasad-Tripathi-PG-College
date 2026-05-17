import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3, Download, Filter } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { downloadCsv, formatDisplayDate, getFriendlyError, percentageClass, toDateKey } from '../lib/helpers';

const AttendanceReports = () => {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    classKey: 'all',
    subjectId: 'all',
    from: '',
    to: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const [attendanceRes, subjectsRes] = await Promise.all([
          axios.get('/attendance'),
          axios.get('/subjects'),
        ]);
        setAttendance(attendanceRes.data.data || []);
        setSubjects(subjectsRes.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load attendance reports.'));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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
      return classMatches && subjectMatches && fromMatches && toMatches;
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
      ['Date', 'Student', 'Roll Number', 'Class', 'Subject', 'Lecture', 'Status'],
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
        ];
      }),
    ];
    downloadCsv(`attendance-report-${Date.now()}.csv`, rows);
    showToast('Attendance report exported as CSV.', 'success');
  };

  if (loading) return <Spinner label="Loading attendance reports..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <BarChart3 className="text-primary" size={30} />
            Attendance Reports
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Filter by class, subject, and date range.</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <Filter className="hidden self-center text-slate-400 md:block" size={22} />
        <select value={filters.classKey} onChange={(event) => setFilters((current) => ({ ...current, classKey: event.target.value }))} className="input-field min-h-11">
          <option value="all">All Classes</option>
          {classOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={filters.subjectId} onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))} className="input-field min-h-11">
          <option value="all">All Subjects</option>
          {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.subjectName}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3 md:col-span-1">
          <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="input-field min-h-11" />
          <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="input-field min-h-11" />
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
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatDisplayDate(record.date)}</td>
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
        {!filteredRows.length && <EmptyState />}
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
                </div>
                <StatusBadge status={record.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">{student.name || 'N/A'} · {student.rollNumber || 'N/A'}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{buildClassKey(student.department, student.semester, record.section) || 'N/A'}</p>
            </div>
          );
        })}
        {!filteredRows.length && <EmptyState />}
      </div>
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

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    No attendance records match the filters.
  </div>
);

export default AttendanceReports;
