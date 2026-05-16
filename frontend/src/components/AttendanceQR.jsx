import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceQR = ({ subjectId }) => {
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds expiry
  const [isActive, setIsActive] = useState(false);

  const generateNewQR = () => {
    // In a real app, this would be a signed token from the backend
    const payload = {
      subjectId,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    };
    setQrValue(JSON.stringify(payload));
    setTimeLeft(60);
    setIsActive(true);
  };

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center gap-8 text-center border-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
      
      <div className="space-y-2">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Dynamic QR Attendance</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">Students can scan this code to mark their presence instantly.</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full group-hover:bg-primary/20 transition-all"></div>
        <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 transition-transform group-hover:scale-[1.02]">
          {qrValue && isActive ? (
            <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <AlertTriangle className="text-slate-300" size={48} />
            </div>
          )}
        </div>
      </div>

      <div className="w-full space-y-6">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-3 text-primary font-black text-lg"
            >
              <Clock className="animate-pulse" />
              Expires in {timeLeft}s
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-red-500 font-bold"
            >
              <AlertTriangle size={18} />
              QR Code Expired
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={generateNewQR}
          className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 active:scale-95 group"
        >
          <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
          {isActive ? 'Refresh QR Code' : 'Generate Session QR'}
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-wider">
        <CheckCircle2 size={14} />
        Secure Biometric-Verified
      </div>
    </div>
  );
};

export default AttendanceQR;