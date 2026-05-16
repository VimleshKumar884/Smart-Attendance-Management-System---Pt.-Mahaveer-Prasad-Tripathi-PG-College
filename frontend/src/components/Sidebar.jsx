import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BookOpen, 
  History, 
  Settings,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const sections = [
    {
      title: 'Administrative',
      items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: <Users size={18} />, label: 'Student Directory', path: '/admin/students' },
        { icon: <UserSquare2 size={18} />, label: 'Faculty Directory', path: '/admin/teachers' },
      ]
    },
    {
      title: 'Academic',
      items: [
        { icon: <BookOpen size={18} />, label: 'Course Catalog', path: '/admin/subjects' },
        { icon: <History size={18} />, label: 'Attendance Logs', path: '/admin/attendance' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: <Settings size={18} />, label: 'Portal Settings', path: '/admin/settings' },
        { icon: <ShieldAlert size={18} />, label: 'Security Audit', path: '/admin/audit' },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-[calc(100vh-64px)] sticky top-16 flex flex-col">
      <div className="flex-grow py-8 px-4 overflow-y-auto space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 px-4 uppercase tracking-[0.2em]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/5 text-primary border-l-4 border-primary rounded-l-none' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-primary transition-colors text-sm font-bold">
          <HelpCircle size={18} />
          Technical Support
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;