import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Save, 
  Loader2,
  Calendar as CalendarIcon,
  CheckSquare,
  QrCode as QrIcon,
  Users as UsersIcon,
  Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import AttendanceQR from '../components/AttendanceQR';

const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [lectureNo, setLectureNo] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: status }
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('assignments');
        setAssignments(res.data.data);
      } catch (err) {
        console.error('Error fetching assignments');
      }
    };
    fetchAssignments();
  }, []);

  const handleAssignmentChange = async (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    if (!assignmentId) {
      setStudents([]);
      return;
    }
    
    setFetchingStudents(true);
    try {
      const assignment = assignments.find(a => a._id === assignmentId);
      const res = await axios.get('users');
      // Filter students matching the section and semester of the assignment
      const studentList = res.data.data.filter(u => 
        u.role === 'student' && 
        u.section === assignment.section && 
        u.semester === assignment.semester
      );
      setStudents(studentList);
      
      // Initialize all as Present by default
      const initialAttendance = {};
      studentList.forEach(s => initialAttendance[s._id] = 'Present');
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error fetching students');
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedAssignmentId) return alert('Please select an assigned class');
    if (!lectureNo) return alert('Please enter lecture number');
    
    setLoading(true);
    try {
      const assignment = assignments.find(a => a._id === selectedAssignmentId);
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));
      
      await axios.post('attendance', {
        subjectId: assignment.subjectId._id,
        section: assignment.section,
        lecture_no: lectureNo,
        records,
        date
      });
      
      alert('Attendance marked successfully!');
      setSelectedAssignmentId('');
      setStudents([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <CheckSquare className="text-primary" size={32} />
            Start Attendance
          </h1>
          <p className="text-slate-500 font-medium">Record daily presence for your assigned classes.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Select Assignment */}
      <div className="glass p-8 rounded-[2rem] space-y-6">
        <div className="grid md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Assigned Classes</label>
            <select 
              value={selectedAssignmentId}
              onChange={(e) => handleAssignmentChange(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 transition-all cursor-pointer"
            >
              <option value="">-- Select Today's Class --</option>
              {assignments.map(a => (
                <option key={a._id} value={a._id}>
                  {a.subjectId?.subjectName} - Section {a.section} (Sem {a.semester})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Lecture No.</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number"
                min="1"
                value={lectureNo}
                onChange={(e) => setLectureNo(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner max-w-sm mt-4">
          <button 
            onClick={() => setMode('manual')}
            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'manual' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UsersIcon size={18} />
            Manual List
          </button>
          <button 
            onClick={() => setMode('qr')}
            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'qr' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <QrIcon size={18} />
            QR Mode
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      {selectedAssignmentId && (
        mode === 'manual' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-bold text-slate-800">Student List ({students.length})</h3>
              <div className="flex items-center gap-4 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl border border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fetchingStudents ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="font-bold text-slate-400">Fetching assigned students...</p>
                </div>
              ) : students.length === 0 ? (
                 <div className="col-span-full py-10 text-center">
                   <p className="text-slate-400 font-bold italic">No students found in this section/semester.</p>
                 </div>
              ) : students.map((student) => (
                <motion.div 
                  layout
                  key={student._id}
                  className="glass p-6 rounded-3xl flex items-center justify-between border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm truncate max-w-[120px]">{student.name}</p>
                      <p className="text-xs font-bold text-slate-400">{student.rollNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                    <StatusButton 
                      active={attendance[student._id] === 'Present'} 
                      onClick={() => handleStatusChange(student._id, 'Present')}
                      icon={<CheckCircle2 size={18} />}
                      color="text-emerald-500"
                      activeBg="bg-emerald-500"
                    />
                    <StatusButton 
                      active={attendance[student._id] === 'Absent'} 
                      onClick={() => handleStatusChange(student._id, 'Absent')}
                      icon={<XCircle size={18} />}
                      color="text-red-500"
                      activeBg="bg-red-500"
                    />
                    <StatusButton 
                      active={attendance[student._id] === 'Late'} 
                      onClick={() => handleStatusChange(student._id, 'Late')}
                      icon={<Clock size={18} />}
                      color="text-orange-500"
                      activeBg="bg-orange-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="sticky bottom-8 flex justify-center pt-8">
              <button 
                onClick={handleSubmit}
                disabled={loading || students.length === 0}
                className="bg-primary text-white px-12 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-primary/40 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                Submit Attendance
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-8">
            <AttendanceQR subjectId={assignments.find(a => a._id === selectedAssignmentId)?.subjectId?._id} />
          </div>
        )
      )}
    </div>
  );
};

const StatusButton = ({ active, onClick, icon, color, activeBg }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl transition-all ${
      active 
        ? `${activeBg} text-white shadow-lg scale-110` 
        : `bg-transparent ${color} hover:bg-white`
    }`}
  >
    {icon}
  </button>
);

export default MarkAttendance;