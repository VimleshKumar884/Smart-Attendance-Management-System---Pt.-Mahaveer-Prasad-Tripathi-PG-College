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
} from 'lucide-react';
import { motion } from 'framer-motion';
import heroAsset from '../assets/hero.png';
import { INSTITUTION_NAME, SYSTEM_NAME } from '../lib/helpers';

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

const LandingPage = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <GraduationCap size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black uppercase tracking-wide text-slate-900 sm:text-xl">
              {INSTITUTION_NAME}
            </h1>
            <p className="text-sm font-semibold text-primary">{SYSTEM_NAME}</p>
          </div>
        </Link>
        <Link
          to="/login/student"
          className="tap-target hidden items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark sm:inline-flex"
        >
          Portal Login
        </Link>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <ShieldCheck size={14} />
              Secure Digital Attendance
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-6xl">
                Attendance management for every classroom workflow.
              </h2>
              <p className="max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
                A responsive portal for administrators, faculty, and students to manage daily attendance, reports, and eligibility alerts.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <HeroStat icon={CalendarCheck2} label="Daily" value="Marking" />
              <HeroStat icon={BarChart3} label="Live" value="Reports" />
              <HeroStat icon={ShieldCheck} label="Role" value="Access" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative min-h-[260px] rounded-xl border border-slate-200 bg-slate-950 p-5 shadow-xl shadow-slate-900/10 sm:min-h-[360px]"
          >
            <img
              src={heroAsset}
              alt=""
              className="absolute right-4 top-4 h-28 w-28 opacity-50 sm:h-40 sm:w-40"
              loading="eager"
            />
            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between sm:min-h-[320px]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Live Overview</p>
                <h3 className="mt-3 max-w-sm text-2xl font-black text-white sm:text-4xl">Today&apos;s attendance pulse</h3>
              </div>
              <div className="grid gap-3">
                {['B.Sc CS - 92%', 'B.Com - 78%', 'BA - 83%'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur">
                    <span className="text-sm font-semibold">{item}</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-950">Choose Your Portal</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">Select a role to continue to the correct login page.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {loginCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.06 }}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-black text-slate-950">{card.role}</h3>
                <p className="mt-3 min-h-[72px] text-sm font-medium leading-6 text-slate-600">{card.description}</p>
                <Link
                  to={card.path}
                  className="tap-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
                >
                  Login
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm font-semibold text-slate-500">
      © {currentYear} {SYSTEM_NAME}
    </footer>
  </div>
);

const HeroStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-md bg-white p-3 text-center shadow-sm">
    <Icon className="mx-auto mb-2 text-primary" size={20} />
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default LandingPage;
