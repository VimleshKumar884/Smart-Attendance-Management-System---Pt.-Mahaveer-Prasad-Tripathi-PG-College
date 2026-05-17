import React, { useState } from 'react';
import axios from 'axios';
import { KeyRound, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { getFriendlyError } from '../lib/helpers';

const StudentMarkAttendance = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      const targetInput = document.getElementById(`otp-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    setSuccess(false);
    try {
      await axios.post('/attendance/otp/verify', { otpCode });
      setSuccess(true);
      showToast('✅ Attendance marked successfully!', 'success');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      showToast(getFriendlyError(err, 'Failed to mark attendance'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl">
          <Smartphone className="text-primary" size={30} />
          Mark My Attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Enter the 6-digit OTP displayed by your faculty.</p>
      </div>

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="text-emerald-600 mt-0.5" size={24} />
          <div>
            <h3 className="text-base font-black text-emerald-800 uppercase tracking-wide">Success</h3>
            <p className="mt-1 text-sm font-medium text-emerald-700">
              You have been marked present. You can verify your updated status on the Dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-indigo-50 border-b border-indigo-100 p-6 flex flex-col items-center text-center">
           <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-4">
             <KeyRound size={32} />
           </div>
           <h2 className="text-xl font-black text-slate-900">Enter Attendance OTP</h2>
           <p className="text-sm font-medium text-slate-600 mt-2 max-w-sm">The code is valid for 15 minutes from the time of generation.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col items-center">
           <div className="flex gap-2 sm:gap-4 mb-8" onPaste={handlePaste}>
             {otp.map((digit, index) => (
               <input
                 key={index}
                 id={`otp-${index}`}
                 type="text"
                 inputMode="numeric"
                 pattern="\d*"
                 maxLength={1}
                 value={digit}
                 onChange={(e) => handleOtpChange(index, e.target.value)}
                 onKeyDown={(e) => handleKeyDown(index, e)}
                 className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-900 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-slate-50 focus:bg-white"
               />
             ))}
           </div>
           
           <button 
             type="submit" 
             disabled={loading || otp.join('').length !== 6}
             className="tap-target w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-wide shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" size={20} /> : 'Mark Present'}
           </button>
        </form>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm text-sm font-medium text-amber-800">
         <strong className="font-black uppercase tracking-wide">Note:</strong> Make sure you are using the correct code for your section. Sharing or misusing OTPs will be recorded.
      </div>
    </div>
  );
};

export default StudentMarkAttendance;
