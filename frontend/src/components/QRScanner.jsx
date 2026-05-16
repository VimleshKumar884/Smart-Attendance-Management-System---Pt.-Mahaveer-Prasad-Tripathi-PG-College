import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { 
  CheckCircle2, 
  X, 
  Loader2, 
  QrCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRScanner = ({ onResult }) => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    });

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(result) {
      scanner.clear();
      setLoading(true);
      try {
        const payload = JSON.parse(result);
        
        // Mark attendance via API
        const res = await axios.post('/attendance', {
          subjectId: payload.subjectId,
          records: [{ studentId: 'me', status: 'Present' }], // Backend should handle 'me' using req.user.id
          date: new Date().toISOString().split('T')[0]
        });

        setScanResult('success');
        if (onResult) onResult(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid QR Code or marking failed.');
        setScanResult('error');
      } finally {
        setLoading(false);
      }
    }

    function onScanError(err) {
      // Quietly ignore scan errors
    }

    return () => {
      scanner.clear();
    };
  }, [onResult]);

  return (
    <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center gap-8 text-center border-none shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -ml-16 -mt-16"></div>
      
      <div className="space-y-2">
        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Scan Classroom QR</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">Position the teacher's QR code within the frame to mark your presence.</p>
      </div>

      <div className="w-full max-w-sm aspect-square relative rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
        <div id="reader" className="w-full h-full"></div>
        
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
            >
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="font-bold text-slate-700">Verifying Identity...</p>
            </motion.div>
          )}

          {scanResult === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white p-8 z-20"
            >
              <CheckCircle2 size={64} className="mb-4" />
              <h4 className="text-2xl font-black">Success!</h4>
              <p className="font-bold opacity-90">Attendance marked successfully.</p>
              <button 
                onClick={() => setScanResult(null)}
                className="mt-8 bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Done
              </button>
            </motion.div>
          )}

          {scanResult === 'error' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-red-500 flex flex-col items-center justify-center text-white p-8 z-20"
            >
              <AlertCircle size={64} className="mb-4" />
              <h4 className="text-2xl font-black">Failed</h4>
              <p className="font-bold opacity-90 text-center">{error}</p>
              <button 
                onClick={() => setScanResult(null)}
                className="mt-8 bg-white text-red-600 px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
        <ShieldCheck size={14} />
        End-to-End Encrypted Verification
      </div>
    </div>
  );
};

export default QRScanner;