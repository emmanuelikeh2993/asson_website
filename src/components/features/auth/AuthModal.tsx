import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { 
  studentSignIn, 
  studentSignUp, 
  studentSignOut, 
  studentResetPassword, 
  getCachedStudentProfile 
} from '../../../lib/supabase';
import { UserProfile, AcademicLevel } from '../../../types';
import { useToast } from '../../ui/Toast';
import { 
  User, 
  Lock, 
  Mail, 
  GraduationCap, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  BookMarked, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onProfileUpdated }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [level, setLevel] = useState<AcademicLevel>('200');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const cached = getCachedStudentProfile();
      setProfile(cached);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
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
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setErrorMessage('Please complete all fields. Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentSignUp(email, password, displayName, level);
    setIsLoading(false);

    if (res.success) {
      const cached = getCachedStudentProfile();
      setProfile(cached);
      if (onProfileUpdated) onProfileUpdated(cached);
      toast.success('Account Created', res.message || 'Your study locker is active.');
      onClose();
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your student email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const res = await studentResetPassword(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Password reset link sent to your email.');
    } else {
      setErrorMessage(res.error || 'Failed to dispatch reset link.');
    }
  };

  const handleSignOut = async () => {
    await studentSignOut();
    setProfile(null);
    if (onProfileUpdated) onProfileUpdated(null);
    toast.info('Signed Out', 'Logged out of your student study locker.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={profile ? 'Student Study Account' : 'Student Study Locker'}>
      <div className="space-y-5 text-text-main">
        {/* IF USER IS ALREADY LOGGED IN: WhatsApp / Spotify Clean Profile Card */}
        {profile ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-bg border border-border-light flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-green flex items-center justify-center font-bold text-base border border-emerald-300 dark:border-emerald-800">
                {profile.displayName.charAt(0).toUpperCase()}
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
                  <span className="text-[10px] text-text-subtle">
                    {profile.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border-light bg-surface-card text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Cloud Study Locker Active</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Your bookmarks, download history, and submitted revision notes automatically sync across your phone, tablet, and computer.
              </p>
            </div>

            <div className="pt-2 border-t border-border-light flex items-center justify-between">
              <a
                href="/dashboard"
                onClick={onClose}
                className="text-xs font-bold text-brand-green hover:underline inline-flex items-center gap-1"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-xs font-semibold text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        ) : (
          /* IF GUEST: Clean Tabs for Sign In or Create Account */
          <div className="space-y-4">
            {/* Segmented Tab Control (WhatsApp Style) */}
            <div className="flex p-1 rounded-xl bg-surface-bg border border-border-light text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'signin'
                    ? 'bg-surface-card text-text-main shadow-2xs font-extrabold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'signup'
                    ? 'bg-surface-card text-text-main shadow-2xs font-extrabold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Notifications / Errors */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-brand-red flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-brand-green flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-text-main block mb-1">Student Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. tunde@stu.ui.edu.ng or personal email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                    />
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-text-main block">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] text-brand-green hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main font-mono focus:outline-none focus:border-brand-green"
                    />
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="w-full justify-center font-bold text-xs h-10 mt-2 shadow-xs"
                >
                  {isLoading ? 'Verifying...' : 'Sign In to Study Locker'}
                </Button>
              </form>
            )}

            {/* TAB 2: CREATE STUDENT ACCOUNT */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-text-main block mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Balogun"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                    />
                    <User className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Student Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@stu.ui.edu.ng or gmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                    />
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-text-main block mb-1">Academic Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as AcademicLevel)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green font-semibold"
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-text-main block mb-1">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main font-mono focus:outline-none focus:border-brand-green"
                      />
                      <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-text-subtle pt-1 leading-relaxed">
                  Per NDPA compliance: Zero matriculation number collection. Public library downloads stay 100% login-free.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  className="w-full justify-center font-bold text-xs h-10 shadow-xs"
                >
                  {isLoading ? 'Creating Account...' : 'Create Study Locker Account'}
                </Button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
                <p className="text-xs text-text-muted leading-relaxed">
                  Enter your registered student email. We will send a secure password reset link to recover your account.
                </p>

                <div>
                  <label className="font-bold text-text-main block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. tunde@stu.ui.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('signin')}
                    className="flex-1 text-xs"
                  >
                    Back to Sign In
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isLoading}
                    className="flex-1 text-xs font-bold"
                  >
                    {isLoading ? 'Sending...' : 'Send Recovery Link'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

