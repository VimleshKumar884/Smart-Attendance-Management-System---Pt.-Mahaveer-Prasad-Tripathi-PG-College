/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { BookOpenCheck, CalendarCheck2, Loader2, Save, X, KeyRound, Smartphone } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, todayInputValue } from '../lib/helpers';

const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dateMode, setDateMode] = useState('today'); // 'today' | 'previous'
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  
  // Student List State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  
  // Attendance State: { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [attendanceState, setAttendanceState] = useState({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // If already submitted

  // OTP State
  const [activeOtp, setActiveOtp] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
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
    setReason('');
    
    try {
      // 1. Fetch Students
      const { department, semester } = selectedAssignment.subjectId;
      const section = selectedAssignment.section;
      const res = await axios.get(`/users?role=student&department=${encodeURIComponent(department)}&semester=${semester}&section=${section}`);
      const fetchedStudents = res.data.data || [];
      
      // Sort by roll number
      fetchedStudents.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''));
      setStudents(fetchedStudents);

      // Default state: Absent
      const initialState = {};
      fetchedStudents.forEach(student => {
         initialState[student._id] = 'Absent';
      });
      setAttendanceState(initialState);
      setStudentsLoaded(true);

      // 2. Check if attendance is already submitted for this date
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
        lecture_no: 1, // hardcoded for simplicity as requested
        date: selectedDate,
        records,
        isBackdated,
        reason: isBackdated ? reason.trim() : undefined
      };

      await axios.post('/attendance', payload);
      
      showToast(`✅ Attendance submitted for ${total} students`, 'success');
      setIsLocked(true);
      if (activeOtp) {
         await handleCancelOtp();
      }
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to submit attendance'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateOtp = async () => {
    try {
      const res = await axios.post('/attendance/otp/generate', {
        subjectId: selectedSubjectId,
        section: selectedAssignment.section,
        date: selectedDate
      });
      const otpData = res.data.data;
      setActiveOtp(otpData);
      
      const expiry = new Date(otpData.expiresAt).getTime();
      const startTimer = () => {
         const now = new Date().getTime();
         const left = Math.floor((expiry - now) / 1000);
         if (left <= 0) {
            clearInterval(timerRef.current);
            setActiveOtp(null);
            setOtpTimer(0);
         } else {
            setOtpTimer(left);
         }
      };
      startTimer();
      timerRef.current = setInterval(startTimer, 1000);
      showToast('OTP Generated Successfully', 'success');
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to generate OTP'), 'error');
    }
  };

  const handleCancelOtp = async () => {
    if (!activeOtp) return;
    try {
      await axios.post('/attendance/otp/cancel', { otpId: activeOtp._id });
      clearInterval(timerRef.current);
      setActiveOtp(null);
      setOtpTimer(0);
      showToast('OTP Cancelled', 'success');
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to cancel OTP'), 'error');
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
  const maxPrevDate = new Date();
  maxPrevDate.setDate(maxPrevDate.getDate() - 7);
  const minDateStr = maxPrevDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <CalendarCheck2 className="text-primary" size={30} />
          Mark Attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Select subject and date to mark student attendance.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {/* Step 1: Selection */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_200px_160px]">
           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">Select Subject</label>
             <select 
               value={selectedSubjectId} 
               onChange={(e) => setSelectedSubjectId(e.target.value)} 
               className="input-field min-h-11"
               disabled={isLocked || activeOtp !== null}
             >
               <option value="">-- Choose Subject --</option>
               {assignments.map(a => (
                 <option key={a._id} value={a.subjectId?._id}>
                   {a.subjectId?.subjectName} ({a.subjectId?.subjectCode}) - Section {a.section}
                 </option>
               ))}
             </select>
           </div>
           
           <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Date Mode</label>
                <div className="flex gap-2">
                   <button 
                     type="button" 
                     onClick={() => { setDateMode('today'); setSelectedDate(todayStr); }}
                     className={`text-xs font-bold px-2 py-1 rounded ${dateMode === 'today' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                     disabled={isLocked || activeOtp !== null}
                   >
                     Today
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setDateMode('previous')}
                     className={`text-xs font-bold px-2 py-1 rounded ${dateMode === 'previous' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                     disabled={isLocked || activeOtp !== null}
                   >
                     Previous
                   </button>
                </div>
             </div>
             <input 
               type="date" 
               value={selectedDate} 
               onChange={(e) => setSelectedDate(e.target.value)} 
               min={dateMode === 'previous' ? minDateStr : todayStr}
               max={todayStr}
               disabled={dateMode === 'today' || isLocked || activeOtp !== null}
               className="input-field min-h-11"
             />
           </div>

           <div className="space-y-2 flex flex-col justify-end">
             <button 
               onClick={loadStudents}
               disabled={!selectedSubjectId || loadingStudents || activeOtp !== null}
               className="tap-target w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
             >
               {loadingStudents ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Load Students'}
             </button>
           </div>
        </div>
      </div>

      {studentsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 flex justify-between items-center">
          <span>{studentsError}</span>
          <button onClick={loadStudents} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Retry</button>
        </div>
      )}

      {/* Step 3 & 4: Marking UI */}
      {studentsLoaded && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in">
          
          {/* Header Action Bar */}
          <div className="border-b border-slate-200 bg-slate-50 p-4 sticky top-[64px] z-10 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
             <div className="flex flex-wrap gap-2 items-center">
                {!isLocked && (
                  <>
                    <button onClick={() => markAll('Present')} className="tap-target px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200 hover:bg-emerald-200">✅ Mark All Present</button>
                    <button onClick={() => markAll('Absent')} className="tap-target px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-sm font-bold border border-rose-200 hover:bg-rose-200">❌ Mark All Absent</button>
                    <button onClick={() => markAll('Absent')} className="tap-target px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-300">🔄 Reset</button>
                  </>
                )}
             </div>
             <div className="flex gap-4 items-center bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold">
               <span className="text-emerald-600">Present: {counts.present}</span>
               <span className="text-rose-600">Absent: {counts.absent}</span>
               <span className="text-amber-600">Late: {counts.late}</span>
             </div>
          </div>

          {/* Locked State Banner */}
          {isLocked && (
            <div className="bg-amber-50 p-4 border-b border-amber-200 text-amber-800 font-bold flex items-center justify-center gap-2">
              <span>🔒 Attendance already submitted for {selectedAssignment?.subjectId?.subjectName} on {new Date(selectedDate).toLocaleDateString('en-GB')}</span>
            </div>
          )}

          {/* OTP Section (Only if today and not locked) */}
          {!isLocked && !isBackdated && (
            <div className="p-4 border-b border-slate-200 bg-blue-50/50 flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg text-primary"><Smartphone size={24}/></div>
                 <div>
                    <h3 className="font-black text-slate-900">Student Self-Marking (OTP)</h3>
                    <p className="text-sm font-medium text-slate-600">Generate a code for students to mark themselves present.</p>
                 </div>
              </div>
              
              {!activeOtp ? (
                <button onClick={handleGenerateOtp} className="tap-target px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow flex items-center gap-2 hover:bg-primary-dark">
                  <KeyRound size={18}/> Generate Attendance OTP
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-xl border border-blue-200 shadow-md">
                   <div className="text-center">
                     <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Write this on board</p>
                     <p className="text-3xl font-black tracking-[0.2em] text-primary">{activeOtp.otpCode}</p>
                   </div>
                   <div className="h-12 w-px bg-slate-200 mx-2"></div>
                   <div className="text-center">
                     <p className="text-xs font-black uppercase text-slate-500">Expires In</p>
                     <p className={`text-xl font-bold ${otpTimer < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}
                     </p>
                   </div>
                   <button onClick={handleCancelOtp} className="ml-2 tap-target h-10 w-10 flex items-center justify-center rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200">
                     <X size={20}/>
                   </button>
                </div>
              )}
            </div>
          )}

          {/* Student List */}
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-500 tracking-wider">
                   <tr>
                      <th className="px-4 py-3 w-16 text-center">Sr. No</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3 text-center">Mark Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {students.map((student, idx) => {
                      const status = attendanceState[student._id];
                      return (
                        <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-4 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                           <td className="px-4 py-4 font-bold text-slate-700">{student.rollNumber || 'N/A'}</td>
                           <td className="px-4 py-4 font-black text-slate-900">{student.name}</td>
                           <td className="px-4 py-4 text-center">
                              <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                                 <button 
                                   onClick={() => handleStatusChange(student._id, 'Present')}
                                   className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Present' ? 'bg-emerald-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                                 >
                                   ✅ Present
                                 </button>
                                 <button 
                                   onClick={() => handleStatusChange(student._id, 'Absent')}
                                   className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Absent' ? 'bg-rose-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                                 >
                                   ❌ Absent
                                 </button>
                                 <button 
                                   onClick={() => handleStatusChange(student._id, 'Late')}
                                   className={`tap-target px-3 py-1.5 text-xs font-bold rounded-md transition-all ${status === 'Late' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                                 >
                                   🕐 Late
                                 </button>
                              </div>
                           </td>
                        </tr>
                      )
                   })}
                   {students.length === 0 && (
                     <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500 font-bold">No students found for this class.</td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Submission Footer */}
          {!isLocked && students.length > 0 && (
             <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center gap-4 justify-between">
                {isBackdated ? (
                  <div className="w-full md:max-w-md">
                     <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1 block">Reason for backdated entry <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       value={reason} 
                       onChange={(e) => setReason(e.target.value)}
                       placeholder="e.g., Portal was down, Forgot yesterday"
                       className="input-field min-h-11 border-amber-300 focus:border-amber-500 focus:ring-amber-100"
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
      )}

    </div>
  );
};

export default MarkAttendance;
