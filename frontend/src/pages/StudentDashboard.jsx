import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  Download,
  AlertCircle,
  TrendingUp,
  BookOpen,
  QrCode,
  GraduationCap
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
        const res = await axios.get('attendance');
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
    { name: 'Present', value: summary.present, color: '#0f4c81' }, // primary
    { name: 'Absent', value: summary.absent, color: '#ef4444' }, // red
    { name: 'Late', value: summary.late, color: '#f59e0b' }, // accent
  ];

  const subjectData = [
    { name: 'Maths', percentage: 85 },
    { name: 'Physics', percentage: 70 },
    { name: 'CS', percentage: 95 },
    { name: 'English', percentage: 80 },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Overview</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Student Portal • Session 2026-27</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95"
          >
            <QrCode size={18} />
            Scan Class QR
          </button>
          <button className="bg-white text-slate-700 px-6 py-3 rounded-lg font-bold border border-slate-200 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
            <Download size={18} />
            Export Transcript
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
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
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

      {/* Low Attendance Alert */}
      {summary.total > 0 && summary.percentage < 75 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl flex items-start gap-4 shadow-sm"
        >
          <div className="p-2 bg-red-100 text-red-600 rounded-lg mt-1">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-red-800 font-black uppercase text-xs tracking-widest">Low Attendance Warning</h3>
            <p className="text-red-700/80 text-sm font-bold">
              Your cumulative attendance is currently <span className="underline">{summary.percentage}%</span>. 
              This is below the mandatory <span className="font-black">75%</span> threshold required for examination eligibility. 
              Please contact your department head immediately.
            </p>
          </div>
        </motion.div>
      )}

      {/* Profile summary */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black text-3xl border-2 border-slate-200">
           {user?.name?.charAt(0)}
        </div>
        <div className="flex-grow text-center md:text-left">
           <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Roll No: {user?.rollNumber || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
             <p className="text-sm font-bold text-slate-800">{user?.department || 'B.Sc CS'}</p>
           </div>
           <div className="w-px h-8 bg-slate-200"></div>
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</p>
             <p className="text-sm font-bold text-slate-800">Sem {user?.semester || '4'}</p>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          icon={<TrendingUp />}
          label="Cumulative Attendance"
          value={`${summary.percentage}%`}
          color="text-primary"
          bg="bg-blue-50"
        />
        <SummaryCard 
          icon={<BookOpen />}
          label="Total Lectures"
          value={summary.total}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <SummaryCard 
          icon={<AlertCircle />}
          label="Total Absences"
          value={summary.absent}
          color="text-red-600"
          bg="bg-red-50"
        />
        <SummaryCard 
          icon={<Calendar />}
          label="Late Marks"
          value={summary.late}
          color="text-accent"
          bg="bg-yellow-50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Subject Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900">Module Performance</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance by Subject</p>
          </div>
          <div className="p-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="percentage" 
                  fill="#0f4c81" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:col-span-1">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900">Attendance Ratio</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current Semester</p>
          </div>
          <div className="p-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 pb-6">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-900">Recent Logs</h3>
          <span className="text-xs font-black text-primary cursor-pointer hover:underline uppercase tracking-widest">View Archives</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Course Module</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.slice(0, 5).map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 font-bold text-slate-700 text-sm">
                    {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-800">
                    {record.subjectId?.subjectName || 'General Module'}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                      record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      record.status === 'Absent' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-500">
                    {record.teacherId?.name || 'Faculty Staff'}
                  </td>
                </tr>
              ))}
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-bold italic">
                    No academic records found for current term.
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

const SummaryCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-primary/20 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`${bg} ${color} p-3 rounded-xl transition-transform group-hover:scale-110 duration-500`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Term</span>
    </div>
    <div className="mt-6 space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 leading-tight">{value}</h3>
    </div>
  </div>
);

export default StudentDashboard;