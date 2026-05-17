import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 px-8 py-3 flex justify-between items-center shadow-lg border-b border-primary-dark/30">
      <Link to="/" className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
          <GraduationCap size={28} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg leading-none tracking-tight">PT. MPT COLLEGE</span>
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">Smart Attendance Portal</span>
        </div>
      </Link>

      <div className="flex items-center gap-8">
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-6 text-white/80">
              <button className="hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border border-primary"></span>
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-white/20 hidden md:block"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent text-primary font-black flex items-center justify-center border-2 border-white/20 shadow-inner">
                {user.name.charAt(0)}
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <Link 
            to="/login" 
            className="bg-accent text-primary px-8 py-2 rounded-lg font-black hover:bg-yellow-400 transition-all shadow-md active:scale-95 uppercase text-xs tracking-widest"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
