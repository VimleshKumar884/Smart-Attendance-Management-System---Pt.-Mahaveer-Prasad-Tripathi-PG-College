import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, GraduationCap, ShieldCheck, KeyRound, ArrowLeft, Hash, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'faculty'
  
  // Student Login State
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  
  // Faculty Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const { login, getSecurityQuestion: fetchSecurityQuestion, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let loginData = {};
    if (loginType === 'student') {
      loginData = { loginType: 'student', rollNumber, dob };
    } else {
      loginData = { loginType: 'faculty', email, password };
    }

    try {
      const data = await login(loginData);
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await fetchSecurityQuestion(forgotEmail);
      setSecurityQuestion(data.question);
      setResetStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(forgotEmail, securityAnswer, newPassword);
      setSuccessMsg('Password reset successfully! You can now login.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetStep(1);
        setSuccessMsg('');
        setForgotEmail('');
        setSecurityAnswer('');
        setNewPassword('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect answer or failed to reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Refined Background - subtle institutional feel */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap justify-around items-center">
        {[...Array(20)].map((_, i) => <GraduationCap key={i} size={120} className="rotate-12" />)}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10"
      >
        {/* Simple Branding Header */}
        <div className="bg-primary p-8 text-center border-b border-primary-dark/20">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 mb-4 mx-auto backdrop-blur-sm">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">PT. MPT PG College</h2>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Institutional Attendance Portal</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Clean Portal Selector */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => { setLoginType('student'); setError(''); }}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginType === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => { setLoginType('faculty'); setError(''); }}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginType === 'faculty' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Faculty
                  </button>
                </div>

                {successMsg && (
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                    {successMsg}
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {loginType === 'faculty' ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm"
                            placeholder="faculty@college.edu"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                          <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); }} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</button>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                        <div className="relative group">
                          <Hash className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="text" 
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm uppercase"
                            placeholder="CS2026001"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                        <div className="relative group">
                          <Calendar className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="date" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm text-slate-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Access Account'}
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Portal Support</p>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Registrar Office</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="forgot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <button 
                  onClick={() => { setIsForgotPassword(false); setResetStep(1); setError(''); }}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
                
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Recovery</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {resetStep === 1 ? "Verify Email" : "Verification Step 2"}
                  </p>
                </div>

                <form onSubmit={resetStep === 1 ? handleForgotSubmit : handleResetSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                      {error}
                    </div>
                  )}
                  
                  {resetStep === 1 ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                          type="email" 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="input-field pl-10 py-3 font-bold text-sm"
                          placeholder="faculty@college.edu"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Security Question</label>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-slate-800 font-bold text-xs leading-relaxed italic">
                          "{securityQuestion}"
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Answer</label>
                        <div className="relative group">
                          <KeyRound className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="text" 
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm"
                            placeholder="Exact registered answer"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field pl-10 py-3 font-bold text-sm"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-black shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : (resetStep === 1 ? 'Verify Email' : 'Update Password')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer simple text */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="text-slate-300" />
            Institutional Grade Encryption Active
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
