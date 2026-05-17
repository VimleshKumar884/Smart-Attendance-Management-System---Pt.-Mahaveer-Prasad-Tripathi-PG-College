import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  GraduationCap,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  Users,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import heroAsset from '../assets/hero.png';
import { INSTITUTION_NAME, SYSTEM_NAME } from '../lib/helpers';
import { useMemo } from 'react';

const currentYear = new Date().getFullYear();

const loginCards = [
  {
    role: 'Admin',
    path: '/login/admin',
    icon: UserCog,
    description: 'Manage students, faculty, reports, subject assignments, and system settings.',
  },
  {
    role: 'Faculty',
    path: '/login/faculty',
    icon: UserRoundCheck,
    description: 'View assigned subjects, mark attendance, and review previous class records.',
  },
  {
    role: 'Student',
    path: '/login/student',
    icon: Users,
    description: 'Track attendance subject-wise, warnings, monthly calendar, and personal reports.',
  },
];

const LandingPage = () => {
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <GraduationCap size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black uppercase tracking-wide text-slate-900 sm:text-xl">
                {INSTITUTION_NAME}
              </h1>
              <p className="text-sm font-semibold text-indigo-600">{SYSTEM_NAME}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <Calendar size={16} className="text-indigo-600" />
            {formattedDate}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                <ShieldCheck size={14} />
                Smart Digital Attendance
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Modernizing every classroom workflow.
                </h2>
                <p className="max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
                  A responsive, all-in-one portal for administrators, faculty, and students. Manage daily attendance with OTP self-marking, live tracking, and instant alerts.
                </p>
              </div>
              <div className="grid max-w-xl grid-cols-3 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 shadow-sm">
                <HeroStat icon={CalendarCheck2} label="Daily" value="Marking" />
                <HeroStat icon={BarChart3} label="Live" value="Reports" />
                <HeroStat icon={ShieldCheck} label="Role" value="Access" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="relative hidden lg:block"
            >
               <div className="relative min-h-[360px] rounded-2xl border border-slate-200 bg-slate-900 p-8 shadow-2xl shadow-indigo-900/10 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50"></div>
                 <div className="relative z-10 flex h-full flex-col justify-center space-y-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-indigo-300">Live System Pulse</p>
                      <h3 className="mt-2 text-3xl font-black text-white">Seamless Integration</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4 backdrop-blur-md border border-white/10">
                         <span className="font-semibold text-white">Admin Control</span>
                         <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,113,0.5)]" />
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4 backdrop-blur-md border border-white/10">
                         <span className="font-semibold text-white">Faculty Access</span>
                         <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,113,0.5)]" />
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4 backdrop-blur-md border border-white/10">
                         <span className="font-semibold text-white">Student Portals</span>
                         <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,113,0.5)]" />
                      </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-slate-950">Choose Your Portal</h2>
              <p className="mt-3 text-base font-medium text-slate-600">Select your role to login and access your dashboard.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {loginCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.role}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.06 }}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={30} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950">{card.role}</h3>
                    <p className="mt-3 mb-6 flex-grow text-sm font-medium leading-relaxed text-slate-600">{card.description}</p>
                    <Link
                      to={card.path}
                      className="tap-target mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 shadow-sm hover:shadow-md"
                    >
                      Login
                      <ArrowRight size={18} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold text-slate-500">
            © {currentYear} {SYSTEM_NAME}. All rights reserved.
          </p>
          <div className="text-sm font-medium text-slate-400">
            {INSTITUTION_NAME}
          </div>
        </div>
      </footer>
    </div>
  );
};

const HeroStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-md bg-white p-3 text-center shadow-sm">
    <Icon className="mx-auto mb-2 text-indigo-600" size={20} />
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default LandingPage;
