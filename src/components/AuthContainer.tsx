import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '../AppContext';
import { useAuth } from '../hooks/useAuth';
import { TRANSLATIONS } from '../translations';
import { User, Lock, Mail, Globe, Gift, ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { SearchableCountrySelect } from './SearchableCountrySelect';
// @ts-ignore
import goldLogo from '../assets/images/gold_logo_icon_1784365650875.jpg';

export const AuthContainer: React.FC = () => {
  const {
    language,
    setLanguage,
    authScreen,
    setAuthScreen,
    triggerModal,
    unverifiedEmail,
    setUnverifiedEmail,
    resendStatus,
    setResendStatus,
    isResending,
    setIsResending,
    state,
  } = useAppState();

  const {
    login,
    bypassVerification,
    register,
    resendVerification,
    forgotPassword,
    resetPassword,
    isLoading,
  } = useAuth();

  const t = TRANSLATIONS[language];
  const tAuth = TRANSLATIONS['en'];

  // --- REGISTRATION FORM STATES ---
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);

  // --- LOGIN FORM STATES ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // --- FORGOT PASSWORD STATES ---
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginIdentifier, loginPassword, rememberMe);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(
      regFullName,
      regUsername,
      regEmail,
      regPhone,
      regPassword,
      regConfirmPassword,
      regReferralCode,
      regAgreed,
      regCountry
    );
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(forgotEmail);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(resetNewPassword, resetConfirmPassword);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    await resendVerification();
    setIsResending(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col justify-center items-center bg-[#04010b] z-[9999]">
      {/* Elegant Background Ambient Golden Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.05)_0%,transparent_70%)] blur-[120px] pointer-events-none" />

      {/* Tech grid overlay to reinforce modern layout */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* WELCOME SCREEN */}
        {authScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
          >
            <div className="bg-[#0b061c]/80 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col items-center">
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Premium Floating 3D Gold Logo Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative w-20 h-20 mb-4.5 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-1 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.25)] border-2 border-yellow-500/30 mt-2"
              >
                {/* Golden outer pulse ring */}
                <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping opacity-60 pointer-events-none" />
                <img
                  src={goldLogo}
                  alt="Gold Mining Logo"
                  className="w-full h-full object-cover rounded-full select-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white tracking-widest font-orbitron">
                  GROCK<span className="text-yellow-500">GOLD</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase mt-1">
                  A RANDGOLD RESOURCES COMPANY
                </p>
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-3.5" />
                <p className="text-xs font-semibold text-slate-300 max-w-xs mt-3.5 leading-relaxed">
                  {language === 'id'
                    ? 'Masuki Terminal Operasional Hashing Tambang West Africa'
                    : 'Enter the West African Hashing Operations Terminal'}
                </p>
              </div>

              {/* Action buttons with real loading indicator */}
              <div className="w-full space-y-3 z-10">
                <button
                  onClick={() => setAuthScreen('login')}
                  className="w-full py-4.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-2xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10 flex items-center justify-center gap-2"
                >
                  <span>{tAuth.loginTitle.toUpperCase()}</span>
                </button>

                <button
                  onClick={() => setAuthScreen('register')}
                  className="w-full py-4.5 bg-[#0e0722]/90 hover:bg-[#150a32] text-yellow-400 font-extrabold rounded-2xl text-[11px] tracking-widest uppercase transition-all duration-300 border border-yellow-500/20 hover:border-yellow-500/40 cursor-pointer active:scale-98"
                >
                  {tAuth.createAccount.toUpperCase()}
                </button>
              </div>

              {/* No language switcher - Indonesian only */}
            </div>
          </motion.div>
        )}

        {/* REGISTER SCREEN */}
        {authScreen === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-center h-screen"
          >
            <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col max-h-[92vh]">
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Header Title with Back Button */}
              <div className="flex justify-between items-center mb-4 z-10">
                <button
                  onClick={() => setAuthScreen('welcome')}
                  className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-yellow-500" />
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
                <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded font-black font-mono">
                  SECURE SIGN UP
                </span>
              </div>

              {/* Form fields in scrolling body */}
              <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar mb-4 space-y-4">
                <div className="text-center mb-5 mt-1">
                  <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron leading-snug">
                    {tAuth.createAccount}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1 leading-normal">
                    Register a new secure cloud mining terminal node account
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.fullName}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value.toUpperCase())}
                          placeholder="ENTER FULL LEGAL NAME"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.username}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="e.g. janesmith"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.emailAddress}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value.trim())}
                          placeholder="e.g. jane@domain.com"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.phoneNumber}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Globe className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                          placeholder="e.g. +6281234567890"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <SearchableCountrySelect
                      value={regCountry}
                      onChange={setRegCountry}
                      label={tAuth.country || (language === 'id' ? 'NEGARA' : 'COUNTRY')}
                    />

                    {/* Password */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.password}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.confirmPassword}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                        {tAuth.referralCodeOptional}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Gift className="w-4 h-4 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          value={regReferralCode}
                          onChange={(e) => setRegReferralCode(e.target.value)}
                          placeholder="Sponsor code or username"
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
                        />
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-2 pt-1 md:col-span-2">
                      <input
                        id="agree-tc"
                        type="checkbox"
                        checked={regAgreed}
                        onChange={(e) => setRegAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-800 text-yellow-500 focus:ring-yellow-500/30 bg-black/40 cursor-pointer"
                      />
                      <label htmlFor="agree-tc" className="text-[10px] text-slate-400 leading-snug cursor-pointer select-none">
                        I agree to the <span className="text-yellow-400 font-extrabold hover:underline cursor-pointer" onClick={(e) => { e.preventDefault(); triggerModal("📜 TERMS & CONDITIONS\n\n1. All investments in the GROCKGOLD portal are educational representations of GrockGold Mining.\n2. Users are fully responsible for the security of their own account credentials.\n3. Any attempt at data manipulation will be automatically flagged by security protocols.", 'info'); }}>Terms & Conditions</span> of GrockGold Mining.
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              {/* Action buttons at bottom */}
              <div className="z-10 space-y-3.5 pt-4.5 border-t border-yellow-500/10">
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.2)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10 flex justify-center items-center gap-2"
                >
                  <span>{isLoading ? 'CREATING...' : tAuth.createAccount}</span>
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setAuthScreen('login')}
                    className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                  >
                    {tAuth.hasAccount}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LOGIN SCREEN */}
        {authScreen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
          >
            <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col">
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Back Button */}
              <button
                onClick={() => setAuthScreen('welcome')}
                className="mb-4 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-yellow-500" />
                {language === 'id' ? 'Kembali' : 'Back'}
              </button>

              {/* Pulsing logo */}
              <div className="flex justify-center mb-3.5">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                >
                  <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                  <img
                    src={goldLogo}
                    alt="Gold Mining Logo"
                    className="w-full h-full object-cover rounded-full select-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              <div className="text-center mb-5 z-10">
                <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                  {tAuth.loginTitle}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                  {tAuth.loginSubtitle}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 z-10">
                {/* Username or Email */}
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                    {tAuth.usernameOrEmail}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter Username or Email"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">
                      {tAuth.password}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthScreen('forgot')}
                      className="text-[9px] font-extrabold text-yellow-400 hover:underline cursor-pointer"
                    >
                      {tAuth.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 py-0.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 text-yellow-500 focus:ring-yellow-500/30 bg-black/40 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="text-[10px] text-slate-400 leading-none cursor-pointer select-none font-bold">
                    {tAuth.rememberMe}
                  </label>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10 flex justify-center items-center gap-2"
                >
                  <span>{isLoading ? 'SIGNING IN...' : tAuth.accessDashboard.toUpperCase()}</span>
                </button>
              </form>

              {unverifiedEmail && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-left space-y-2 mt-4 z-10">
                  <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                    {language === 'id'
                      ? `⚠️ Email Anda (${unverifiedEmail}) belum diverifikasi. Silakan periksa email Anda (termasuk folder spam) untuk tautan konfirmasi.`
                      : `⚠️ Your email (${unverifiedEmail}) is not verified. Please check your inbox (and spam folder) for the confirmation link.`}
                  </p>
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResendVerification}
                    className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 disabled:hover:bg-red-500/20 text-white font-bold rounded-lg text-[9px] tracking-wider uppercase transition disabled:opacity-50 cursor-pointer text-center"
                  >
                    {isResending
                      ? (language === 'id' ? 'Mengirim...' : 'Sending...')
                      : (language === 'id' ? 'Kirim Ulang Email Verifikasi' : 'Resend Verification Email')}
                  </button>

                  <button
                    type="button"
                    onClick={bypassVerification}
                    className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black font-extrabold rounded-lg text-[9px] tracking-wider uppercase transition cursor-pointer text-center mt-1 shadow-md shadow-emerald-500/10"
                  >
                    {language === 'id' ? '🔓 Masuk Tanpa Verifikasi (Bypass)' : '🔓 Log In Without Verification (Bypass)'}
                  </button>

                  {resendStatus === 'success' && (
                    <p className="text-[9px] text-green-400 text-center font-bold mt-1">
                      {language === 'id' ? '✓ Email verifikasi berhasil dikirim!' : '✓ Verification email sent!'}
                    </p>
                  )}
                </div>
              )}

              <div className="text-center mt-5 z-10">
                <button
                  onClick={() => setAuthScreen('register')}
                  className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                >
                  {tAuth.noAccount}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* FORGOT PASSWORD SCREEN */}
        {authScreen === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
          >
            <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full">
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Back Button */}
              <button
                onClick={() => setAuthScreen('login')}
                className="mb-5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-yellow-500" />
                {language === 'id' ? 'Kembali ke Login' : 'Back to Login'}
              </button>

              {/* Pulsing logo */}
              <div className="flex justify-center mb-3.5">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                >
                  <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                  <img
                    src={goldLogo}
                    alt="Gold Mining Logo"
                    className="w-full h-full object-cover rounded-full select-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              <div className="text-center mb-5 z-10">
                <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                  FORGOT PASSWORD
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                  Recover your secure terminal credentials
                </p>
              </div>

              <form onSubmit={handleSendResetLink} className="space-y-4 z-10">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                    {tAuth.emailAddress}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value.trim())}
                      placeholder="Enter registered Email address"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 disabled:opacity-50 border border-yellow-300/10 flex justify-center items-center gap-2"
                >
                  <span>{isLoading ? 'SENDING...' : 'SEND RESET LINK'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* RESET PASSWORD SCREEN */}
        {authScreen === 'reset-password' && (
          <motion.div
            key="reset-password"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm mx-auto px-4 py-4 flex flex-col justify-center"
          >
            <div className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full">
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Pulsing logo */}
              <div className="flex justify-center mb-3.5">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative w-14 h-14 bg-gradient-to-br from-yellow-300/10 to-yellow-500/20 p-0.5 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-yellow-500/30"
                >
                  <div className="absolute inset-0 rounded-full bg-yellow-500/5 animate-pulse" />
                  <img
                    src={goldLogo}
                    alt="Gold Mining Logo"
                    className="w-full h-full object-cover rounded-full select-none"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              <div className="text-center mb-5 z-10">
                <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                  RESET PASSWORD
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1">
                  Securely establish your new security credentials
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 z-10">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                    {tAuth.newPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1.5 uppercase">
                    {tAuth.confirmNewPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition focus:ring-1 focus:ring-yellow-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 disabled:opacity-50 border border-emerald-400/10 flex justify-center items-center gap-2"
                >
                  <span>{isLoading ? 'SAVING...' : 'SAVE NEW PASSWORD'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
