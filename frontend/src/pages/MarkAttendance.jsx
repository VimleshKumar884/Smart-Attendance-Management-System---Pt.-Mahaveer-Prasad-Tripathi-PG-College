/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, CalendarCheck2, LockKeyhole, Loader2, Save, Search, XCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, todayInputValue, toDateKey } from '../lib/helpers';

const statuses = [
  { value: 'Present', label: 'Present', icon: CheckCircle2, active: 'bg-emerald-600 text-white', idle: 'text-emerald-700 hover:bg-emerald-50' },
  { value: 'Absent', label: 'Absent', icon: XCircle, active: 'bg-red-600 text-white', idle: 'text-red-700 hover:bg-red-50' },
  { value: 'Late', label: 'Late', icon: Clock, active: 'bg-amber-500 text-white', idle: 'text-amber-700 hover:bg-amber-50' },
];

const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [lectureNo, setLectureNo] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assignmentsRes, historyRes] = await Promise.all([
        axios.get('/assignments'),
        axios.get('/attendance'),
      ]);
      setAssignments(assignmentsRes.data.data || []);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      setError(getFriendlyError(err, 'Could not load attendance setup.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedAssignment = useMemo(() => {
    return assignments.find((assignment) => assignment._id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  const existingRecords = useMemo(() => {
    if (!selectedAssignment) return [];
    const subjectId = selectedAssignment.subjectId?._id || selectedAssignment.subjectId;
    return history.filter((record) => {
      const recordSubjectId = record.subjectId?._id || record.subjectId;
      return recordSubjectId === subjectId
        && record.section === selectedAssignment.section
        && Number(record.lecture_no) === Number(lectureNo)
        && toDateKey(record.date) === date;
    });
  }, [date, history, lectureNo, selectedAssignment]);

  const isLocked = existingRecords.length > 0;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedAssignment) {
        setStudents([]);
        setAttendance({});
        return;
      }

      setStudentsLoading(true);
      try {
        const res = await axios.get('/users');
        const list = (res.data.data || []).filter((user) => user.role === 'student'
          && user.section === selectedAssignment.section
          && Number(user.semester) === Number(selectedAssignment.semester));
        setStudents(list);
      } catch (err) {
        showToast(getFriendlyError(err, 'Could not load students for this class.'), 'error');
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedAssignment, showToast]);

  useEffect(() => {
    if (!selectedAssignment) return;
    if (isLocked) {
      const lockedMap = {};
      existingRecords.forEach((record) => {
        const studentId = record.studentId?._id || record.studentId;
        lockedMap[studentId] = record.status;
      });
      setAttendance(lockedMap);
      return;
    }

    setAttendance((current) => {
      const initial = {};
      students.forEach((student) => {
        initial[student._id] = current[student._id] || 'Absent';
      });
      return initial;
    });
  }, [existingRecords, isLocked, selectedAssignment, students]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) => student.name?.toLowerCase().includes(term) || student.rollNumber?.toLowerCase().includes(term));
  }, [searchTerm, students]);

  const handleSubmit = async () => {
    if (!selectedAssignment) {
      showToast('Please select a subject first.', 'error');
      return;
    }
    if (!date) {
      showToast('Please select a date.', 'error');
      return;
    }
    if (date > todayInputValue()) {
      showToast('Future dates are not allowed.', 'error');
      return;
    }
    if (!lectureNo) {
      showToast('Please enter lecture number.', 'error');
      return;
    }
    if (isLocked) {
      showToast('This attendance is already submitted and locked.', 'error');
      return;
    }
    if (!students.length) {
      showToast('No students found for this class.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const subjectId = selectedAssignment.subjectId?._id || selectedAssignment.subjectId;
      const records = students.map((student) => ({
        studentId: student._id,
        status: attendance[student._id] || 'Absent',
      }));

      await axios.post('/attendance', {
        subjectId,
        subject_id: subjectId,
        section: selectedAssignment.section,
        lecture_no: Number(lectureNo),
        date,
        records,
      });

      showToast('Attendance submitted successfully.', 'success');
      await fetchInitialData();
    } catch (err) {
      showToast(getFriendlyError(err, 'Could not submit attendance.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading attendance workflow..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <CalendarCheck2 className="text-primary" size={30} />
          Mark Attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Select subject and date, then mark each student as present, absent, or late.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_180px_150px]">
          <div className="space-y-2">
            <label htmlFor="assignment" className="text-sm font-bold text-slate-700">Subject</label>
            <select
              id="assignment"
              value={selectedAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              className="input-field min-h-11"
            >
              <option value="">Select subject</option>
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.subjectId?.subjectName || 'Subject'} · Sem {assignment.semester} · Section {assignment.section}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-bold text-slate-700">Date</label>
            <input id="date" type="date" value={date} max={todayInputValue()} onChange={(event) => setDate(event.target.value)} className="input-field min-h-11" />
          </div>
          <div className="space-y-2">
            <label htmlFor="lecture" className="text-sm font-bold text-slate-700">Lecture No.</label>
            <input id="lecture" type="number" min="1" value={lectureNo} onChange={(event) => setLectureNo(event.target.value)} className="input-field min-h-11" />
          </div>
        </div>

        {selectedAssignment && (
          <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold ${
            isLocked ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-100 bg-blue-50 text-primary'
          }`}>
            {isLocked ? <LockKeyhole size={20} className="mt-0.5 shrink-0" /> : <CalendarCheck2 size={20} className="mt-0.5 shrink-0" />}
            {isLocked
              ? 'Attendance for this subject, date, and lecture is locked because it has already been submitted.'
              : 'Student list will load automatically for the selected section and semester.'}
          </div>
        )}
      </section>

      {selectedAssignment && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Students ({students.length})</h2>
              <p className="text-sm font-semibold text-slate-500">Default status is Absent. Mark students actively before submitting.</p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search student"
                className="input-field min-h-11 pl-10"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isLocked || !students.length}
            onClick={() => {
              const allPresent = {};
              students.forEach((student) => {
                allPresent[student._id] = 'Present';
              });
              setAttendance(allPresent);
            }}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={18} />
            Mark All Present
          </button>

          {studentsLoading ? (
            <Spinner label="Loading students..." />
          ) : filteredStudents.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredStudents.map((student) => (
                <div key={student._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-black text-slate-950">{student.name}</h3>
                      <p className="text-sm font-semibold text-slate-500">{student.rollNumber || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {statuses.map((status) => (
                        <StatusButton
                          key={status.value}
                          status={status}
                          active={attendance[student._id] === status.value}
                          disabled={isLocked}
                          onClick={() => setAttendance((current) => ({ ...current, [student._id]: status.value }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              No students found for this class.
            </div>
          )}

          <div className="sticky bottom-20 z-20 flex justify-center md:bottom-6">
            <button
              type="button"
              disabled={submitting || isLocked || !students.length}
              onClick={handleSubmit}
              className="tap-target inline-flex w-full max-w-md items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLocked ? <LockKeyhole size={19} /> : submitting ? <Loader2 className="animate-spin" size={19} /> : <Save size={19} />}
              {isLocked ? 'Attendance Locked' : 'Submit Attendance'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const StatusButton = ({ status, active, disabled, onClick }) => {
  const Icon = status.icon;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={status.label}
      className={`tap-target flex min-w-[64px] items-center justify-center gap-1 rounded-lg border px-2 text-xs font-black transition disabled:cursor-not-allowed ${
        active ? `${status.active} border-transparent` : `border-slate-200 bg-white ${status.idle}`
      }`}
    >
      <Icon size={16} />
      <span className="hidden min-[420px]:inline">{status.label}</span>
    </button>
  );
};

export default MarkAttendance;
