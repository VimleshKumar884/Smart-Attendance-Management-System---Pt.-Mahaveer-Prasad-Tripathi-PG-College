/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Loader2, Plus, Search, Trash2, UserRoundCheck, X } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, SECURITY_QUESTIONS } from '../lib/helpers';

const emptyForm = {
  name: '',
  email: '',
  employeeId: '',
  password: '',
  department: '',
  phone: '',
  role: 'teacher',
  securityQuestion: SECURITY_QUESTIONS[0],
  securityAnswer: '',
};

const emptySubjectForm = {
  subjectName: '',
  subjectCode: '',
  department: '',
  semester: 1,
  section: 'A',
};

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectError, setSubjectError] = useState('');
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, subjectsRes, assignmentsRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/subjects'),
        axios.get('/assignments'),
      ]);
      setTeachers((usersRes.data.data || []).filter((user) => user.role === 'teacher'));
      setSubjects(subjectsRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      setError(getFriendlyError(err, 'Could not load faculty records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignmentsByTeacher = useMemo(() => {
    return assignments.reduce((map, assignment) => {
      const teacherId = assignment.facultyId?._id || assignment.facultyId;
      if (!teacherId) return map;
      map[teacherId] = [...(map[teacherId] || []), assignment];
      return map;
    }, {});
  }, [assignments]);

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) => {
      const teacherAssignments = assignmentsByTeacher[teacher._id] || [];
      return teacher.name?.toLowerCase().includes(term)
        || teacher.email?.toLowerCase().includes(term)
        || teacher.employeeId?.toLowerCase().includes(term)
        || teacher.department?.toLowerCase().includes(term)
        || teacherAssignments.some((assignment) => assignment.subjectId?.subjectName?.toLowerCase().includes(term));
    });
  }, [assignmentsByTeacher, searchTerm, teachers]);

  const filteredSubjects = useMemo(() => {
    const term = subjectSearch.trim().toLowerCase();
    if (!term) return subjects;
    return subjects.filter((subject) => subject.subjectName?.toLowerCase().includes(term)
      || subject.subjectCode?.toLowerCase().includes(term)
      || subject.department?.toLowerCase().includes(term)
      || subject.section?.toLowerCase().includes(term));
  }, [subjectSearch, subjects]);

  const selectedSubjects = useMemo(() => {
    return selectedSubjectIds
      .map((id) => subjects.find((subject) => subject._id === id))
      .filter(Boolean);
  }, [selectedSubjectIds, subjects]);

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ ...emptyForm, password: 'password123' });
    setSelectedSubjectIds([]);
    setFormErrors({});
    setSubjectSearch('');
    setShowSubjectForm(false);
    setSubjectForm(emptySubjectForm);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      ...emptyForm,
      name: teacher.name || '',
      email: teacher.email || '',
      employeeId: teacher.employeeId || '',
      password: '',
      department: teacher.department || '',
      phone: teacher.phone || '',
      securityQuestion: teacher.securityQuestion || SECURITY_QUESTIONS[0],
      securityAnswer: teacher.securityAnswer || '',
    });
    setSelectedSubjectIds((assignmentsByTeacher[teacher._id] || []).map((assignment) => assignment.subjectId?._id || assignment.subjectId));
    setFormErrors({});
    setSubjectSearch('');
    setShowSubjectForm(false);
    setSubjectForm(emptySubjectForm);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.email.trim()) nextErrors.email = 'Email is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email.';
    if (!formData.employeeId.trim()) nextErrors.employeeId = 'Employee ID is required.';
    if (!editingTeacher && formData.password.trim().length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    if (!formData.securityQuestion) nextErrors.securityQuestion = 'Select a security question.';
    if (!formData.securityAnswer.trim()) nextErrors.securityAnswer = 'Security answer is required.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const syncAssignments = async (facultyId) => {
    const payload = selectedSubjects.map((subject) => ({
      subjectId: subject._id,
      semester: subject.semester || 1,
      section: subject.section || 'A',
    }));
    await axios.put(`/assignments/faculty/${facultyId}`, { assignments: payload });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId,
        department: formData.department,
        phone: formData.phone,
        role: 'teacher',
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        subject: selectedSubjects.map((subject) => subject.subjectName).join(', '),
      };
      if (!editingTeacher) payload.password = formData.password;

      const res = editingTeacher
        ? await axios.put(`/users/${editingTeacher._id}`, payload)
        : await axios.post('/users', payload);
      const facultyId = editingTeacher?._id || res.data.data._id;

      await syncAssignments(facultyId);
      showToast('Faculty details and subjects saved successfully.', 'success');
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not save faculty details.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.name}?`)) return;

    try {
      await axios.put(`/assignments/faculty/${teacher._id}`, { assignments: [] });
      await axios.delete(`/users/${teacher._id}`);
      showToast('Faculty deleted successfully.', 'success');
      await fetchData();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not delete faculty.'), 'error');
    }
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjectIds((current) => (
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    ));
  };

  const handleAddSubject = async () => {
    setSubjectError('');
    if (!subjectForm.subjectName.trim()) {
      setSubjectError('Subject name is required.');
      return;
    }
    if (!subjectForm.subjectCode.trim()) {
      setSubjectError('Subject code is required.');
      return;
    }
    if (subjects.some((subject) => subject.subjectCode.toLowerCase() === subjectForm.subjectCode.trim().toLowerCase())) {
      setSubjectError('Subject code already exists.');
      return;
    }

    setSubjectSaving(true);
    try {
      const res = await axios.post('/subjects', {
        subjectName: subjectForm.subjectName,
        subjectCode: subjectForm.subjectCode,
        department: subjectForm.department || formData.department || 'General',
        semester: Number(subjectForm.semester) || 1,
        section: subjectForm.section || 'A',
      });
      setSubjects((current) => [...current, res.data.data]);
      setSelectedSubjectIds((current) => [...current, res.data.data._id]);
      setSubjectForm(emptySubjectForm);
      setShowSubjectForm(false);
      showToast('Subject added successfully.', 'success');
    } catch (err) {
      setSubjectError(getFriendlyError(err, 'Could not add subject.'));
    } finally {
      setSubjectSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading faculty records..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
            <UserRoundCheck className="text-primary" size={30} />
            Faculty Management
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Create faculty accounts, security questions, and subject assignments.</p>
        </div>
        <button type="button" onClick={openAddModal} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark">
          <Plus size={19} />
          Add Faculty
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, employee ID, email, department, or subject" className="input-field min-h-11 pl-10" />
        </div>
      </div>

      <div className="hidden md:block table-shell">
        <table className="w-full border-collapse text-left">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Faculty</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Assigned Subjects</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr key={teacher._id} className="table-row">
                <td className="px-5 py-4">
                  <p className="font-black text-slate-900">{teacher.name}</p>
                  <p className="text-sm font-medium text-slate-500">{teacher.employeeId || 'No Employee ID'} · {teacher.email}</p>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">{teacher.department || 'N/A'}</td>
                <td className="px-5 py-4"><AssignmentChips assignments={assignmentsByTeacher[teacher._id] || []} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEditModal(teacher)} className="tap-target rounded-lg border border-slate-200 px-4 font-bold text-slate-700">Edit</button>
                    <button type="button" onClick={() => handleDelete(teacher)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50" aria-label="Delete faculty"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredTeachers.length && <EmptyState label="No faculty found." />}
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredTeachers.map((teacher) => (
          <div key={teacher._id} className="mobile-card">
            <h3 className="font-black text-slate-950">{teacher.name}</h3>
            <p className="text-sm font-semibold text-slate-500">{teacher.employeeId || 'No Employee ID'} · {teacher.email}</p>
            <p className="mt-2 text-sm font-medium text-slate-600">{teacher.department || 'N/A'}</p>
            <div className="mt-3"><AssignmentChips assignments={assignmentsByTeacher[teacher._id] || []} /></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openEditModal(teacher)} className="tap-target rounded-lg border border-slate-200 font-bold text-slate-700">Edit</button>
              <button type="button" onClick={() => handleDelete(teacher)} className="tap-target rounded-lg border border-red-200 font-bold text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {!filteredTeachers.length && <EmptyState label="No faculty found." />}
      </div>

      <FacultyModal
        open={isModalOpen}
        editing={Boolean(editingTeacher)}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        subjects={filteredSubjects}
        allSubjects={subjects}
        subjectSearch={subjectSearch}
        setSubjectSearch={setSubjectSearch}
        selectedSubjectIds={selectedSubjectIds}
        selectedSubjects={selectedSubjects}
        toggleSubject={toggleSubject}
        showSubjectForm={showSubjectForm}
        setShowSubjectForm={setShowSubjectForm}
        subjectForm={subjectForm}
        setSubjectForm={setSubjectForm}
        subjectError={subjectError}
        subjectSaving={subjectSaving}
        onAddSubject={handleAddSubject}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
};

const AssignmentChips = ({ assignments }) => {
  if (!assignments.length) return <span className="text-sm font-semibold text-slate-400">No subject assigned</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {assignments.map((assignment) => (
        <span key={assignment._id} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-primary">
          <BookOpen size={14} />
          {assignment.subjectId?.subjectName || 'Subject'} · {assignment.subjectId?.subjectCode || 'Code'} · {assignment.subjectId?.department || 'Class'} / {assignment.section || assignment.subjectId?.section || 'A'}
        </span>
      ))}
    </div>
  );
};

const EmptyState = ({ label }) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">{label}</div>
);

const FacultyModal = (props) => {
  const {
    open, editing, formData, setFormData, formErrors, subjects, subjectSearch, setSubjectSearch,
    selectedSubjectIds, selectedSubjects, toggleSubject, showSubjectForm, setShowSubjectForm,
    subjectForm, setSubjectForm, subjectError, subjectSaving, onAddSubject, onClose, onSubmit, saving,
  } = props;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">{editing ? 'Edit Faculty' : 'Create Faculty'}</h2>
                <p className="text-sm font-semibold text-slate-500">Basic details, security question, and subject assignments.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 p-5">
              <section>
                <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-500">Faculty Basic Details</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Name" name="name" value={formData.name} error={formErrors.name} onChange={setFormData} />
                  <Field label="Email" name="email" type="email" value={formData.email} error={formErrors.email} onChange={setFormData} />
                  <Field label="Employee ID" name="employeeId" value={formData.employeeId} error={formErrors.employeeId} onChange={setFormData} />
                  {!editing && <Field label="Password" name="password" type="password" value={formData.password} error={formErrors.password} onChange={setFormData} />}
                  <Field label="Department" name="department" value={formData.department} onChange={setFormData} />
                  <Field label="Phone Number" name="phone" value={formData.phone} onChange={setFormData} />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-500">Security Question Setup</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700" htmlFor="securityQuestion">Security Question</label>
                    <select id="securityQuestion" value={formData.securityQuestion} onChange={(event) => setFormData((current) => ({ ...current, securityQuestion: event.target.value }))} className={`input-field min-h-11 ${formErrors.securityQuestion ? 'border-red-300' : ''}`}>
                      {SECURITY_QUESTIONS.map((question) => <option key={question} value={question}>{question}</option>)}
                    </select>
                    {formErrors.securityQuestion && <p className="text-sm font-semibold text-red-600">{formErrors.securityQuestion}</p>}
                  </div>
                  <Field label="Security Answer" name="securityAnswer" value={formData.securityAnswer} error={formErrors.securityAnswer} onChange={setFormData} />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Assign Subjects</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Select one or more subjects from database.</p>
                  </div>
                  <button type="button" onClick={() => setShowSubjectForm((value) => !value)} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700">
                    <Plus size={17} />
                    Add New Subject
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="search" value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Search subjects" className="input-field min-h-11 pl-10" />
                </div>

                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200">
                  {subjects.map((subject) => {
                    const checked = selectedSubjectIds.includes(subject._id);
                    return (
                      <button type="button" key={subject._id} onClick={() => toggleSubject(subject._id)} className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 ${checked ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${checked ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'}`}>{checked && <Check size={15} />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-black text-slate-900">{subject.subjectName}</span>
                          <span className="block text-sm font-semibold text-slate-500">{subject.subjectCode} · {subject.department || 'Class'} / {subject.section || 'A'} · Sem {subject.semester || 'N/A'}</span>
                        </span>
                      </button>
                    );
                  })}
                  {!subjects.length && <div className="p-5 text-center text-sm font-semibold text-slate-400">No subjects found.</div>}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSubjects.map((subject) => (
                      <span key={subject._id} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-primary">
                        {subject.subjectName}
                        <button type="button" onClick={() => toggleSubject(subject._id)} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white"><X size={13} /></button>
                      </span>
                    ))}
                  </div>
                )}

                {showSubjectForm && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 md:grid-cols-5">
                      <SmallField label="Subject Name" name="subjectName" value={subjectForm.subjectName} onChange={setSubjectForm} />
                      <SmallField label="Subject Code" name="subjectCode" value={subjectForm.subjectCode} onChange={setSubjectForm} />
                      <SmallField label="Class / Department" name="department" value={subjectForm.department} onChange={setSubjectForm} />
                      <SmallField label="Section" name="section" value={subjectForm.section} onChange={setSubjectForm} />
                      <SmallField label="Semester" name="semester" type="number" value={subjectForm.semester} onChange={setSubjectForm} />
                    </div>
                    {subjectError && <p className="mt-3 text-sm font-semibold text-red-600">{subjectError}</p>}
                    <button type="button" onClick={onAddSubject} disabled={subjectSaving} className="tap-target mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white disabled:opacity-70">
                      {subjectSaving && <Loader2 className="animate-spin" size={17} />}
                      Save Subject
                    </button>
                  </div>
                )}
              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 md:flex-row md:justify-end">
                <button type="button" onClick={onClose} className="tap-target rounded-lg border border-slate-200 px-5 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white disabled:opacity-70">
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  Save Faculty
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, name, value, onChange, error, type = 'text' }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700" htmlFor={name}>{label}</label>
    <input id={name} name={name} type={type} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className={`input-field min-h-11 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`} />
    {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
  </div>
);

const SmallField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-wide text-slate-500" htmlFor={`subject-${name}`}>{label}</label>
    <input id={`subject-${name}`} type={type} value={value} onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))} className="input-field min-h-11" />
  </div>
);

export default ManageTeachers;
