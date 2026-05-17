import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Smartphone, Loader2, CheckCircle2, Scan, AlertCircle, MapPin } from 'lucide-react';
import { useToast } from '../components/Toast';
import { getFriendlyError } from '../lib/helpers';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

const StudentMarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (err) => {
          console.error(err);
          setError('Location access is required to mark attendance.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  const startScanner = () => {
    if (!location) {
      showToast('Waiting for GPS location...', 'error');
      return;
    }
    setScanning(true);
    setSuccess(false);
    setError('');

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      }, false);

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }, 100);
  };

  const onScanSuccess = async (decodedText) => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      setScanning(false);
    }
    handleMarkAttendance(decodedText);
  };

  const onScanFailure = (error) => {
    // Console only for high volume debugging
    // console.warn(`QR scan error: ${error}`);
  };

  const handleMarkAttendance = async (sessionId) => {
    setLoading(true);
    try {
      await axios.post('/sessions/scan', {
        sessionId,
        latitude: location.latitude,
        longitude: location.longitude
      });
      setSuccess(true);
      showToast('✅ Attendance marked successfully!', 'success');
    } catch (err) {
      const msg = getFriendlyError(err, 'Failed to mark attendance');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="flex items-center gap-3 text-2xl font-black text-slate-950 md:text-3xl dark:text-slate-100">
          <Scan className="text-primary" size={30} />
          Scan QR Attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Scan the QR code displayed by your teacher to mark attendance.</p>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-lg dark:bg-emerald-900/20 dark:border-emerald-800"
          >
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 dark:bg-emerald-900/40">
               <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Verified!</h3>
              <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-500">
                Your attendance has been recorded successfully for this session.
              </p>
            </div>
            <button onClick={() => setSuccess(false)} className="btn-primary bg-emerald-600 hover:bg-emerald-700">Done</button>
          </motion.div>
        )}

        {error && !success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:bg-rose-900/20 dark:border-rose-800"
          >
            <AlertCircle className="text-rose-600 shrink-0" size={24} />
            <div>
               <h4 className="font-black text-rose-800 dark:text-rose-400">Scan Failed</h4>
               <p className="text-sm font-semibold text-rose-700 dark:text-rose-500">{error}</p>
               <button onClick={startScanner} className="mt-3 text-sm font-bold underline text-rose-800">Try Again</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="bg-primary/5 border-b border-slate-100 p-8 flex flex-col items-center text-center dark:bg-primary/10 dark:border-slate-800">
             {!scanning ? (
                <>
                  <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl mb-6 dark:bg-slate-800">
                    <Smartphone size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Ready to Scan?</h2>
                  <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">Ensure you are in the classroom and have granted location permissions.</p>
                  
                  <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[11px] font-black uppercase text-slate-500 dark:bg-slate-800">
                     <MapPin size={14} className={location ? "text-emerald-500" : "text-rose-500"}/>
                     {location ? "Location Verified" : "Awaiting Location..."}
                  </div>
                </>
             ) : (
                <div className="w-full space-y-4">
                   <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Scanning QR Code...</h2>
                   <div id="reader" className="overflow-hidden rounded-xl border-4 border-primary"></div>
                   <button onClick={() => { setScanning(false); scannerRef.current?.clear(); }} className="text-sm font-bold text-rose-600">Cancel Scan</button>
                </div>
             )}
          </div>
          
          {!scanning && (
            <div className="p-8 flex flex-col items-center">
               <button 
                 onClick={startScanner}
                 disabled={loading || !location}
                 className="tap-target w-full sm:w-auto min-w-[240px] px-8 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 {loading ? <Loader2 className="animate-spin" size={24} /> : <Scan size={24} />}
                 Open Scanner
               </button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex gap-3 dark:bg-blue-900/10 dark:border-blue-900/30">
         <AlertCircle size={20} className="text-primary shrink-0"/>
         <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            <strong>Proxy Protection:</strong> Our system verifies your physical presence in the room. Attempting to scan from outside or sharing sessions will result in an audit flag.
         </p>
      </div>
    </div>
  );
};

export default StudentMarkAttendance;

