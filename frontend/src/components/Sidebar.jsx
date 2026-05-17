import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  GraduationCap,
  Home,
  Settings,
  LibraryBig,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_NAME, SYSTEM_NAME, cx } from '../lib/helpers';

const navByRole = {
  admin: [
    { icon: Home, label: 'Home', path: '/admin/dashboard' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: UserRoundCheck, label: 'Faculty', path: '/admin/faculty' },
    { icon: LibraryBig, label: 'Subjects', path: '/admin/subjects' },
    { icon: BarChart3, label: 'Attendance Reports', path: '/admin/attendance' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ],
  teacher: [
    { icon: BookOpenCheck, label: 'My Subjects', path: '/faculty/subjects' },
    { icon: CalendarCheck2, label: 'Mark Attendance', path: '/faculty/mark-attendance' },
    { icon: BarChart3, label: 'Attendance History', path: '/faculty/history' },
  ],
  student: [
    { icon: Home, label: 'Home', path: '/student/dashboard' },
    { icon: CalendarCheck2, label: 'Attendance', path: '/student/dashboard#attendance' },
    { icon: Users, label: 'Profile', path: '/student/dashboard#profile' },
  ],
};

const Sidebar = ({ closeMobileMenu }) => {
  const { user } = useAuth();
  const items = navByRole[user?.role] || [];

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <GraduationCap size={25} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase text-slate-950">{INSTITUTION_NAME}</p>
            <p className="text-xs font-bold text-primary">{SYSTEM_NAME}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) => cx(
                'tap-target flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition',
                isActive
                  ? 'bg-blue-50 text-primary ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              )}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
