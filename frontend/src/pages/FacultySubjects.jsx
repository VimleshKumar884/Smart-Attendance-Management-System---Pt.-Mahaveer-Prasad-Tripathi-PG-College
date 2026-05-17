/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpenCheck, CalendarCheck2, Hash, Layers, Users, Percent, UserCheck } from 'lucide-react';
import Spinner from '../components/Spinner';
import { getFriendlyError, todayInputValue } from '../lib/helpers';

const FacultySubjects = () => {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [assignmentsRes, usersRes, attendanceRes, logsRes] = await Promise.all([
          axios.get('/assignments'),
          axios.get('/users'),
          axios.get('/attendance'),
          axios.get('/faculty-logs/me').catch(() => ({ data: { data: [] } }))
        ]);
        
        setAssignments(assignmentsRes.data.data || []);
        
        // Filter users to only students
        const allStudents = (usersRes.data.data || []).filter(u => u.role === 'student');
        setStudents(allStudents);
        
        setAttendance(attendanceRes.data.data || []);
        setMyLogs(logsRes.data.data || []);
        
      } catch (err) {
        setError(getFriendlyError(err, 'Could not load dashboard data.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    // 1. Total Assigned Subjects
    const totalSubjects = assignments.length;

    // 2. Total Students (across all assigned subjects/classes)
    // We get unique sections/semesters from assignments
    const assignedClasses = assignments.map(a => ({
      semester: a.semester || a.subjectId?.semester,
      section: a.section || a.subjectId?.section
    }));
    
    const uniqueStudents = students.filter(student => {
      return assignedClasses.some(ac => 
        student.semester === ac.semester && student.section === ac.section
      );
    });
    const totalStudents = uniqueStudents.length;

    // 3. Attendance Marked Today (yes/no)
    const today = todayInputValue();
    const markedToday = attendance.some(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === today;
    });

    // 4. My Attendance This Month %
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthLogs = myLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    // Assuming we calculate percentage based on days elapsed in month minus weekends, 
    // but for simplicity, let's just use total logs available for this month or total days elapsed.
    // If we only have logs for days they were meant to be present:
    const presentCount = thisMonthLogs.filter(l => l.status === 'present').length;
    const halfDayCount = thisMonthLogs.filter(l => l.status === 'half-day').length;
    const effectivePresent = presentCount + (halfDayCount * 0.5);
    
    // Instead of complex working days calc, if thisMonthLogs is populated daily:
    const totalLogsThisMonth = thisMonthLogs.length;
    let attendancePercent = 100; // default if no logs
    if (totalLogsThisMonth > 0) {
      attendancePercent = Math.round((effectivePresent / totalLogsThisMonth) * 100);
    } else {
      // If no logs, but days have passed, could be 0, but let's say "N/A"
      attendancePercent = 'N/A';
    }

    return {
      totalSubjects,
      totalStudents,
      markedToday,
      attendancePercent
    };
  }, [assignments, students, attendance, myLogs]);

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <BookOpenCheck className="text-primary" size={30} />
          Faculty Dashboard
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Overview of your subjects, students, and attendance.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BookOpenCheck} label="Assigned Subjects" value={stats.totalSubjects} tone="indigo" />
        <MetricCard icon={Users} label="Total Students" value={stats.totalStudents} tone="blue" />
        <MetricCard 
          icon={UserCheck} 
          label="Attendance Today" 
          value={stats.markedToday ? 'Marked ✅' : 'Pending ⏳'} 
          tone={stats.markedToday ? 'emerald' : 'amber'} 
        />
        <MetricCard 
          icon={Percent} 
          label="My Attendance (Month)" 
          value={stats.attendancePercent === 'N/A' ? 'N/A' : `${stats.attendancePercent}%`} 
          tone={stats.attendancePercent !== 'N/A' && stats.attendancePercent < 75 ? 'rose' : 'emerald'} 
        />
      </div>

      <div className="pt-4">
         <h2 className="text-xl font-black text-slate-900 mb-4">My Subjects</h2>
        {assignments.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <BookOpenCheck size={25} />
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950">{assignment.subjectId?.subjectName || 'Subject'}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">{assignment.subjectId?.subjectCode || 'N/A'}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Meta icon={Layers} label="Semester" value={assignment.semester || 'N/A'} />
                  <Meta icon={Hash} label="Section" value={assignment.section || 'N/A'} />
                </div>
                <Link
                  to="/faculty/mark-attendance"
                  className="tap-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
                >
                  <CalendarCheck2 size={18} />
                  Mark Attendance
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
            No subjects assigned yet. Please contact the administrator.
          </div>
        )}
      </div>
    </div>
  );
};

const toneStyles = {
  blue: 'bg-blue-50 text-primary',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
};

const MetricCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
        <Icon size={24} />
      </div>
      <div>
         <p className="text-sm font-bold text-slate-500">{label}</p>
         <p className="text-xl sm:text-2xl font-black text-slate-950 leading-tight mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const Meta = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon size={15} />
      <span className="text-xs font-black uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
  </div>
);

export default FacultySubjects;
