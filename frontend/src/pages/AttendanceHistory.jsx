import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3, Filter } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatDisplayDate, getFriendlyError, toDateKey } from '../lib/helpers';

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subjectId: 'all',
    date: '',
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/attendance');
        setRecords(res.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load attendance history.'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const subjects = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      const subject = record.subjectId;
      if (subject?._id) map.set(subject._id, subject.subjectName);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordSubjectId = record.subjectId?._id || record.subjectId;
      const subjectMatches = filters.subjectId === 'all' || recordSubjectId === filters.subjectId;
      const dateMatches = !filters.date || toDateKey(record.date) === filters.date;
      return subjectMatches && dateMatches;
    });
  }, [filters, records]);

  const summary = useMemo(() => {
    return filteredRecords.reduce((totals, record) => {
      if (record.status === 'Present') totals.present += 1;
      if (record.status === 'Absent') totals.absent += 1;
      if (record.status === 'Late') totals.late += 1;
      return totals;
    }, { present: 0, absent: 0, late: 0 });
  }, [filteredRecords]);

  if (loading) return <Spinner label="Loading attendance history..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <BarChart3 className="text-primary" size={30} />
          Attendance History
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Past attendance records filtered by subject and date.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[auto_1fr_180px]">
        <Filter className="hidden self-center text-slate-400 md:block" size={22} />
        <select value={filters.subjectId} onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))} className="input-field min-h-11">
          <option value="all">All Subjects</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="input-field min-h-11" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total Present" value={summary.present} tone="bg-emerald-50 text-emerald-700 border-emerald-200" />
        <SummaryCard label="Total Absent" value={summary.absent} tone="bg-red-50 text-red-700 border-red-200" />
        <SummaryCard label="Total Late" value={summary.late} tone="bg-amber-50 text-amber-700 border-amber-200" />
      </div>

      <div className="hidden md:block table-shell">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Subject</th>
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Lecture</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id} className="table-row">
                <td className="px-5 py-4 text-sm font-bold text-slate-700">{formatDisplayDate(record.date)}</td>
                <td className="px-5 py-4 text-sm font-black text-slate-900">{record.subjectId?.subjectName || 'N/A'}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{record.studentId?.name || 'N/A'}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{record.lecture_no || 'N/A'}</td>
                <td className="px-5 py-4"><StatusBadge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredRecords.length && <EmptyState />}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredRecords.map((record) => (
          <div key={record._id} className="mobile-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">{record.subjectId?.subjectName || 'N/A'}</h3>
                <p className="text-sm font-semibold text-slate-500">{formatDisplayDate(record.date)}</p>
              </div>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">{record.studentId?.name || 'N/A'}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">Lecture {record.lecture_no || 'N/A'}</p>
          </div>
        ))}
        {!filteredRecords.length && <EmptyState />}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const classes = status === 'Present'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'Late'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{status || 'N/A'}</span>;
};

const SummaryCard = ({ label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-bold text-slate-500">{label}</p>
    <span className={`mt-2 inline-flex rounded-full border px-4 py-1.5 text-xl font-black ${tone}`}>{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    No attendance records found.
  </div>
);

export default AttendanceHistory;
