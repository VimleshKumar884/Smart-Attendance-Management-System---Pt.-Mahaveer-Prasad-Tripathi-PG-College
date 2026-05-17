import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpenCheck, CalendarCheck2, Hash, Layers } from 'lucide-react';
import Spinner from '../components/Spinner';
import { getFriendlyError } from '../lib/helpers';

const FacultySubjects = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <Spinner label="Loading assigned subjects..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <BookOpenCheck className="text-primary" size={30} />
          My Subjects
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Assigned subjects and sections for attendance marking.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {assignments.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
          No subjects assigned yet.
        </div>
      )}
    </div>
  );
};

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
