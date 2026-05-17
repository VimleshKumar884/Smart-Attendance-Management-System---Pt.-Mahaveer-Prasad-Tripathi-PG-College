import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, BookOpen, CalendarCheck2, Users, UserRoundCheck, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import Spinner from '../components/Spinner';
import { getFriendlyError, todayInputValue } from '../lib/helpers';
import { motion } from 'framer-motion';

const COLORS = ['#0f4c81', '#2563eb', '#f59e0b', '#ef4444', '#10b981'];

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

  // Bar chart: class-wise attendance % (group by subject)
  const classWiseData = useMemo(() => {
    const groups = attendance.reduce((acc, curr) => {
      const subName = curr.subjectId?.subjectName || 'Unknown';
      if (!acc[subName]) acc[subName] = { total: 0, present: 0 };
      acc[subName].total += 1;
      if (curr.status === 'Present') acc[subName].present += 1;
      if (curr.status === 'Late') acc[subName].present += 0.5;
      return acc;
    }, {});

    return Object.entries(groups).map(([name, data]) => ({
      name,
      percentage: Math.round((data.present / data.total) * 100)
    })).slice(0, 8); // Top 8 subjects
  }, [attendance]);

  // Line chart: daily attendance trend over last 30 days
  const trendData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyCounts = attendance.reduce((acc, curr) => {
      const d = new Date(curr.date).toISOString().split('T')[0];
      if (!acc[d]) acc[d] = { total: 0, present: 0 };
      acc[d].total += 1;
      if (curr.status === 'Present') acc[d].present += 1;
      return acc;
    }, {});

    return last30Days.map(date => ({
      date: date.split('-').slice(1).join('/'),
      percentage: dailyCounts[date] ? Math.round((dailyCounts[date].present / dailyCounts[date].total) * 100) : 0
    }));
  }, [attendance]);

  // Pie chart: present vs absent breakdown
  const pieData = useMemo(() => {
    const counts = attendance.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Present', value: counts['Present'] || 0 },
      { name: 'Absent', value: counts['Absent'] || 0 },
      { name: 'Late', value: counts['Late'] || 0 },
    ].filter(d => d.value > 0);
  }, [attendance]);

  if (loading) return <Spinner label="Loading admin dashboard..." />;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-950 md:text-3xl dark:text-slate-100">Admin Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Advanced Analytics & System Overview</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <TrendingUp size={18} />
          View Full Reports
        </button>
      </motion.div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Total Students" value={stats.students} tone="blue" delay={0.1} />
        <MetricCard icon={UserRoundCheck} label="Total Faculty" value={stats.faculty} tone="indigo" delay={0.2} />
        <MetricCard icon={CalendarCheck2} label="Today's Attendance %" value={`${stats.todayPercentage}%`} tone="emerald" delay={0.3} />
        <MetricCard icon={BookOpen} label="Active Subjects" value={stats.activeSubjects} tone="amber" delay={0.4} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Class-wise Attendance %" empty={!classWiseData.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classWiseData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(15, 76, 129, 0.05)' }} 
              />
              <Bar dataKey="percentage" fill="#0f4c81" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="30-Day Attendance Trend" empty={!trendData.some(d => d.percentage > 0)}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overall Status Distribution" empty={!pieData.length}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
           <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                 <AlertCircle size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Low Attendance Alerts</h3>
           </div>
           <div className="space-y-4">
              {users.filter(u => u.role === 'student' && u.attendancePercentage < 75).slice(0, 5).map(student => (
                <div key={student._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                   <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.rollNumber} • {student.department}</p>
                   </div>
                   <span className="text-sm font-black text-rose-600 dark:text-rose-400">{Math.round(student.attendancePercentage)}%</span>
                </div>
              ))}
              {users.filter(u => u.role === 'student' && u.attendancePercentage < 75).length === 0 && (
                <p className="text-center py-8 text-sm text-slate-400">No critical alerts today.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const toneStyles = {
  blue: 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
};

const MetricCard = ({ icon: Icon, label, value, tone, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
        <Icon size={23} />
      </div>
      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:bg-slate-800 dark:text-slate-500">Live</span>
    </div>
    <p className="mt-5 text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-3xl font-black text-slate-950 dark:text-slate-100">{value}</p>
  </motion.div>
);

const ChartCard = ({ title, children, empty }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <h2 className="text-lg font-black text-slate-950 dark:text-slate-100">{title}</h2>
    </div>
    <div className="h-80 p-4">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">No records yet.</div>
      ) : children}
    </div>
  </div>
);

export default AdminDashboard;

