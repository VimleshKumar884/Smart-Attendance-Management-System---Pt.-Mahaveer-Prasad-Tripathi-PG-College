import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, GraduationCap, ShieldCheck, KeyRound, ArrowLeft, Hash, Calendar, UserCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [loginType, setLoginType] = useState('student'); // 'student' or 'faculty'
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Student Login State
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  
  // Faculty Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      setError(err.response?.data?.message || 'Galti: Email ya password sahi nahi hai.');
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
      setError('Email nahi mila. Kripya sahi email dalein.');
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
      setSuccessMsg('Password badal diya gaya hai! Ab aap login kar sakte hain.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetStep(1);
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setError('Sahi jawab nahi hai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      
      {/* College Logo/Name Section - Very Clear */}
      <div className="text-center mb-8">
        <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
          <GraduationCap size={40} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight">
          Pt. Mahaveer Prasad Tripathi PG College
        </h1>
        <p className="text-slate-500 font-bold mt-1 tracking-widest text-sm uppercase">Attendance Portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border-t-8 border-primary overflow-hidden">
        
        {/* Simple Tab Selection */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setLoginType('student'); setIsForgotPassword(false); setError(''); }}
            className={`flex-1 py-5 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${loginType === 'student' ? 'bg-white text-primary' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <Users size={18} />
            Student (Chatra)
          </button>
          <button 
            onClick={() => { setLoginType('faculty'); setIsForgotPassword(false); setError(''); }}
            className={`flex-1 py-5 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${loginType === 'faculty' ? 'bg-white text-primary' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <UserCheck size={18} />
            Faculty (Shikshak)
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <div className="mb-8 text-center">
                  <h2 className="text-xl font-black text-slate-800">
                    {loginType === 'student' ? 'Student Login' : 'Teacher/Admin Login'}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">Enter details below to enter your portal</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-bold border border-red-100 mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg text-sm font-bold border border-emerald-100 mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {loginType === 'faculty' ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Email Address</label>
                        <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700"
                          placeholder="email@college.edu"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black text-slate-500 uppercase">Password</label>
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black text-primary hover:underline uppercase">Forgot?</button>
                        </div>
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Roll Number</label>
                        <input 
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700 uppercase"
                          placeholder="CS2026001"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Date of Birth (DOB)</label>
                        <input 
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-600"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button 
                  onClick={() => { setIsForgotPassword(false); setResetStep(1); setError(''); }}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest mb-6"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Reset Password</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Verification Required</p>
                </div>

                <form onSubmit={resetStep === 1 ? handleForgotSubmit : handleResetSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-[10px] font-black uppercase border border-red-100 mb-6 flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {error}
                    </div>
                  )}

                  {resetStep === 1 ? (
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase ml-1">Your Registered Email</label>
                      <input 
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary outline-none font-bold text-sm"
                        placeholder="email@college.edu"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <p className="text-[10px] font-black text-primary uppercase mb-1">Security Question:</p>
                        <p className="text-sm font-bold text-slate-800 italic">"{securityQuestion}"</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Your Answer</label>
                        <input 
                          type="text"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary outline-none font-bold text-sm"
                          placeholder="Type answer here..."
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">New Password</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary outline-none font-bold text-sm"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (resetStep === 1 ? 'Verify Email' : 'Change Password')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Institutional Portal Security</p>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-tighter">Pt. Mahaveer Prasad Tripathi PG College, IT Department</p>
    </div>
  );
};

export default Login;