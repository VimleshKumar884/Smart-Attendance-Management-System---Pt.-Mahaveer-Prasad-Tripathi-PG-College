import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  Download,
  AlertCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get('/attendance');
        const data = res.data.data;
        setAttendanceData(data);
        
        const total = data.length;
        const present = data.filter(a => a.status === 'Present').length;
        const late = data.filter(a => a.status === 'Late').length;
        const absent = data.filter(a => a.status === 'Absent').length;
        
        // Late counts as 0.5 for percentage calculation
        const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;
        
        setSummary({ total, present, absent, late, percentage: Math.round(percentage) });
      } catch (err) {
        console.error('Error fetching attendance');
      }
    };
    fetchAttendance();
  }, []);

  const pieData = [
    { name: 'Present', value: summary.present, color: '#10b981' },
    { name: 'Absent', value: summary.absent, color: '#ef4444' },
    { name: 'Late', value: summary.late, color: '#f97316' },
  ];

  const subjectData = [
    { name: 'Maths', percentage: 85 },
    { name: 'Physics', percentage: 70 },
    { name: 'CS', percentage: 95 },
    { name: 'English', percentage: 80 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-primary">{user?.name}</span>. Track your progress here.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-primary/25 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95"
          >
            <QrCode size={20} />
            Scan QR Code
          </button>
          <button className="bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold border border-slate-200 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
            <Download size={20} />
            Download Full Report
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScannerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute -top-16 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <X size={24} />
              </button>
              <QRScanner onResult={() => {
                // Refresh data after successful scan
                // fetchAttendance();
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          icon={<TrendingUp className="text-primary" />}
          label="Overall Attendance"
          value={`${summary.percentage}%`}
          color="bg-blue-50"
        />
        <SummaryCard 
          icon={<BookOpen className="text-emerald-500" />}
          label="Total Classes"
          value={summary.total}
          color="bg-emerald-50"
        />
        <SummaryCard 
          icon={<AlertCircle className="text-red-500" />}
          label="Absences"
          value={summary.absent}
          color="bg-red-50"
        />
        <SummaryCard 
          icon={<Calendar className="text-orange-500" />}
          label="Late Marks"
          value={summary.late}
          color="bg-orange-50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="glass p-8 rounded-[2.5rem] lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PieChartIcon size={20} className="text-primary" />
            Attendance Ratio
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="glass p-8 rounded-[2.5rem] lg:col-span-2 space-y-8">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Subject-wise Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="percentage" 
                  fill="#3b82f6" 
                  radius={[10, 10, 10, 10]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Recent Attendance History</h3>
          <span className="text-sm font-bold text-primary cursor-pointer hover:underline">View All Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Subject</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.slice(0, 5).map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">
                    {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-600">
                    {record.subjectId?.subjectName || 'General'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-tighter ${
                      record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    {record.teacherId?.name || 'Faculty'}
                  </td>
                </tr>
              ))}
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-bold italic">
                    No attendance records found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => (
  <div className="glass p-8 rounded-[2rem] space-y-4 hover:shadow-lg transition-all border-none group">
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
  </div>
);

export default StudentDashboard;