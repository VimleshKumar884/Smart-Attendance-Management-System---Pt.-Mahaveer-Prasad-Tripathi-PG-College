/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { BookOpenCheck, CalendarCheck2, Loader2, Save, X, QrCode, Smartphone, Download, MapPin } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { getFriendlyError, todayInputValue } from '../lib/helpers';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Attendance State
  const [attendanceState, setAttendanceState] = useState({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false); 

  // Session/QR State
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const timerRef = useRef(null);
  const [location, setLocation] = useState(null);

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
    
    // Get initial location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      }, (err) => console.error("Location error", err));
    }
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

  const handleGenerateSession = async () => {
    if (!location) {
      showToast('Location access is required to generate QR code.', 'error');
      return;
    }
    try {
      const res = await axios.post('/sessions/create', {
        subjectId: selectedSubjectId,
        section: selectedAssignment.section,
        durationMinutes: 10,
        latitude: location.latitude,
        longitude: location.longitude
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
          {!isLocked && !isBackdated && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 dark:bg-primary/10">
              <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                {!activeSession ? (
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Generate Session QR</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Generate a time-bound QR code for students to scan within 50 meters of your current location.</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-2">
                       <MapPin size={14} className="text-emerald-500"/>
                       {location ? `Location locked: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Waiting for GPS...'}
                    </div>
                    <button 
                      onClick={handleGenerateSession} 
                      disabled={!location}
                      className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50"
                    >
                      <QrCode size={18}/> Start 10 Min Session
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 lg:flex-row w-full">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                      <QRCode value={activeSession._id} size={180} />
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-primary">Session Active</p>
                          <h4 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                             {Math.floor(sessionTimer / 60).toString().padStart(2, '0')}:{(sessionTimer % 60).toString().padStart(2, '0')}
                          </h4>
                          <p className="text-sm font-bold text-slate-500">Scanning enabled for {selectedAssignment.section}</p>
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
            <div className="border-b border-slate-200 bg-slate-50 p-4 dark:bg-slate-800 dark:border-slate-800 flex items-center justify-between">
               <h3 className="font-bold text-slate-700 dark:text-slate-300">Students List ({students.length})</h3>
               <div className="flex gap-4 text-xs font-black uppercase">
                 <span className="text-emerald-600">Present: {counts.present}</span>
                 <span className="text-rose-600">Absent: {counts.absent}</span>
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
                     {students.map((student, idx) => (
                        <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                           <td className="px-4 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                           <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">{student.rollNumber}</td>
                           <td className="px-4 py-4 font-black text-slate-900 dark:text-slate-100">{student.name}</td>
                           <td className="px-4 py-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                 attendanceState[student._id] === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                 {attendanceState[student._id]}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;

