import { Camera, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const FaceRecognition = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative flex h-32 w-32 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
      >
        <Camera size={48} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-indigo-400/20"
        />
      </motion.div>

      <h1 className="mt-8 text-3xl font-black text-slate-900 dark:text-slate-100">Face Recognition Backup</h1>
      <p className="mt-4 max-w-md text-sm font-semibold text-slate-500 dark:text-slate-400">
        We are developing an AI-powered face verification system as a secondary attendance layer. This will prevent proxy attendance even if a device is shared.
      </p>

      <div className="mt-10 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 dark:bg-amber-900/10 dark:border-amber-900/30">
        <ShieldAlert className="text-amber-600" />
        <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Coming Soon: Q3 2026 Release</span>
      </div>

      <button
        disabled
        className="mt-8 rounded-xl bg-slate-200 px-8 py-3 text-sm font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800"
      >
        Beta Access Locked
      </button>
    </div>
  );
};

export default FaceRecognition;
