import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3, QrCode, ShieldCheck, ArrowRight, Award, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white/80 py-2 px-6 text-[10px] font-bold uppercase tracking-[0.3em] text-center">
        Official Digital Portal • Pt. Mahaveer Prasad Tripathi PG College • Established 2004
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 border-b border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Streamlining Academic <br/>
                <span className="text-primary italic">Accountability.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                A robust, multi-layered attendance ecosystem designed to eliminate manual overhead and provide actionable insights for Pt. MPT PG College.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/login" 
                className="bg-primary text-white px-10 py-4 rounded-lg font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group active:scale-95"
              >
                Access Portal
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex -space-x-3 items-center ml-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                  </div>
                ))}
                <span className="ml-6 text-xs font-bold text-slate-400">+2.4k Students Enrolled</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div>
                <p className="text-2xl font-black text-slate-900">99.8%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">12k+</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly Logs</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">45+</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Departments</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
                alt="College Campus" 
                className="rounded-xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 max-w-[240px] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">Biometric Verified</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Real-time facial recognition and geolocation verification active.</p>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Institutional Grade</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Comprehensive Tracking Modules</h2>
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              Designed to meet the rigorous standards of modern academic administration and reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <ModuleCard 
              icon={<QrCode size={32} />} 
              title="QR Synchronization" 
              desc="Encrypted, time-sensitive QR codes generated for every lecture to prevent unauthorized marking."
            />
            <ModuleCard 
              icon={<BarChart3 size={32} />} 
              title="Analytics Engine" 
              desc="Deep-dive into attendance trends, identifying risk patterns and academic engagement levels."
            />
            <ModuleCard 
              icon={<Award size={32} />} 
              title="Automated Reporting" 
              desc="Generate university-compliant PDF and Excel reports with a single click for any duration."
            />
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(i => <Award key={i} className="text-accent" size={24} />)}
          </div>
          <blockquote className="text-3xl font-medium text-white italic leading-relaxed">
            "The Smart Attendance System has transformed our administrative efficiency, allowing us to focus more on academic quality than manual record-keeping."
          </blockquote>
          <div className="space-y-2">
            <p className="text-white font-black text-lg">Dr. R.K. Tripathi</p>
            <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Principal, PT. MPT PG College</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ModuleCard = ({ icon, title, desc }) => (
  <div className="space-y-6 group">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
      {icon}
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default LandingPage;