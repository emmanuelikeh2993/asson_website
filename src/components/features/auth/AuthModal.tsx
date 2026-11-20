import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { 
  studentSignIn, 
  studentSignUp, 
  studentSignOut, 
  studentResetPassword, 
  studentVerifyOtpAndResetPassword,
  studentUpdatePasswordOnly,
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

  // Form states - strictly separated to avoid unwanted cross-filling
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLevel, setSignupLevel] = useState<AcademicLevel>('200');

  // Forgot password states (completely blank by default so user types their own email)
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles (static, independent)
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
      // Reset email state is kept empty on open so student types their email
      setResetEmail('');
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
      setProfile(cached);
      if (onProfileUpdated) onProfileUpdated(cached);
      toast.success('Account Created', res.message || 'Your study locker is active.');
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration could not be completed.');
    }
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter your student email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentResetPassword(resetEmail);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`Recovery email dispatched to ${resetEmail}. Check your inbox for the 6-digit code or reset link.`);
      // Smoothly transition to 6-digit code input screen
      setActiveTab('otp');
    } else {
      setErrorMessage(res.error || 'Failed to dispatch recovery email.');
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit recovery code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentVerifyOtpAndResetPassword(resetEmail, otpCode, newPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Updated', 'Your password has been reset successfully. Please log in.');
      setActiveTab('signin');
      setLoginEmail(resetEmail);
      setSuccessMessage('Password reset complete. You can now log in.');
    } else {
      setErrorMessage(res.error || 'Invalid or expired 6-digit code. Please try again.');
    }
  };

  const handleDirectPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentUpdatePasswordOnly(newPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Updated', 'Your password has been updated successfully.');
      setActiveTab('signin');
      setSuccessMessage('Your new password is now active. Please log in.');
    } else {
      setErrorMessage(res.error || 'Failed to update password.');
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
        {/* Top Navigation Row: Static Circular Back Arrow `<` and Close `✕` */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-surface-bg border border-border-light shadow-2xs flex items-center justify-center text-text-muted hover:text-text-main hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
          <div className="space-y-4 pt-1">
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
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
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
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-brand-red flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-brand-green flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 1: LOG IN (Rock-solid static inputs, no shaking, ASSON green) */}
            {/* ==================================================================== */}
            {activeTab === 'signin' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Log in
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Enter your email and password to securely access your account and manage your services.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
                  {/* Email Input: Fixed height, static container */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Password Input: Fixed height, static eye toggle */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        setResetEmail('');
                      }}
                      className="text-[11px] sm:text-xs text-text-muted hover:text-brand-green font-medium transition-colors cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>

                  {/* Primary CTA Button (ASSON Green - Static, no scaling) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-colors shadow-md shadow-emerald-700/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
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


              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 2: CREATE ACCOUNT (Static inputs, ASSON green) */}
            {/* ==================================================================== */}
            {activeTab === 'signup' && (
              <div className="space-y-4">
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
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Confirm Password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Academic Level Selector Pills */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1 px-1">
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
                        const isSelected = signupLevel === lvl;
                        const label = lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSignupLevel(lvl)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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

                  {/* Primary CTA Button (ASSON Green - Static) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-colors shadow-md shadow-emerald-700/20 cursor-pointer flex items-center justify-center gap-2 mt-3"
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


              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 3: FORGOT PASSWORD (Student enters their email from scratch) */}
            {/* ==================================================================== */}
            {activeTab === 'forgot' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Forgot Password
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Enter your email address to receive a 6-digit recovery code.
                  </p>
                </div>

                <form onSubmit={handleSendRecoveryCode} className="space-y-3.5 pt-2">
                  {/* Email Input: Completely blank by default */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-colors shadow-md shadow-emerald-700/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? 'Sending code...' : 'Continue'}
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

            {/* ==================================================================== */}
            {/* SCREEN 4: 6-DIGIT CODE + NEW PASSWORD VERIFICATION */}
            {/* ==================================================================== */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Enter the 6-digit recovery code sent to <span className="font-bold text-text-main">{resetEmail}</span> and choose a new password.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3 pt-2">
                  {/* 6-Digit Code Input */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center shrink-0 mr-2.5">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code (e.g. 123456)"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 h-full bg-transparent text-sm sm:text-base text-text-main placeholder:text-text-subtle focus:outline-none font-mono tracking-widest font-bold text-center"
                    />
                  </div>

                  {/* New Password */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm New Password */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-colors shadow-md shadow-emerald-700/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? 'Updating password...' : 'Update Password'}
                  </button>

                  {/* Resend and Back links */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={handleSendRecoveryCode}
                      disabled={isLoading}
                      className="text-text-muted hover:text-brand-green font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend 6-digit code</span>
                    </button>

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
                  </div>
                </form>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SCREEN 5: DIRECT PASSWORD RESET (When arriving from email link) */}
            {/* ==================================================================== */}
            {activeTab === 'new-password' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    Create New Password
                  </h2>
                  <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                    Set a new password for your authenticated ASSON UI study locker account.
                  </p>
                </div>

                <form onSubmit={handleDirectPasswordUpdate} className="space-y-3 pt-2">
                  {/* New Password */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm New Password */}
                  <div className="h-12 w-full rounded-2xl border border-border-light bg-surface-card flex items-center px-3 shadow-2xs focus-within:border-brand-green">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-text-muted flex items-center justify-center shrink-0 mr-2.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="w-8 h-8 flex items-center justify-center shrink-0 text-text-muted hover:text-text-main cursor-pointer"
                      title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Primary CTA Button (ASSON Green) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-deep text-white font-extrabold text-sm transition-colors shadow-md shadow-emerald-700/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? 'Saving password...' : 'Save New Password'}
                  </button>

                  <p className="text-center text-xs text-text-muted pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-brand-green hover:underline cursor-pointer"
                    >
                      Return to Sign In
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
