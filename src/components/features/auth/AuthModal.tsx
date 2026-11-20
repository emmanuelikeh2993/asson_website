import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { 
  studentSignIn, 
  studentSignUp, 
  studentSignOut, 
  studentResetPassword, 
  studentVerifyOtpAndResetPassword,
  studentUpdatePasswordOnly,
  studentSignInWithGoogle,
  getCachedStudentProfile 
} from '../../../lib/supabase';
import { UserProfile, AcademicLevel } from '../../../types';
import { useToast } from '../../ui/Toast';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  LogOut,
  GraduationCap,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile | null) => void;
  initialTab?: 'signin' | 'signup' | 'forgot' | 'new-password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onProfileUpdated,
  initialTab = 'signin'
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot' | 'otp' | 'new-password'>(initialTab);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLevel, setSignupLevel] = useState<AcademicLevel>('200');

  // Forgot password states
  const [resetEmail, setResetEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const cached = getCachedStudentProfile();
      setProfile(cached);
      setActiveTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
      setResetEmail('');
      setEmailSent(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }, [isOpen, initialTab]);

  const handleBack = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (activeTab === 'otp') {
      setActiveTab('forgot');
    } else if (activeTab === 'signup' || activeTab === 'forgot' || activeTab === 'new-password') {
      setActiveTab('signin');
      setEmailSent(false);
    } else {
      onClose();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentSignIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (res.success && res.profile) {
      setProfile(res.profile);
      if (onProfileUpdated) onProfileUpdated(res.profile);
      toast.success('Signed In', `Welcome back, ${res.profile.displayName}!`);
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentSignUp(signupEmail, signupPassword, signupName, signupLevel);
    setIsLoading(false);

    if (res.success) {
      const cached = getCachedStudentProfile();
      if (cached) {
        setProfile(cached);
        if (onProfileUpdated) onProfileUpdated(cached);
      }
      toast.success('Account Created', res.message || 'Welcome to the ASSON UI Student Portal!');
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check your details.');
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentResetPassword(resetEmail.trim());
    setIsLoading(false);

    if (res.success) {
      setEmailSent(true);
      toast.info('Recovery Sent', 'Password reset instructions have been delivered to your email.');
    } else {
      setErrorMessage(res.error || 'Failed to send recovery email.');
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentVerifyOtpAndResetPassword(resetEmail.trim(), otpCode.trim(), newPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Reset', 'Your password has been reset successfully. Please log in.');
      setActiveTab('signin');
      setSuccessMessage('Password reset successful. Please enter your new password to sign in.');
    } else {
      setErrorMessage(res.error || 'Invalid or expired 6-digit code. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await studentSignInWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Google authentication is currently unavailable.');
    }
  };

  const handleSignOut = async () => {
    await studentSignOut();
    setProfile(null);
    if (onProfileUpdated) onProfileUpdated(null);
    toast.info('Signed Out', 'Logged out of your student study locker.');
    setActiveTab('signin');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" hideHeader>
      <div className="p-6 sm:p-8 text-text-main relative select-none">
        {/* Top Navigation Row: Back button `<` when in sub-screens and Close `✕` */}
        <div className="flex items-center justify-between mb-2">
          {activeTab !== 'signin' && !profile ? (
            <button
              type="button"
              onClick={handleBack}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Back"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer ml-auto"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* STATE: ALREADY LOGGED IN PROFILE CARD */}
        {/* ==================================================================== */}
        {profile ? (
          <div className="space-y-5 pt-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-4 mb-2.5">
                <img
                  src="/logo/asson_logo.png"
                  alt="ASSON Official Logo"
                  className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain shrink-0"
                />
                <img
                  src="/logo/ui_crest.jpg"
                  alt="University of Ibadan Crest"
                  className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain rounded-md shrink-0"
                />
              </div>

              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Study Locker
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Your authenticated account on ASSON UI
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3.5 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-[#087A3E]/10 text-[#087A3E] flex items-center justify-center font-extrabold text-base border-2 border-[#087A3E]/30 shrink-0">
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {profile.displayName}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#087A3E] shrink-0" />
                </div>
                <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {profile.level} Level
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {profile.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#087A3E] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#087A3E]" />
                <span>Cloud Study Locker Active</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Your bookmarks, download history, and peer submissions sync automatically across your devices.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href="/dashboard"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleSignOut}
                className="py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Inline Alert / Notification Messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-[#087A3E] dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 1: LOG IN (CLEAN, NO ROLES, NO GOOGLE, EXACT SIZING)          */}
            {/* ==================================================================== */}
            {activeTab === 'signin' && (
              <div className="space-y-4">
                {/* Official ASSON Logo + UI Crest Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-2.5">
                    <img
                      src="/logo/asson_logo.png"
                      alt="ASSON Official Logo"
                      className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain shrink-0"
                    />
                    <img
                      src="/logo/ui_crest.jpg"
                      alt="University of Ibadan Crest"
                      className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain rounded-md shrink-0"
                    />
                  </div>

                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Log in
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Log in to access your student study portal
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
                  {/* Email / Username Input */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                      Email / Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="yourname@student.ui.edu.ng"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs font-mono focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Remember me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <label className="flex items-center gap-2 text-zinc-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-[#087A3E] focus:ring-[#087A3E] cursor-pointer accent-[#087A3E]"
                        />
                        <span className="text-[11px]">Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          setResetEmail('');
                        }}
                        className="text-[11px] text-zinc-500 hover:text-[#087A3E] transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button: ASSON Green with Arrow */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>{isLoading ? 'Verifying Credentials...' : 'Access Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Sign Up Link */}
                <p className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-3">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="font-bold text-[#087A3E] hover:underline cursor-pointer"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 2: SIGN UP (HEADER: "Welcome", NO GOOGLE, CLEAN SIZING)        */}
            {/* ==================================================================== */}
            {activeTab === 'signup' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-2.5">
                    <img
                      src="/logo/asson_logo.png"
                      alt="ASSON Official Logo"
                      className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain shrink-0"
                    />
                    <img
                      src="/logo/ui_crest.jpg"
                      alt="University of Ibadan Crest"
                      className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain rounded-md shrink-0"
                    />
                  </div>

                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Welcome
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Create your student account to get started
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3 pt-1">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Babatunde Ayomide"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                      />
                    </div>
                  </div>

                  {/* Academic Level */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Academic Level
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['100', '200', '300', '400', 'Postgraduate'] as const).map((lvl) => {
                        const isSelected = signupLevel === lvl;
                        const label = lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSignupLevel(lvl)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#087A3E] text-white shadow-2xs'
                                : 'bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="yourname@student.ui.edu.ng"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Min 6 chars"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs font-mono focus:outline-none focus:border-[#087A3E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showSignupConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Re-type password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs font-mono focus:outline-none focus:border-[#087A3E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-3"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-3">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-[#087A3E] hover:underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 3: FORGOT PASSWORD                                            */}
            {/* ==================================================================== */}
            {activeTab === 'forgot' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-2.5">
                    <img
                      src="/logo/asson_logo.png"
                      alt="ASSON Official Logo"
                      className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain shrink-0"
                    />
                    <img
                      src="/logo/ui_crest.jpg"
                      alt="University of Ibadan Crest"
                      className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain rounded-md shrink-0"
                    />
                  </div>

                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Reset password
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Enter your email to receive recovery instructions
                  </p>
                </div>

                {emailSent ? (
                  <div className="text-center space-y-3 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#087A3E] flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      We've sent a recovery link to{' '}
                      <span className="font-bold text-zinc-900 dark:text-white">{resetEmail}</span>.
                    </p>

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signin');
                          setEmailSent(false);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Back to Log In
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('otp')}
                        className="text-xs font-semibold text-zinc-500 hover:text-[#087A3E] underline cursor-pointer block mx-auto pt-1"
                      >
                        Have a 6-digit recovery code? Enter code
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendRecoveryCode} className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                        Registered Student Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="yourname@student.ui.edu.ng"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
                    >
                      <span>{isLoading ? 'Sending instructions...' : 'Send Recovery Link'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-xs text-zinc-500 pt-1">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signin');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="font-bold text-[#087A3E] hover:underline cursor-pointer"
                      >
                        Log in here
                      </button>
                    </p>
                  </form>
                )}
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 4: 6-DIGIT CODE + NEW PASSWORD                                */}
            {/* ==================================================================== */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 mb-2.5">
                    <img
                      src="/logo/asson_logo.png"
                      alt="ASSON Official Logo"
                      className="w-11 h-11 max-w-[44px] max-h-[44px] object-contain shrink-0"
                    />
                    <img
                      src="/logo/ui_crest.jpg"
                      alt="University of Ibadan Crest"
                      className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain rounded-md shrink-0"
                    />
                  </div>

                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Verify & Reset
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Enter the 6-digit code sent to <strong className="text-zinc-900 dark:text-white">{resetEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      6-Digit Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <KeyRound className="w-4 h-4 text-[#087A3E]" />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm font-mono tracking-widest font-bold text-center focus:outline-none focus:border-[#087A3E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Min 6 chars"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#087A3E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Re-type password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#087A3E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600"
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-3"
                  >
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <button
                      type="button"
                      onClick={handleSendRecoveryCode}
                      disabled={isLoading}
                      className="text-zinc-500 hover:text-[#087A3E] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-[#087A3E] hover:underline cursor-pointer"
                    >
                      Back to Log In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
