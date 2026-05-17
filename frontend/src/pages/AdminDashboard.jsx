import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, BookOpen, CalendarCheck2, Users, UserRoundCheck } from 'lucide-react';
import Spinner from '../components/Spinner';
import { getFriendlyError, todayInputValue } from '../lib/helpers';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersRes, subjectsRes, attendanceRes] = await Promise.all([
          axios.get('/users'),
          axios.get('/subjects'),
          axios.get('/attendance'),
        ]);
        setUsers(usersRes.data.data || []);
        setSubjects(subjectsRes.data.data || []);
        setAttendance(attendanceRes.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load dashboard overview.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const students = users.filter((item) => item.role === 'student');
    const faculty = users.filter((item) => item.role === 'teacher');
    const today = todayInputValue();
    const todayRecords = attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return !Number.isNaN(recordDate.getTime()) && recordDate.toISOString().split('T')[0] === today;
    });
    const presentScore = todayRecords.reduce((total, record) => {
      if (record.status === 'Present') return total + 1;
      if (record.status === 'Late') return total + 0.5;
      return total;
    }, 0);

    return {
      students: students.length,
      faculty: faculty.length,
      activeSubjects: subjects.length,
      todayPercentage: todayRecords.length ? Math.round((presentScore / todayRecords.length) * 100) : 0,
    };
  }, [attendance, subjects.length, users]);

  const departmentData = useMemo(() => {
    const counts = users
      .filter((item) => item.role === 'student')
      .reduce((map, student) => {
        const key = student.department || 'General';
        map[key] = (map[key] || 0) + 1;
        return map;
      }, {});
    return Object.entries(counts).map(([department, count]) => ({ department, count }));
  }, [users]);

  const statusData = useMemo(() => {
    const counts = attendance.reduce((map, record) => {
      map[record.status] = (map[record.status] || 0) + 1;
      return map;
    }, {});
    return ['Present', 'Late', 'Absent'].map((status) => ({ status, count: counts[status] || 0 }));
  }, [attendance]);

  if (loading) return <Spinner label="Loading admin dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 md:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Overview of students, faculty, attendance, and active subjects.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Total Students" value={stats.students} tone="blue" />
        <MetricCard icon={UserRoundCheck} label="Total Faculty" value={stats.faculty} tone="indigo" />
        <MetricCard icon={CalendarCheck2} label="Today's Attendance %" value={`${stats.todayPercentage}%`} tone="emerald" />
        <MetricCard icon={BookOpen} label="Active Subjects" value={stats.activeSubjects} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Students By Department" empty={!departmentData.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="#0f4c81" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance Status Mix" empty={!attendance.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const toneStyles = {
  blue: 'bg-blue-50 text-primary',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
};

const MetricCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
        <Icon size={23} />
      </div>
      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-400">Live</span>
    </div>
    <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
  </div>
);

const ChartCard = ({ title, children, empty }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
    </div>
    <div className="h-80 p-4">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">No records yet.</div>
      ) : children}
    </div>
  </div>
);

export default AdminDashboard;
