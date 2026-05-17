/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Loader2, Lock, Mail, UserCog, UserRoundCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, roleHomePath } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getFriendlyError, INSTITUTION_NAME, SYSTEM_NAME } from '../lib/helpers';

const roleConfig = {
  admin: {
    label: 'Admin',
    icon: UserCog,
    expectedRole: 'admin',
    idLabel: 'Admin Email / ID',
    passwordLabel: 'Password',
    placeholder: 'admin@college.edu',
  },
  faculty: {
    label: 'Faculty',
    icon: UserRoundCheck,
    expectedRole: 'teacher',
    idLabel: 'Faculty Email / ID',
    passwordLabel: 'Password',
    placeholder: 'faculty@college.edu',
  },
  student: {
    label: 'Student',
    icon: Users,
    expectedRole: 'student',
    idLabel: 'Student Email / Roll No',
    passwordLabel: 'Password / DOB',
    placeholder: 'CS2026001',
  },
};

const Login = () => {
  const { role = 'student' } = useParams();
  const config = roleConfig[role];
  const Icon = config?.icon || Users;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const expectedPath = useMemo(() => roleHomePath[config?.expectedRole], [config]);

  useEffect(() => {
    setFieldErrors({});
    setServerError('');
    setIdentifier('');
    setPassword('');
    setIsForgotPassword(false);
    setForgotStep('email');
    setForgotEmail('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setAttempts(0);
  }, [role]);

  if (!config) {
    return <Navigate to="/login/student" replace />;
  }

  if (user?.role && roleHomePath[user.role]) {
    return <Navigate to={roleHomePath[user.role]} replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!identifier.trim()) nextErrors.identifier = `${config.idLabel} is required.`;
    if (!password.trim()) nextErrors.password = `${config.passwordLabel} is required.`;
    if (role !== 'student' && identifier.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      nextErrors.identifier = 'Please enter a valid email address.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const id = identifier.trim();
    const secret = password.trim();

    if (role === 'student') {
      if (id.includes('@')) {
        return { loginType: 'email', email: id, password: secret };
      }
      return { loginType: 'student', rollNumber: id, dob: secret };
    }

    return { loginType: role, email: id, password: secret };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(buildPayload());
      if (data.user.role !== config.expectedRole) {
        logout();
        setServerError(`This account is not allowed to access the ${config.label} portal.`);
        return;
      }

      showToast(`${config.label} login successful.`, 'success');
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : expectedPath, { replace: true });
    } catch (error) {
      setServerError(getFriendlyError(error, 'Credentials are incorrect. Please check and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQuestion = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!forgotEmail.trim()) {
      setServerError('Registered Email ID is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/get-security-question', { email: forgotEmail.trim() });
      setSecurityQuestion(res.data.question);
      setForgotStep('answer');
    } catch (error) {
      setServerError(getFriendlyError(error, 'No account found with this email'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (event) => {
    event.preventDefault();
    setServerError('');
    if (attempts >= 3) {
      setForgotStep('locked');
      setServerError('Too many attempts. Contact admin.');
      return;
    }
    if (!securityAnswer.trim()) {
      setServerError('Security answer is required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/verify-security-answer', {
        email: forgotEmail.trim(),
        answer: securityAnswer.trim(),
      });
      setForgotStep('password');
    } catch {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setForgotStep('locked');
        setServerError('Too many attempts. Contact admin.');
      } else {
        setServerError('Incorrect answer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setServerError('');
    if (newPassword.length < 8) {
      setServerError('Password must be minimum 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError('New password and confirm password must match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        answer: securityAnswer.trim(),
        newPassword,
      });
      showToast('Password updated successfully.', 'success');
      setIsForgotPassword(false);
      setForgotStep('email');
      setIdentifier(forgotEmail);
      setPassword('');
      navigate('/login/faculty', { replace: true });
    } catch (error) {
      setServerError(getFriendlyError(error, 'Could not update password. Please start again.'));
      if (error.response?.status === 404) {
        setForgotStep('email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white shadow-md">
            <GraduationCap size={34} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide text-slate-950 sm:text-2xl">{INSTITUTION_NAME}</h1>
          <p className="mt-1 text-sm font-bold text-primary">{SYSTEM_NAME}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="grid grid-cols-3 border-b border-slate-200 p-2">
            {Object.entries(roleConfig).map(([key, item]) => {
              const TabIcon = item.icon;
              const active = key === role;
              return (
                <Link
                  key={key}
                  to={`/login/${key}`}
                  className={`tap-target flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-bold transition ${
                    active ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <TabIcon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <form
            onSubmit={isForgotPassword
              ? forgotStep === 'email'
                ? handleFetchQuestion
                : forgotStep === 'answer'
                  ? handleVerifyAnswer
                  : forgotStep === 'password'
                    ? handleResetPassword
                    : (event) => event.preventDefault()
              : handleSubmit}
            className="space-y-5 p-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Icon size={26} />
              </div>
              <h2 className="text-2xl font-black text-slate-950">{isForgotPassword ? 'Reset Faculty Password' : `${config.label} Login`}</h2>
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {serverError}
              </div>
            )}

            {isForgotPassword ? (
              <ForgotPasswordFields
                step={forgotStep}
                email={forgotEmail}
                setEmail={setForgotEmail}
                question={securityQuestion}
                answer={securityAnswer}
                setAnswer={setSecurityAnswer}
                attempts={attempts}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                loading={loading}
              />
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="identifier" className="text-sm font-bold text-slate-700">{config.idLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(event) => {
                        setIdentifier(event.target.value);
                        setFieldErrors((current) => ({ ...current, identifier: '' }));
                      }}
                      placeholder={config.placeholder}
                      className={`input-field min-h-11 pl-10 ${fieldErrors.identifier ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                      autoComplete="username"
                    />
                  </div>
                  {fieldErrors.identifier && <p className="text-sm font-semibold text-red-600">{fieldErrors.identifier}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-sm font-bold text-slate-700">{config.passwordLabel}</label>
                    {role === 'faculty' && (
                      <button type="button" onClick={() => { setIsForgotPassword(true); setServerError(''); }} className="text-sm font-bold text-primary hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((current) => ({ ...current, password: '' }));
                      }}
                      placeholder={role === 'student' ? 'Password or YYYY-MM-DD' : 'Enter password'}
                      className={`input-field min-h-11 pl-10 ${fieldErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
                      autoComplete="current-password"
                    />
                  </div>
                  {fieldErrors.password && <p className="text-sm font-semibold text-red-600">{fieldErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                  Login
                </button>
              </>
            )}

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotStep('email');
                  setServerError('');
                }}
                className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back to Faculty Login
              </button>
            )}

            <Link to="/" className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const ForgotPasswordFields = ({
  step,
  email,
  setEmail,
  question,
  answer,
  setAnswer,
  attempts,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
}) => {
  if (step === 'locked') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
        Too many attempts. Contact admin.
      </div>
    );
  }

  if (step === 'password') {
    return (
      <>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Security answer verified. Set a new password.
        </div>
        <PasswordField id="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} />
        <PasswordField id="confirmPassword" label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />
        <SubmitButton loading={loading} label="Update Password" />
      </>
    );
  }

  if (step === 'answer') {
    return (
      <>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-primary">Security Question</p>
          <p className="mt-1 text-sm font-bold text-slate-800">{question}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="securityAnswer" className="text-sm font-bold text-slate-700">Your Answer</label>
          <input id="securityAnswer" value={answer} onChange={(event) => setAnswer(event.target.value)} className="input-field min-h-11" placeholder="Type your answer" />
          <p className="text-xs font-semibold text-slate-500">{3 - attempts} attempt{3 - attempts === 1 ? '' : 's'} remaining.</p>
        </div>
        <SubmitButton loading={loading} label="Verify Answer" />
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="forgotEmail" className="text-sm font-bold text-slate-700">Registered Email ID</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input id="forgotEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field min-h-11 pl-10" placeholder="faculty@college.edu" />
        </div>
      </div>
      <SubmitButton loading={loading} label="Get Security Question" />
    </>
  );
};

const PasswordField = ({ id, label, value, onChange }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-bold text-slate-700">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input id={id} type="password" value={value} onChange={(event) => onChange(event.target.value)} className="input-field min-h-11 pl-10" placeholder="Minimum 8 characters" />
    </div>
  </div>
);

const SubmitButton = ({ loading, label }) => (
  <button type="submit" disabled={loading} className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70">
    {loading ? <Loader2 className="animate-spin" size={20} /> : null}
    {label}
  </button>
);

export default Login;
