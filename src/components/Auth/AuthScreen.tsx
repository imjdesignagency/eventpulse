import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  QrCode, 
  MessageSquare, 
  Ticket, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthScreen: React.FC = () => {
  const { signup, login, loginGoogle, loginDemo, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login' | 'forgot'>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('organizer');
  const [phone, setPhone] = useState('+1 ');
  const [company, setCompany] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0 to 5
  };

  const passwordStrength = getPasswordStrength();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal or brand name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        displayName: fullName.trim(),
        role,
        phone: phone.trim() !== '+1' ? phone.trim() : undefined,
        company: company.trim() || undefined,
      });
      setSuccessMessage('Account created successfully! Welcome to TMB Events.');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use a stronger password.');
      } else {
        setErrorMessage(err.message || 'Failed to create account. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      setSuccessMessage('Signed in successfully.');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials or sign up.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please reset your password or try again later.');
      } else {
        setErrorMessage(err.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address to receive reset instructions.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccessMessage(`Password reset link sent to ${email}. Check your inbox!`);
    } catch (err: any) {
      console.error('Reset error:', err);
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginGoogle();
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `Domain (${window.location.hostname}) is not authorized in Firebase. Add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains, or use Email/Password sign up.`
        );
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (demoRole: UserRole) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginDemo(demoRole);
    } catch (err: any) {
      console.error('Demo error:', err);
      setErrorMessage('Unable to initialize demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E0E0E0] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Background Decorative Gold Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#0F0F0F] rounded-3xl border border-[#262626] shadow-2xl shadow-black/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Brand Story & Feature Highlights (Hidden on small mobile) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#141414] via-[#0E0E0E] to-[#121212] p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#262626] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle gold watermark pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5 text-[#D4AF37] pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2A2410] to-[#161616] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg shadow-black/60">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-brand font-bold text-xl tracking-wider text-white">
                    TMB EVENTS
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-[#888888]">Exclusive Event Platform & RSVP Hub</p>
              </div>
            </div>

            {/* Intro Pitch */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                Private Access <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0D279] via-[#D4AF37] to-[#AA8B2E]">
                  To Premium Events.
                </span>
              </h2>
              <p className="text-xs text-[#999999] leading-relaxed font-light">
                Please create your verified account to unlock ticket bookings, host luxury summits, send bulk WhatsApp invites, and manage digital QR passes.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3.5 pt-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#181818]/60 border border-[#262626]">
                <div className="w-8 h-8 rounded-xl bg-[#102418] border border-[#1E4D30] text-[#4ADE80] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Gateway & Reminders</h4>
                  <p className="text-[11px] text-[#777777] font-light">
                    Automated invitation blasts with real-time delivery receipts and 48h reminders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#181818]/60 border border-[#262626]">
                <div className="w-8 h-8 rounded-xl bg-[#1D1B13] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Encrypted Door QR Check-In</h4>
                  <p className="text-[11px] text-[#777777] font-light">
                    Live camera door scanner with sound effects and instant duplicate detection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#181818]/60 border border-[#262626]">
                <div className="w-8 h-8 rounded-xl bg-[#181818] border border-[#333333] text-[#CCCCCC] flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Tier VIP Pass Management</h4>
                  <p className="text-[11px] text-[#777777] font-light">
                    Custom ticket tiers, table allocations, dietary tracking, and CSV bulk import.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-6 mt-6 border-t border-[#222222] relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block mb-2 font-semibold">
              Instant 1-Click Evaluation Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess('organizer')}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#D4AF37]/50 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Host Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAccess('attendee')}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] hover:border-[#D4AF37]/50 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Ticket className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>Guest Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#0F0F0F]">
          {/* Top Mode Selector Tabs */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4 mb-6">
            <div className="flex items-center gap-2 bg-[#161616] p-1 rounded-2xl border border-[#262626]">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#666666] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Firebase SSL</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#2B1414] border border-[#4A2020] text-[#F87171] text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#102418] border border-[#1E4D30] text-[#4ADE80] text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* FORM 1: CREATE ACCOUNT (SIGN UP) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white">Create Your Account</h3>
                <p className="text-xs text-[#888888] font-light">
                  Join EventPulse to discover VIP events, reserve passes, and manage guest lists.
                </p>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] mb-1.5">
                  Account Intention
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'organizer'
                        ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold shadow-sm'
                        : 'border-[#262626] bg-[#161616] text-[#888888] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Event Organizer</span>
                    </div>
                    <p className="text-[10px] text-[#777777] mt-0.5">Host, send invites & check-in</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('attendee')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'attendee'
                        ? 'border-[#D4AF37] bg-[#1D1B13] text-[#D4AF37] font-bold shadow-sm'
                        : 'border-[#262626] bg-[#161616] text-[#888888] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span>VIP Attendee</span>
                    </div>
                    <p className="text-[10px] text-[#777777] mt-0.5">Book tickets & receive passes</p>
                  </button>
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type="text"
                      required
                      placeholder="Alexander Sterling"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type="email"
                      required
                      placeholder="alexander@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">
                    WhatsApp Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type="tel"
                      placeholder="+14155550199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white font-mono text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">
                    Organization / Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type="text"
                      placeholder="Apex Global Ventures"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Create Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#666666] hover:text-[#AAAAAA] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#888888]">Security Strength</span>
                    <span
                      className={`font-bold ${
                        passwordStrength <= 2
                          ? 'text-[#F87171]'
                          : passwordStrength <= 4
                          ? 'text-[#D4AF37]'
                          : 'text-[#4ADE80]'
                      }`}
                    >
                      {passwordStrength <= 2 ? 'Basic' : passwordStrength <= 4 ? 'Strong' : 'Exceptional'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full rounded-full transition-all ${
                          lvl <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-[#EF4444]'
                              : passwordStrength <= 4
                              ? 'bg-[#D4AF37]'
                              : 'bg-[#4ADE80]'
                            : 'bg-[#222222]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#888888]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>
                    I accept the <strong className="text-[#CCCCCC]">EventPulse Protocol</strong> and agree to receive verified event notifications.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA8B2E] text-black font-bold text-xs sm:text-sm shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account & Generating Credentials...' : 'Create Account & Access Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Alternative Google Sign In */}
              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222222]"></div>
                </div>
                <span className="relative bg-[#0F0F0F] px-3 text-[11px] text-[#666666] font-mono">
                  OR CONTINUE WITH
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#2A2A2A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account Fast-Connect</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#777777]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white">Sign In to EventPulse</h3>
                <p className="text-xs text-[#888888] font-light">
                  Enter your verified credentials to access your events, passes, and organizer tools.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#CCCCCC]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#666666] hover:text-[#AAAAAA] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#888888] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#333333] bg-[#181818] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <span>Stay logged in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA8B2E] text-black font-bold text-xs sm:text-sm shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Alternative Google Sign In */}
              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222222]"></div>
                </div>
                <span className="relative bg-[#0F0F0F] px-3 text-[11px] text-[#666666] font-mono">
                  OR CONTINUE WITH
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#2A2A2A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Fast Sign-In</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#777777]">Need an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* FORM 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-[#888888] font-light">
                  We'll send a secure password recovery link to your registered email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-white text-xs placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA8B2E] text-black font-bold text-xs sm:text-sm shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Instructions...' : 'Send Recovery Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
