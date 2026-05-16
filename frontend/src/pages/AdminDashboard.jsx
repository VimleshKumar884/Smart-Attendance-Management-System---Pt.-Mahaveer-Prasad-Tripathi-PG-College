import React, { useEffect, useState } from 'react';
import { 
  Users as UsersIcon, 
  UserSquare2, 
  BookOpen, 
  ShieldCheck,
  BarChart3,
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
    activeSessions: 14 // Mocked for realism
  });

  const enrollmentData = [
    { dept: 'B.Sc CS', count: 450 },
    { dept: 'B.Com', count: 320 },
    { dept: 'BA', count: 280 },
    { dept: 'M.Sc', count: 150 },
  ];

  const activityData = [
    { time: '09:00', load: 85 },
    { time: '10:00', load: 92 },
    { time: '11:00', load: 78 },
    { time: '12:00', load: 95 },
    { time: '13:00', load: 60 },
    { time: '14:00', load: 88 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, subjectsRes] = await Promise.all([
          axios.get('users'),
          axios.get('subjects')
        ]);
        const users = usersRes.data.data;
        setStats(prev => ({
          ...prev,
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          subjects: subjectsRes.data.count,
        }));
      } catch (err) {
        console.error('Error fetching admin stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrative Overview</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Institutional Management System • Session 2026-27</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 text-right border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">System Status</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              All Nodes Operational
            </p>
          </div>
          <div className="px-4 py-2">
            <Calendar size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Realistic Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<UsersIcon size={24} />} 
          label="Total Enrollment" 
          value={stats.students} 
          sub="Verified Students"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MetricCard 
          icon={<UserSquare2 size={24} />} 
          label="Academic Staff" 
          value={stats.teachers} 
          sub="Full-time Faculty"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <MetricCard 
          icon={<BookOpen size={24} />} 
          label="Courses Offered" 
          value={stats.subjects} 
          sub="Active Curriculum"
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <MetricCard 
          icon={<ShieldCheck size={24} />} 
          label="Active Sessions" 
          value={stats.activeSessions} 
          sub="Currently Marking"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Real-time System Load */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-black text-slate-900">Live Attendance Sync</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Network load across departments</p>
            </div>
            <BarChart3 size={20} className="text-slate-300" />
          </div>
          <div className="p-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="syncGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f4c81" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f4c81" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="load" stroke="#0f4c81" strokeWidth={3} fillOpacity={1} fill="url(#syncGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900">Enrollment Stats</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Departmental Split</p>
          </div>
          <div className="p-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#0f4c81" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Institutional Audit Logs</h3>
          <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
            View Archive <ChevronRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          <AuditRow 
            type="Security"
            message="Global system backup completed successfully."
            time="14:20 PM"
            status="success"
          />
          <AuditRow 
            type="Academic"
            message="Subject 'Advanced Calculus' assigned to Dr. Sarah Johnson."
            time="11:05 AM"
            status="info"
          />
          <AuditRow 
            type="Alert"
            message="Critical: Low attendance threshold reached for B.Sc Semester 4."
            time="09:45 AM"
            status="warning"
          />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, color, bg }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-primary/20 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`${bg} ${color} p-3 rounded-xl transition-transform group-hover:scale-110 duration-500`}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-time</span>
    </div>
    <div className="mt-6 space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 leading-tight">{value}</h3>
      <p className="text-xs font-bold text-slate-500 italic">{sub}</p>
    </div>
  </div>
);

const AuditRow = ({ type, message, time, status }) => (
  <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
    <div className="flex items-center gap-6">
      <div className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
        status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
        status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
        'bg-blue-50 text-blue-600 border-blue-100'
      }`}>
        {type}
      </div>
      <p className="text-sm font-bold text-slate-700">{message}</p>
    </div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
  </div>
);

export default AdminDashboard;