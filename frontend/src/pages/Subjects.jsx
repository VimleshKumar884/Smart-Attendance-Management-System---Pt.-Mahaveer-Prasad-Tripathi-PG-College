/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, LibraryBig, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError } from '../lib/helpers';

const emptyForm = {
  subjectName: '',
  subjectCode: '',
  department: '',
  section: 'A',
  semester: 1,
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, assignmentsRes] = await Promise.all([
        axios.get('/subjects'),
        axios.get('/assignments'),
      ]);
      setSubjects(subjectsRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not load subjects.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignmentsBySubject = useMemo(() => {
    return assignments.reduce((map, assignment) => {
      const subjectId = assignment.subjectId?._id || assignment.subjectId;
      if (!subjectId) return map;
      map[subjectId] = [...(map[subjectId] || []), assignment];
      return map;
    }, {});
  }, [assignments]);

  const classOptions = useMemo(() => {
    return [...new Set(subjects.map((subject) => subject.department).filter(Boolean))].sort();
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return subjects.filter((subject) => {
      const matchesTerm = !term
        || subject.subjectName?.toLowerCase().includes(term)
        || subject.subjectCode?.toLowerCase().includes(term)
        || subject.department?.toLowerCase().includes(term)
        || subject.section?.toLowerCase().includes(term);
      const matchesClass = classFilter === 'all' || subject.department === classFilter;
      return matchesTerm && matchesClass;
    });
  }, [classFilter, searchTerm, subjects]);

  const openAdd = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subjectName: subject.subjectName || '',
      subjectCode: subject.subjectCode || '',
      department: subject.department || '',
      section: subject.section || 'A',
      semester: subject.semester || 1,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.subjectName.trim()) errors.subjectName = 'Subject name is required.';
    if (!formData.subjectCode.trim()) errors.subjectCode = 'Subject code is required.';
    const duplicate = subjects.some((subject) => (
      subject.subjectCode.toLowerCase() === formData.subjectCode.trim().toLowerCase()
      && subject._id !== editingSubject?._id
    ));
    if (duplicate) errors.subjectCode = 'Subject code already exists.';
    if (!formData.department.trim()) errors.department = 'Class/department is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...formData, semester: Number(formData.semester) || 1 };
      if (editingSubject) {
        await axios.put(`/subjects/${editingSubject._id}`, payload);
        showToast('Subject updated successfully.', 'success');
      } else {
        await axios.post('/subjects', payload);
        showToast('Subject added successfully.', 'success');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not save subject.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subject) => {
    const subjectAssignments = assignmentsBySubject[subject._id] || [];
    let message = `Delete ${subject.subjectName}?`;
    if (subjectAssignments.length) {
      const facultyNames = [...new Set(subjectAssignments.map((item) => item.facultyId?.name).filter(Boolean))].join(', ');
      message = `This subject is assigned to ${facultyNames || 'faculty'}. Deleting will remove it from their profile too. Continue?`;
    }
    if (!window.confirm(message)) return;

    try {
      await axios.delete(`/subjects/${subject._id}`);
      showToast('Subject deleted successfully.', 'success');
      await fetchData();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not delete subject.'), 'error');
    }
  };

  if (loading) return <Spinner label="Loading subjects..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <LibraryBig className="text-primary" size={30} />
            Subjects
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Single source of truth for subject records and assigned faculty.</p>
        </div>
        <button type="button" onClick={openAdd} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark">
          <Plus size={19} />
          Add Subject
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search subjects" className="input-field min-h-11 pl-10" />
        </div>
        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="input-field min-h-11">
          <option value="all">All Classes</option>
          {classOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="hidden md:block table-shell">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Subject Name</th>
              <th className="px-5 py-4">Code</th>
              <th className="px-5 py-4">Class</th>
              <th className="px-5 py-4">Assigned Faculty</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((subject) => (
              <tr key={subject._id} className="table-row">
                <td className="px-5 py-4 font-black text-slate-900">{subject.subjectName}</td>
                <td className="px-5 py-4 text-sm font-bold text-slate-700">{subject.subjectCode}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{subject.department} / {subject.section || 'A'} · Sem {subject.semester}</td>
                <td className="px-5 py-4"><FacultyList assignments={assignmentsBySubject[subject._id] || []} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(subject)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"><Edit size={18} /></button>
                    <button type="button" onClick={() => handleDelete(subject)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredSubjects.length && <EmptyState />}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredSubjects.map((subject) => (
          <div key={subject._id} className="mobile-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">{subject.subjectName}</h3>
                <p className="text-sm font-semibold text-slate-500">{subject.subjectCode}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-primary">{subject.department} / {subject.section || 'A'}</span>
            </div>
            <div className="mt-3"><FacultyList assignments={assignmentsBySubject[subject._id] || []} /></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openEdit(subject)} className="tap-target rounded-lg border border-slate-200 font-bold text-slate-700">Edit</button>
              <button type="button" onClick={() => handleDelete(subject)} className="tap-target rounded-lg border border-red-200 font-bold text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {!filteredSubjects.length && <EmptyState />}
      </div>

      <SubjectModal open={modalOpen} editing={Boolean(editingSubject)} formData={formData} setFormData={setFormData} formErrors={formErrors} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSave} />
    </div>
  );
};

const FacultyList = ({ assignments }) => {
  if (!assignments.length) return <span className="text-sm font-semibold text-slate-400">Not assigned</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {assignments.map((assignment) => (
        <span key={assignment._id} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {assignment.facultyId?.name || 'Faculty'}
        </span>
      ))}
    </div>
  );
};

const SubjectModal = ({ open, editing, formData, setFormData, formErrors, saving, onClose, onSubmit }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/50" />
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
              <p className="text-sm font-semibold text-slate-500">Subject name, code, class, section, and semester.</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Subject Name" name="subjectName" value={formData.subjectName} error={formErrors.subjectName} onChange={setFormData} />
            <Field label="Subject Code" name="subjectCode" value={formData.subjectCode} error={formErrors.subjectCode} onChange={setFormData} />
            <Field label="Class / Department" name="department" value={formData.department} error={formErrors.department} onChange={setFormData} />
            <Field label="Section" name="section" value={formData.section} onChange={setFormData} />
            <Field label="Semester" name="semester" type="number" value={formData.semester} onChange={setFormData} />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 md:col-span-2 md:flex-row md:justify-end">
              <button type="button" onClick={onClose} className="tap-target rounded-lg border border-slate-200 px-5 font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={saving} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-70">
                {saving && <Loader2 className="animate-spin" size={18} />}
                Save Subject
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Field = ({ label, name, value, onChange, error, type = 'text' }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700" htmlFor={name}>{label}</label>
    <input id={name} type={type} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className={`input-field min-h-11 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`} />
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
  </div>
);

const EmptyState = () => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">No subjects found.</div>
);

export default Subjects;
