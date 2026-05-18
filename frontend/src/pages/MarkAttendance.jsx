/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { CalendarCheck2, Loader2, Save, X, QrCode, Download } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, todayInputValue } from '../lib/helpers';

const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  
  // Student List State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  
  // Attendance State
  const [attendanceState, setAttendanceState] = useState({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false); 

  // Session/QR State
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const timerRef = useRef(null);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/assignments');
        setAssignments(res.data.data || []);
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load assigned subjects.'));
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const selectedAssignment = useMemo(() => {
    return assignments.find(a => a.subjectId?._id === selectedSubjectId);
  }, [assignments, selectedSubjectId]);

  const isBackdated = useMemo(() => {
    return selectedDate < todayInputValue();
  }, [selectedDate]);

  const loadStudents = async () => {
    if (!selectedAssignment) {
      showToast('Please select a subject first.', 'error');
      return;
    }
    setLoadingStudents(true);
    setStudentsError('');
    setStudentsLoaded(false);
    setIsLocked(false);
    
    try {
      const { department, semester } = selectedAssignment.subjectId;
      const section = selectedAssignment.section;
      const res = await axios.get(`/users?role=student&department=${encodeURIComponent(department)}&semester=${semester}&section=${section}`);
      const fetchedStudents = res.data.data || [];
      
      fetchedStudents.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''));
      setStudents(fetchedStudents);

      const initialState = {};
      fetchedStudents.forEach(student => {
         initialState[student._id] = 'Absent';
      });
      setAttendanceState(initialState);
      setStudentsLoaded(true);

      const attendanceRes = await axios.get('/attendance');
      const allAttendance = attendanceRes.data.data || [];
      const submittedForThisLecture = allAttendance.filter(r => 
         r.subjectId?._id === selectedSubjectId && 
         new Date(r.date).toISOString().split('T')[0] === selectedDate
      );
      
      if (submittedForThisLecture.length > 0) {
         setIsLocked(true);
         const lockedState = {};
         submittedForThisLecture.forEach(r => {
            lockedState[r.studentId?._id || r.studentId] = r.status;
         });
         setAttendanceState(lockedState);
      }
    } catch (err) {
      setStudentsError(getFriendlyError(err, 'Failed to fetch students.'));
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    if (isLocked) return;
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    if (isLocked) return;
    const newState = {};
    students.forEach(student => {
      newState[student._id] = status;
    });
    setAttendanceState(newState);
  };

  const submitAttendance = async () => {
    if (isBackdated && !reason.trim()) {
      showToast('Reason is required for backdated attendance', 'error');
      return;
    }
    
    const countPresent = Object.values(attendanceState).filter(s => s === 'Present' || s === 'Late').length;
    const total = students.length;
    const confirmMessage = `Submitting for ${total} students (${countPresent} present/late) for ${selectedAssignment.subjectId.subjectName} on ${new Date(selectedDate).toLocaleDateString('en-GB')}. Cannot edit later. Confirm?`;
    
    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);
    try {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const payload = {
        subjectId: selectedSubjectId,
        section: selectedAssignment.section,
        lecture_no: 1,
        date: selectedDate,
        records,
        isBackdated,
        reason: isBackdated ? reason.trim() : undefined
      };

      await axios.post('/attendance', payload);
      
      showToast(`✅ Attendance submitted for ${total} students`, 'success');
      setIsLocked(true);
      if (activeSession) {
         clearInterval(timerRef.current);
         setActiveSession(null);
      }
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to submit attendance'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateSession = async () => {
    try {
      const res = await axios.post('/sessions/create', {
        subjectId: selectedSubjectId,
        section: selectedAssignment.section,
        durationMinutes: 10
      });
      const sessionData = res.data.data;
      setActiveSession(sessionData);
      
      const expiry = new Date(sessionData.expiresAt).getTime();
      const startTimer = () => {
         const now = new Date().getTime();
         const left = Math.floor((expiry - now) / 1000);
         if (left <= 0) {
            clearInterval(timerRef.current);
            setSessionTimer(0);
         } else {
            setSessionTimer(left);
         }
      };
      startTimer();
      timerRef.current = setInterval(startTimer, 1000);
      showToast('QR Code Generated (Valid for 10 mins)', 'success');
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to generate session'), 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await axios.get(`/sessions/export?subjectId=${selectedSubjectId}&section=${selectedAssignment.section}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${selectedAssignment.subjectId.subjectCode}_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const counts = useMemo(() => {
    let p = 0, a = 0, l = 0;
    Object.values(attendanceState).forEach(status => {
      if (status === 'Present') p++;
      else if (status === 'Absent') a++;
      else if (status === 'Late') l++;
    });
    return { present: p, absent: a, late: l };
  }, [attendanceState]);

  if (loading) return <Spinner label="Loading subjects..." />;

  const todayStr = todayInputValue();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl dark:text-slate-100">
            <CalendarCheck2 className="text-primary" size={30} />
            Smart Attendance
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">QR-based time-bound session management.</p>
        </div>
        {selectedAssignment && (
          <button onClick={handleExportCsv} className="btn-primary flex items-center gap-2 text-sm bg-slate-900 dark:bg-slate-100 dark:text-slate-900">
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">{error}</div>}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="grid gap-4 md:grid-cols-[1fr_200px_160px]">
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject & Section</label>
             <select 
               value={selectedSubjectId} 
               onChange={(e) => setSelectedSubjectId(e.target.value)} 
               className="input-field min-h-11"
               disabled={isLocked || activeSession !== null}
             >
               <option value="">-- Choose Subject --</option>
               {assignments.map(a => (
                 <option key={a._id} value={a.subjectId?._id}>
                   {a.subjectId?.subjectName} ({a.subjectId?.subjectCode}) - Sec {a.section}
                 </option>
               ))}
             </select>
           </div>
           
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Date</label>
             <input 
               type="date" 
               value={selectedDate} 
               onChange={(e) => setSelectedDate(e.target.value)} 
               max={todayStr}
               disabled={isLocked || activeSession !== null}
               className="input-field min-h-11"
             />
           </div>

           <div className="space-y-2 flex flex-col justify-end">
             <button 
               onClick={loadStudents}
               disabled={!selectedSubjectId || loadingStudents || activeSession !== null}
               className="tap-target w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
             >
               {loadingStudents ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Load Students'}
             </button>
           </div>
        </div>
      </div>

      {studentsLoaded && (
        <div className="space-y-6">
          {!isBackdated && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 dark:bg-primary/10">
              <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                {!activeSession ? (
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Generate Session QR</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Generate a time-bound QR code for students to scan in class.</p>
                    <button 
                      onClick={handleGenerateSession} 
                      className="btn-primary mt-4 flex items-center gap-2"
                    >
                      <QrCode size={18}/> Start 10 Min Session
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 lg:flex-row w-full">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center min-h-[212px] min-w-[212px]">
                      {activeSession?._id ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${activeSession._id}`} 
                          alt="Session QR Code" 
                          className="w-[180px] h-[180px]"
                        />
                      ) : (
                        <Loader2 className="animate-spin text-slate-300" size={40} />
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-primary">Session Active</p>
                          <h4 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                             {Math.floor((sessionTimer || 0) / 60).toString().padStart(2, '0')}:{((sessionTimer || 0) % 60).toString().padStart(2, '0')}
                          </h4>
                          <p className="text-sm font-bold text-slate-500">Scanning enabled for {selectedAssignment?.section}</p>
                       </div>
                       
                       <div className="flex gap-3">
                          <button onClick={() => { setActiveSession(null); clearInterval(timerRef.current); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">
                             Close QR
                          </button>
                          {sessionTimer === 0 && (
                            <button onClick={handleGenerateSession} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark">
                               Regenerate
                            </button>
                          )}
                       </div>
                    </div>
                    {sessionTimer === 0 && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl dark:bg-slate-900/90">
                         <div className="text-center">
                            <p className="text-lg font-black text-rose-600 uppercase">Session Expired</p>
                            <button onClick={handleGenerateSession} className="btn-primary mt-2">Regenerate New QR</button>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 p-4 dark:bg-slate-800 dark:border-slate-800 flex flex-col md:flex-row gap-4 md:items-center justify-between">
               <div className="flex flex-wrap gap-2 items-center">
                  {!isLocked && (
                    <>
                      <button onClick={() => markAll('Present')} className="tap-target px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200 hover:bg-emerald-200">✅ Mark All Present</button>
                      <button onClick={() => markAll('Absent')} className="tap-target px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-sm font-bold border border-rose-200 hover:bg-rose-200">❌ Mark All Absent</button>
                      <button onClick={() => markAll('Absent')} className="tap-target px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-300">🔄 Reset</button>
                    </>
                  )}
               </div>
               <div className="flex gap-4 items-center bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold dark:bg-slate-900 dark:border-slate-700">
                 <span className="text-emerald-600">Present: {counts.present}</span>
                 <span className="text-rose-600">Absent: {counts.absent}</span>
                 <span className="text-amber-600">Late: {counts.late}</span>
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 dark:bg-slate-800 dark:border-slate-800">
                     <tr>
                        <th className="px-4 py-3 w-16 text-center">Sr</th>
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {students.map((student, idx) => {
                        const status = attendanceState[student._id];
                        return (
                          <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                             <td className="px-4 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                             <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">{student.rollNumber}</td>
                             <td className="px-4 py-4 font-black text-slate-900 dark:text-slate-100">{student.name}</td>
                             <td className="px-4 py-4 text-center">
                                {!isLocked ? (
                                  <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                     <button 
                                       onClick={() => handleStatusChange(student._id, 'Present')}
                                       className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Present' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'}`}
                                     >
                                       Present
                                     </button>
                                     <button 
                                       onClick={() => handleStatusChange(student._id, 'Absent')}
                                       className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Absent' ? 'bg-rose-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'}`}
                                     >
                                       Absent
                                     </button>
                                     <button 
                                       onClick={() => handleStatusChange(student._id, 'Late')}
                                       className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Late' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'}`}
                                     >
                                       Late
                                     </button>
                                  </div>
                                ) : (
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                     status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 
                                     status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                  }`}>
                                     {status}
                                  </span>
                                )}
                             </td>
                          </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {/* Submission Footer */}
            {!isLocked && students.length > 0 && (
               <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center gap-4 justify-between dark:bg-slate-800 dark:border-slate-700">
                  {isBackdated ? (
                    <div className="w-full md:max-w-md">
                       <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1 block dark:text-slate-400">Reason for backdated entry <span className="text-red-500">*</span></label>
                       <input 
                         type="text" 
                         value={reason} 
                         onChange={(e) => setReason(e.target.value)}
                         placeholder="e.g., Portal was down, Forgot yesterday"
                         className="input-field min-h-11 border-amber-300 focus:border-amber-500 focus:ring-amber-100 dark:bg-slate-900"
                       />
                    </div>
                  ) : <div className="hidden md:block"></div>}
                  
                  <button 
                    onClick={submitAttendance}
                    disabled={submitting || (isBackdated && !reason.trim())}
                    className="tap-target w-full md:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-wide text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Submit Attendance for {new Date(selectedDate).toLocaleDateString('en-GB')}
                  </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;

