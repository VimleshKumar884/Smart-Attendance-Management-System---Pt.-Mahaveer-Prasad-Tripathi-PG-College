import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Home, LogOut, Menu, UserCircle, X, CalendarCheck2, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { formatLongDate, INSTITUTION_NAME, SYSTEM_NAME, cx } from '../lib/helpers';

const AdminLayout = ({ children }) => {
  const [isTabletMenuOpen, setIsTabletMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios.get('/notifications')
        .then(res => {
           const unread = (res.data.data || []).filter(n => !n.isRead).length;
           setUnreadCount(unread);
        })
        .catch(err => console.error('Failed to load notifications', err));
    }
  }, [user]);

  const bottomItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { icon: Home, label: 'Home', path: '/admin/dashboard' },
        { icon: CalendarCheck2, label: 'Attendance', path: '/admin/attendance' },
        { icon: UserCircle, label: 'Profile', path: '/admin/settings' },
      ];
    }
    if (user?.role === 'teacher') {
      return [
        { icon: Home, label: 'Home', path: '/faculty/subjects' },
        { icon: CalendarCheck2, label: 'Attendance', path: '/faculty/mark-attendance' },
        { icon: UserCircle, label: 'Profile', path: '/faculty/history' },
      ];
    }
    return [
      { icon: Home, label: 'Home', path: '/student/dashboard' },
      { icon: CalendarCheck2, label: 'Attendance', path: '/student/dashboard#attendance' },
      { icon: UserCircle, label: 'Profile', path: '/student/dashboard#profile' },
    ];
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTabletMenuOpen(true)}
              className="hidden h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:flex lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="min-w-0">
              <p className="truncate text-sm font-black uppercase text-slate-950 md:text-base">{INSTITUTION_NAME}</p>
              <p className="text-xs font-bold text-primary">{SYSTEM_NAME}</p>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 sm:flex">
              <CalendarDays size={17} className="text-primary" />
              {formatLongDate()}
            </div>
            <div className="hidden text-right md:block">
              <p className="text-sm font-black text-slate-900">{user?.name || 'User'}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{user?.role === 'teacher' ? 'Faculty' : user?.role}</p>
            </div>
            
            <Link
              to={`/${user?.role === 'teacher' ? 'faculty' : user?.role}/notifications`}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-base font-black uppercase text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 md:flex"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden lg:block lg:shrink-0">
          <Sidebar />
        </div>

        <main className="w-full min-w-0 flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8 lg:px-8">
          {children}
        </main>
      </div>

      <div className={`fixed inset-0 z-50 hidden md:block lg:hidden ${isTabletMenuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-950/45 transition-opacity ${isTabletMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsTabletMenuOpen(false)}
        />
        <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ${isTabletMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar closeMobileMenu={() => setIsTabletMenuOpen(false)} />
        </div>
        <button
          type="button"
          onClick={() => setIsTabletMenuOpen(false)}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-700 shadow-lg"
          aria-label="Close navigation"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => cx(
                'flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition',
                isActive ? 'bg-blue-50 text-primary' : 'text-slate-500',
              )}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-bold text-slate-500"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
