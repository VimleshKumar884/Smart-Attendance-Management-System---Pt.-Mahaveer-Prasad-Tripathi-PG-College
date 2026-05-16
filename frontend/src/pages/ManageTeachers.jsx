import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Edit, 
  X, 
  UserPlus,
  Loader2,
  UserSquare2,
  Mail,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    department: '',
    role: 'teacher',
    securityQuestion: 'What is your favorite color?',
    securityAnswer: ''
  });

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('users');
      setTeachers(res.data.data.filter(u => u.role === 'teacher'));
    } catch (err) {
      console.error('Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('users', formData);
      setIsModalOpen(false);
      fetchTeachers();
      setFormData({
        name: '', email: '', password: '', subject: '',
        department: '', role: 'teacher', securityQuestion: 'What is your favorite color?', securityAnswer: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <UserSquare2 className="text-secondary" size={32} />
            Teacher Management
          </h1>
          <p className="text-slate-500 font-medium">Manage faculty records and subject assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary/25 hover:bg-secondary-dark transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} />
          Add New Teacher
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all font-medium"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-secondary" size={40} />
          <p className="font-bold text-slate-400">Loading faculty data...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="glass p-20 rounded-[2rem] text-center">
          <p className="font-bold text-slate-400 italic text-lg">No faculty members found matching your search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <motion.div 
              layout
              key={teacher._id}
              className="glass p-8 rounded-[2rem] space-y-6 hover:shadow-xl transition-all border border-transparent hover:border-secondary/10 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary/10 to-secondary/5 flex items-center justify-center text-secondary font-bold text-2xl group-hover:rotate-6 transition-transform">
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{teacher.name}</h3>
                  <p className="text-sm font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-lg inline-block">{teacher.department || 'Faculty'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={18} />
                  <span className="text-sm font-medium">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <BookOpen size={18} />
                  <span className="text-sm font-medium">{teacher.subject || 'Not Assigned'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button className="p-3 text-slate-400 hover:text-secondary hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
                  <Edit size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Add Teacher</h3>
                    <p className="text-sm font-medium text-slate-400">Onboard a new faculty member to the system.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={v => setFormData({...formData, name: v})} 
                    placeholder="Dr. Sarah Johnson"
                    theme="secondary"
                  />
                  <InputField 
                    label="Email Address" 
                    type="email" 
                    value={formData.email} 
                    onChange={v => setFormData({...formData, email: v})} 
                    placeholder="sarah@college.edu"
                    theme="secondary"
                  />
                  <InputField 
                    label="Access Password" 
                    type="password"
                    value={formData.password} 
                    onChange={v => setFormData({...formData, password: v})} 
                    placeholder="••••••••"
                    theme="secondary"
                    required={!isEditMode}
                  />
                  <InputField 
                    label="Assigned Subject" 
                    value={formData.subject} 
                    onChange={v => setFormData({...formData, subject: v})} 
                    placeholder="e.g. Data Structures"
                    theme="secondary"
                  />
                  <InputField 
                    label="Department" 
                    value={formData.department} 
                    onChange={v => setFormData({...formData, department: v})} 
                    placeholder="Computer Science"
                    theme="secondary"
                  />
                  
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-6 bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                    <InputField 
                      label="Security Question" 
                      value={formData.securityQuestion} 
                      onChange={v => setFormData({...formData, securityQuestion: v})} 
                      placeholder="e.g. What is your favorite color?"
                      theme="secondary"
                    />
                    <InputField 
                      label="Security Answer" 
                      value={formData.securityAnswer} 
                      onChange={v => setFormData({...formData, securityAnswer: v})} 
                      placeholder="e.g. blue"
                      theme="secondary"
                      required={!isEditMode}
                    />
                  </div>
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
                    className="px-10 py-4 bg-secondary text-white rounded-xl font-bold shadow-xl shadow-secondary/20 hover:bg-secondary-dark transition-all active:scale-95"
                  >
                    Register Teacher
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

const InputField = ({ label, value, onChange, type = 'text', placeholder, theme = 'primary' }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-slate-700 ${
        theme === 'primary' ? 'focus:ring-primary/20 focus:border-primary' : 'focus:ring-secondary/20 focus:border-secondary'
      }`}
    />
  </div>
);

export default ManageTeachers;
