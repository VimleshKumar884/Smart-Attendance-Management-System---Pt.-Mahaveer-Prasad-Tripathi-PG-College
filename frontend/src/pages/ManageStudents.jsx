import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X, 
  UserPlus,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    rollNumber: '',
    department: '',
    semester: 1,
    section: 'A',
    role: 'student'
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setStudents(res.data.data.filter(u => u.role === 'student'));
    } catch (err) {
      console.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      setIsModalOpen(false);
      fetchStudents();
      setFormData({
        name: '', email: '', password: 'password123', rollNumber: '',
        department: '', semester: 1, section: 'A', role: 'student'
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-primary" size={32} />
            Student Management
          </h1>
          <p className="text-slate-500 font-medium">Manage and monitor student records effortlessly.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} />
          Add New Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="bg-white border border-slate-200 px-4 py-3 rounded-xl focus:outline-none font-semibold text-slate-600 w-full">
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Mathematics</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Student Info</th>
                <th className="px-8 py-5">Roll Number</th>
                <th className="px-8 py-5">Course Details</th>
                <th className="px-8 py-5">Attendance</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="font-bold text-slate-400">Loading students...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <p className="font-bold text-slate-400 italic">No students found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-sm text-slate-400 font-medium">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600">{student.rollNumber || 'N/A'}</td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">{student.department || 'General'}</p>
                        <p className="text-xs font-semibold text-slate-400 capitalize">Sem {student.semester} • Section {student.section}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-grow w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${student.attendancePercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${student.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {student.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50 px-10 py-8 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Add Student</h3>
                    <p className="text-sm font-medium text-slate-400">Fill in the details to create a new profile.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={v => setFormData({...formData, name: v})} 
                    placeholder="John Doe"
                  />
                  <InputField 
                    label="Email Address" 
                    type="email" 
                    value={formData.email} 
                    onChange={v => setFormData({...formData, email: v})} 
                    placeholder="john@college.edu"
                  />
                  <InputField 
                    label="Roll Number" 
                    value={formData.rollNumber} 
                    onChange={v => setFormData({...formData, rollNumber: v})} 
                    placeholder="CS2026001"
                  />
                  <InputField 
                    label="Department" 
                    value={formData.department} 
                    onChange={v => setFormData({...formData, department: v})} 
                    placeholder="Computer Science"
                  />
                  <InputField 
                    label="Semester" 
                    type="number" 
                    value={formData.semester} 
                    onChange={v => setFormData({...formData, semester: v})} 
                  />
                  <InputField 
                    label="Section" 
                    value={formData.section} 
                    onChange={v => setFormData({...formData, section: v})} 
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-4 bg-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                  >
                    Register Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-slate-700"
    />
  </div>
);

export default ManageStudents;