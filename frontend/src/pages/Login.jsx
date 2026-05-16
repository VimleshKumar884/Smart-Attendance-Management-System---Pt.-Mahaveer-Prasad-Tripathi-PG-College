import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, GraduationCap, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
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
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Answer & Reset
  const [successMsg, setSuccessMsg] = useState('');

  const { login, getSecurityQuestion: fetchSecurityQuestion, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(email, password);
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 relative overflow-hidden">
      {/* Decorative institutional background elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-20 right-10 w-40 h-40 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-20 left-10 w-64 h-64 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 mb-8">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">PT. MPT <br/>PG College</h2>
            <div className="w-12 h-1 bg-accent mb-8"></div>
            <p className="text-lg text-white/80 font-medium leading-relaxed max-w-sm">
              Empowering academic excellence through digital innovation and transparent administration.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="text-accent" size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Security Protocol</p>
                <p className="text-sm font-bold">End-to-End Encrypted Access</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">© 2026 PT. MPT PG College • IT Division</p>
          </div>
        </div>

        {/* Right Side: Dynamic Form Area */}
        <div className="p-12 lg:p-16 flex flex-col justify-center relative">
          
          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Portal Authentication</h3>
                  <p className="text-slate-400 text-sm font-bold mt-2">Enter your institutional credentials to proceed.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {successMsg && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                      {successMsg}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 placeholder:text-slate-300"
                          placeholder="name@college.edu"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Password</label>
                        <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700 placeholder:text-slate-300"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Continue'}
                  </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Help & Enrollment</p>
                  <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Contact Registrar</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <button 
                  onClick={() => { setIsForgotPassword(false); setResetStep(1); setError(''); }}
                  className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest mb-8"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
                
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Recovery</h3>
                  <p className="text-slate-400 text-sm font-bold mt-2">
                    {resetStep === 1 ? "Enter your email to retrieve your security question." : "Answer your security question to reset your password."}
                  </p>
                </div>

                <form onSubmit={resetStep === 1 ? handleForgotSubmit : handleResetSubmit} className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}
                  
                  {resetStep === 1 ? (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registered Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                            type="email" 
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                            placeholder="name@college.edu"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Security Question</label>
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-slate-800 font-bold text-sm">
                          {securityQuestion}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Answer</label>
                        <div className="relative group">
                          <KeyRound className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                            type="text" 
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
                            placeholder="Answer exactly as registered..."
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-700"
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
                    className="w-full bg-primary text-white py-4 rounded-xl font-black hover:bg-primary-dark transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (resetStep === 1 ? 'Get Question' : 'Reset Password')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;