import { Loader2 } from 'lucide-react';

const Spinner = ({ label = 'Loading...', fullScreen = false }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : 'py-12'}`}>
    <Loader2 className="animate-spin text-primary" size={32} />
    <p className="text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

export default Spinner;
