import { Bell, LockKeyhole, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <SettingsIcon className="text-primary" size={30} />
          Settings
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Account and portal preferences.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-black text-slate-950">Profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Info label="Name" value={user?.name || 'N/A'} />
            <Info label="Role" value={user?.role === 'teacher' ? 'Faculty' : user?.role || 'N/A'} />
            <Info label="Email" value={user?.email || 'N/A'} />
            <Info label="Department" value={user?.department || 'N/A'} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Security</h2>
          <div className="mt-5 space-y-3">
            <SettingRow icon={ShieldCheck} label="Role-based access" value="Enabled" />
            <SettingRow icon={LockKeyhole} label="JWT authentication" value="Enabled" />
            <SettingRow icon={Bell} label="Toast alerts" value="Enabled" />
          </div>
        </section>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const SettingRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-primary" />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{value}</span>
  </div>
);

export default Settings;
