/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, GraduationCap, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, percentageClass } from '../lib/helpers';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  rollNumber: '',
  dob: '',
  department: '',
  semester: 1,
  section: 'A',
  role: 'student',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'blue',
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/users');
      setStudents((res.data.data || []).filter((user) => user.role === 'student'));
    } catch (err) {
      setError(getFriendlyError(err, 'Could not load students.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const departments = useMemo(() => {
    const values = students.map((student) => student.department).filter(Boolean);
    return [...new Set(values)].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesTerm = !term
        || student.name?.toLowerCase().includes(term)
        || student.email?.toLowerCase().includes(term)
        || student.rollNumber?.toLowerCase().includes(term);
      const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
      return matchesTerm && matchesDepartment;
    });
  }, [departmentFilter, searchTerm, students]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ ...emptyForm, password: 'password123' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      ...emptyForm,
      name: student.name || '',
      email: student.email || '',
      password: '',
      rollNumber: student.rollNumber || '',
      dob: student.dob || '',
      department: student.department || '',
      semester: student.semester || 1,
      section: student.section || 'A',
      securityQuestion: student.securityQuestion || emptyForm.securityQuestion,
      securityAnswer: student.securityAnswer || emptyForm.securityAnswer,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.email.trim()) nextErrors.email = 'Email is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email.';
    if (!editingStudent && !formData.password.trim()) nextErrors.password = 'Password is required.';
    if (!formData.rollNumber.trim()) nextErrors.rollNumber = 'Roll number is required.';
    if (!formData.dob.trim()) nextErrors.dob = 'Date of birth is required.';
    if (!formData.department.trim()) nextErrors.department = 'Department is required.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = { ...formData, role: 'student', semester: Number(formData.semester) || 1 };
      if (editingStudent) {
        delete payload.password;
        await axios.put(`/users/${editingStudent._id}`, payload);
        showToast('Student updated successfully.', 'success');
      } else {
        await axios.post('/users', payload);
        showToast('Student added successfully.', 'success');
      }
      setIsModalOpen(false);
      await fetchStudents();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not save student.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;

    try {
      await axios.delete(`/users/${student._id}`);
      showToast('Student deleted successfully.', 'success');
      await fetchStudents();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not delete student.'), 'error');
    }
  };

  if (loading) return <Spinner label="Loading students..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <GraduationCap className="text-primary" size={30} />
            Student Management
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Add, edit, delete, search, and filter student records.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <Plus size={19} />
          Add Student
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, roll number, or email"
            className="input-field min-h-11 pl-10"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
          className="input-field min-h-11"
        >
          <option value="all">All Departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>

      <div className="hidden md:block table-shell">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Roll No</th>
              <th className="px-5 py-4">Class</th>
              <th className="px-5 py-4">Attendance</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id} className="table-row">
                <td className="px-5 py-4">
                  <p className="font-black text-slate-900">{student.name}</p>
                  <p className="text-sm font-medium text-slate-500">{student.email}</p>
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">{student.rollNumber || 'N/A'}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {student.department || 'General'} · Sem {student.semester || 'N/A'} · Section {student.section || 'N/A'}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${percentageClass(student.attendancePercentage || 0)}`}>
                    {Math.round(student.attendancePercentage || 0)}%
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEditModal(student)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Edit student">
                      <Edit size={18} />
                    </button>
                    <button type="button" onClick={() => handleDelete(student)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label="Delete student">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredStudents.length && <EmptyState label="No students found." />}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredStudents.map((student) => (
          <div key={student._id} className="mobile-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">{student.name}</h3>
                <p className="text-sm font-semibold text-slate-500">{student.rollNumber || 'N/A'}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${percentageClass(student.attendancePercentage || 0)}`}>
                {Math.round(student.attendancePercentage || 0)}%
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">{student.email}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{student.department || 'General'} · Sem {student.semester || 'N/A'} · Section {student.section || 'N/A'}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openEditModal(student)} className="tap-target rounded-lg border border-slate-200 font-bold text-slate-700">Edit</button>
              <button type="button" onClick={() => handleDelete(student)} className="tap-target rounded-lg border border-red-200 font-bold text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {!filteredStudents.length && <EmptyState label="No students found." />}
      </div>

      <StudentModal
        open={isModalOpen}
        editing={Boolean(editingStudent)}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
};

const EmptyState = ({ label }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
    {label}
  </div>
);

const StudentModal = ({ open, editing, formData, setFormData, formErrors, onClose, onSubmit, saving }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">{editing ? 'Edit Student' : 'Add Student'}</h2>
              <p className="text-sm font-semibold text-slate-500">Student profile and class details.</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Full Name" name="name" value={formData.name} error={formErrors.name} onChange={setFormData} />
            <Field label="Email" name="email" type="email" value={formData.email} error={formErrors.email} onChange={setFormData} />
            {!editing && <Field label="Password" name="password" type="password" value={formData.password} error={formErrors.password} onChange={setFormData} />}
            <Field label="Roll Number" name="rollNumber" value={formData.rollNumber} error={formErrors.rollNumber} onChange={setFormData} />
            <Field label="Date of Birth" name="dob" type="date" value={formData.dob} error={formErrors.dob} onChange={setFormData} />
            <Field label="Department" name="department" value={formData.department} error={formErrors.department} onChange={setFormData} />
            <Field label="Semester" name="semester" type="number" value={formData.semester} onChange={setFormData} min="1" />
            <Field label="Section" name="section" value={formData.section} onChange={setFormData} />

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 md:col-span-2 md:flex-row md:justify-end">
              <button type="button" onClick={onClose} className="tap-target rounded-lg border border-slate-200 px-5 font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={saving} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-70">
                {saving && <Loader2 className="animate-spin" size={18} />}
                {editing ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Field = ({ label, name, value, onChange, error, type = 'text', ...inputProps }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700" htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
      className={`input-field min-h-11 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
      {...inputProps}
    />
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
  </div>
);

export default ManageStudents;
