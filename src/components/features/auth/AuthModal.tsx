import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { 
  studentSignIn, 
  studentSignUp, 
  studentSignOut, 
  studentResetPassword, 
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
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile | null) => void;
  initialTab?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onProfileUpdated,
  initialTab = 'signin'
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState<AcademicLevel>('200');
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }
  }, [isOpen, initialTab]);

  const handleBack = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (activeTab === 'signup' || activeTab === 'forgot') {
      setActiveTab('signin');
    } else {
      onClose();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentSignIn(email, password);
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
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentSignUp(email, password, name, level);
    setIsLoading(false);

    if (res.success) {
      const cached = getCachedStudentProfile();
      setProfile(cached);
      if (onProfileUpdated) onProfileUpdated(cached);
      toast.success('Account Created', res.message || 'Your study locker is active.');
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration could not be completed.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentResetPassword(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Password reset link sent to your email address.');
    } else {
      setErrorMessage(res.error || 'Failed to dispatch reset link.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await studentSignInWithGoogle();
    setIsLoading(false);

    if (res.success) {
      if (res.profile) {
        setProfile(res.profile);
        if (onProfileUpdated) onProfileUpdated(res.profile);
      }
      toast.success('Google Sign In', 'Connected via Google Authentication.');
      onClose();
    } else {
      setErrorMessage(res.error || 'Google sign-in could not be completed.');
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" hideHeader>
      <div className="p-5 sm:p-7 text-text-main relative select-none">
        {/* Top Navigation Row: Circular Back Arrow `<` and Close `✕` */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-surface-bg border border-border-light shadow-2xs flex items-center justify-center text-text-muted hover:text-text-main hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
            aria-label="Back"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-text-subtle hover:text-text-main hover:bg-surface-bg transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* STATE: ALREADY LOGGED IN PROFILE CARD */}
        {/* ==================================================================== */}
        {profile ? (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                Study Locker
              </h2>
              <p className="text-xs text-text-muted">
                Your authenticated account on ASSON UI
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-bg border border-border-light flex items-center gap-3.5 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-green flex items-center justify-center font-extrabold text-base border-2 border-emerald-300 dark:border-emerald-800 shrink-0">
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-text-main truncate">
                    {profile.displayName}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-xs text-text-muted truncate">{profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-card border border-border-light text-text-muted">
                    {profile.level} Level
                  </span>
                  <span className="text-[10px] text-text-subtle truncate">
                    {profile.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-light bg-surface-card text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Cloud Study Locker Active</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Your bookmarks, download history, and submitted revision notes automatically sync across your phone, tablet, and laptop.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <a
                href="/dashboard"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleSignOut}
                className="py-2.5 px-4 rounded-xl border border-border-light hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-brand-red text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-brand-red flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-brand-green flex items-start gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 1: LOG IN (Exactly matching reference image panel 1) */}
            {/* ==================================================================== */}
            {activeTab === 'signin' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Heading & Subtitle */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Log in
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Enter your email and password to securely access your account and manage your services.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
                  {/* Email Input with Squircle Mail Badge */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Password Input with Squircle Lock Badge and Eye Toggle */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 mr-1 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Remember me & Forgot Password Row */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-text-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border-light text-brand-green focus:ring-brand-green cursor-pointer accent-brand-green"
                      />
                      <span className="text-[11px] sm:text-xs">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] sm:text-xs text-text-muted hover:text-brand-green font-medium transition-colors cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? 'Verifying...' : 'Login'}
                  </button>

                  {/* Sign Up Link */}
                  <p className="text-center text-xs text-text-muted pt-1">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      Sign Up here
                    </button>
                  </p>
                </form>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-light/80" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface-card px-3 text-[11px] font-medium text-text-muted">
                      Or Continue With Account
                    </span>
                  </div>
                </div>

                {/* Social Button: Google Only (as instructed) */}
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    title="Sign in with Google"
                    className="w-12 h-12 rounded-full bg-white dark:bg-surface-elevated border border-border-light shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 2: CREATE ACCOUNT (Exactly matching reference image panel 2) */}
            {/* ==================================================================== */}
            {activeTab === 'signup' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Heading & Subtitle */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Create a new account to get started and enjoy seamless access to our features.
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3 pt-1">
                  {/* Name Input */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 mr-1 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-2 mr-1 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Academic Level Selector Pills */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[11px] font-bold text-text-muted flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-green" />
                        Academic Level:
                      </span>
                      <span className="text-[10px] text-text-subtle font-semibold">
                        UI Statistics
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['100', '200', '300', '400', 'Postgraduate'] as const).map((lvl) => {
                        const isSelected = level === lvl;
                        const label = lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setLevel(lvl)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-green text-white shadow-2xs'
                                : 'bg-surface-bg border border-border-light text-text-muted hover:text-text-main'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-3"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  {/* Already have an account link */}
                  <p className="text-center text-xs text-text-muted pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                </form>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-light/80" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface-card px-3 text-[11px] font-medium text-text-muted">
                      Or Continue With Account
                    </span>
                  </div>
                </div>

                {/* Social Button: Google Only */}
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    title="Sign up with Google"
                    className="w-12 h-12 rounded-full bg-white dark:bg-surface-elevated border border-border-light shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 3: FORGOT PASSWORD (Exactly matching reference image panel 3) */}
            {/* ==================================================================== */}
            {activeTab === 'forgot' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Heading & Subtitle */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Forgot Password
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Enter your email address to receive a reset link and regain access to your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-3.5 pt-2">
                  {/* Email Input */}
                  <div className="rounded-2xl border border-border-light bg-surface-card p-1 flex items-center shadow-2xs focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 ml-2">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? 'Sending...' : 'Continue'}
                  </button>

                  {/* Back to Sign In link */}
                  <p className="text-center text-xs text-text-muted pt-2">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
