import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, UserCheck, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      {/* Institutional Branding */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="bg-primary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
          <GraduationCap size={48} className="text-white" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight max-w-4xl leading-tight">
          Pt. Mahaveer Prasad Tripathi PG College
        </h1>
        <div className="w-24 h-1.5 bg-primary mx-auto my-6 rounded-full"></div>
        <p className="text-lg md:text-xl font-bold text-slate-500 uppercase tracking-[0.2em]">
          Attendance Management Portal
        </p>
      </motion.div>

      {/* Very Simple Navigation Grid */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
        
        <Link to="/login" className="group">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-10 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all text-center space-y-6"
          >
            <div className="w-20 h-20 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
              <Users size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Student Portal</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Login with Roll No & DOB</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase text-sm tracking-widest">
              Enter Here <ArrowRight size={18} />
            </div>
          </motion.div>
        </Link>

        <Link to="/login" className="group">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-10 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all text-center space-y-6"
          >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
              <UserCheck size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Faculty Portal</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Login with Email & Password</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase text-sm tracking-widest">
              Enter Here <ArrowRight size={18} />
            </div>
          </motion.div>
        </Link>

      </div>

      {/* Simple Clean Footer */}
      <footer className="mt-20 text-center space-y-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
          Established 2004 • Recognized by Govt.
        </p>
        <div className="flex items-center justify-center gap-6 opacity-30 grayscale grayscale-100">
           <img src="https://via.placeholder.com/40" alt="Govt Logo 1" />
           <img src="https://via.placeholder.com/40" alt="Govt Logo 2" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;