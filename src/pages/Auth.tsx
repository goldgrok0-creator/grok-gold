import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  UserCheck,
  Mail,
  Globe,
  Lock,
  Gift,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useAuth } from '../hooks/useAuth';
import WelcomeTicker from '../components/WelcomeTicker';
import { TRANSLATIONS } from '../translations';
import { SearchableCountrySelect } from '../components/SearchableCountrySelect';

// @ts-ignore
import goldLogo from '../assets/images/gold_logo_icon_1784365650875.jpg';

export const AuthPage: React.FC = () => {
  const {
    language,
    authScreen,
    setAuthScreen,
    unverifiedEmail,
    resendStatus,
    isResending,
    state,
    triggerModal
  } = useAppState();

  const {
    login,
    bypassVerification,
    register,
    resendVerification,
    forgotPassword,
    resetPassword,
    isLoading
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

  // --- FORGOT & RESET PASSWORD STATES ---
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginIdentifier, loginPassword, rememberMe);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(
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

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(forgotEmail);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword(resetNewPassword, resetConfirmPassword);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Elegant Background Ambient Golden Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.07)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.05)_0%,transparent_70%)] blur-[120px] pointer-events-none" />

      {/* Tech grid overlay to reinforce modern layout */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            {language === 'id' ? 'Memproses Akun...' : 'Processing Secure Session...'}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* WELCOME SCREEN */}
        {authScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm mx-auto flex flex-col justify-center relative z-10"
          >
            <div className="bg-[#0b061c]/80 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col items-center w-full">
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

              {/* Title & Branding info with luxury gradient text */}
              <div className="text-center space-y-0.5 mb-5.5">
                <h1 className="text-xl font-extrabold tracking-[0.25em] bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent font-orbitron uppercase text-center drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                  GROCKGOLD
                </h1>
                <p className="text-[9px] text-yellow-500/70 font-mono tracking-[0.3em] uppercase text-center mt-0.5">
                  PREMIUM PORTAL
                </p>
              </div>

              {/* Welcome Ticker (Restored with stylish layout) */}
              <div className="w-full mb-6">
                <WelcomeTicker memberCount={state.holders.length} isIndonesian={language === 'id'} />
              </div>

              {/* Interactive Action Buttons */}
              <div className="space-y-3 w-full">
                <button
                  onClick={() => setAuthScreen('login')}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 hover:shadow-[0_4px_25px_rgba(251,191,36,0.4)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/20"
                >
                  {tAuth.welcomeMasuk.toUpperCase()}
                </button>
                
                <button
                  onClick={() => setAuthScreen('register')}
                  className="w-full py-3.5 bg-slate-900/80 text-white font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 border border-slate-800/80 hover:border-yellow-500/30 hover:bg-slate-800/80 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {tAuth.welcomeDaftar.toUpperCase()}
                </button>

                {/* Info footer line with shield alert icon */}
                <div className="flex flex-col items-center justify-center gap-1.5 pt-4 border-t border-white/5 mt-5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-xs" role="img" aria-label="shield alert">🛡️</span>
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 font-mono">SECURE GATEWAY</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 text-center font-bold tracking-wide leading-relaxed max-w-full px-4 break-normal">
                    {tAuth.welcomeNotice}
                  </p>
                </div>
              </div>
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
            className="w-full max-w-md md:max-w-2xl mx-auto flex flex-col justify-center relative z-10"
          >
            <form
              onSubmit={handleRegisterSubmit}
              className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col max-h-[92vh] w-full"
            >
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setAuthScreen('welcome')}
                className="mb-4.5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 hover:text-yellow-400 transition-colors uppercase tracking-wider self-start z-10 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-yellow-500" />
                {language === 'id' ? 'Kembali' : 'Back'}
              </button>

              <div className="text-center mb-5 z-10">
                <h2 className="text-lg font-black text-white tracking-wider uppercase font-orbitron">
                  {tAuth.regTitle}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-1 mb-2">
                  {tAuth.regSubtitle}
                </p>
              </div>

              {/* Scrollable Form Fields area */}
              <div className="overflow-y-auto pr-1.5 flex-1 max-h-[50vh] z-10 custom-scrollbar mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
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
                        placeholder="e.g. KENALA WIJAYA"
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
                        <UserCheck className="w-4 h-4 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="e.g. kenala123"
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-yellow-500/60 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-white transition font-mono focus:ring-1 focus:ring-yellow-500/20"
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
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. kenala@grockgold.com"
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

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start gap-2 pt-1 md:col-span-2">
                    <input
                      id="agree-tc"
                      type="checkbox"
                      checked={regAgreed}
                      onChange={(e) => setRegAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-800 text-yellow-500 focus:ring-yellow-500/30 bg-black/40 cursor-pointer"
                    />
                    <label htmlFor="agree-tc" className="text-[10px] text-slate-400 leading-snug cursor-pointer select-none">
                      I agree to the <span className="text-yellow-400 font-extrabold hover:underline cursor-pointer" onClick={(e) => { e.preventDefault(); triggerModal("📜 TERMS & CONDITIONS\n\n1. All investments in the GROCKGOLD portal are educational representations of PT GrockGold Mining.\n2. Users are fully responsible for the security of their own account credentials.\n3. Any attempt at data manipulation will be automatically flagged by security protocols.", 'info'); }}>Terms & Conditions</span> of PT GrockGold Mining.
                    </label>
                  </div>
                </div>
              </div>

              {/* Action buttons at the bottom of the card */}
              <AnimatePresence>
                {Boolean(regCountry.trim()) && (
                  <motion.div
                    key="register-actions"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="z-10 space-y-3.5 mt-auto pt-4.5 border-t border-yellow-500/10 w-full"
                  >
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.2)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10"
                    >
                      {tAuth.createAccount}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setAuthScreen('login')}
                        className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                      >
                        {tAuth.hasAccount}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
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
            className="w-full max-w-sm mx-auto flex flex-col justify-center relative z-10"
          >
            <form
              onSubmit={handleLoginSubmit}
              className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full"
            >
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Back Button */}
              <button
                type="button"
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

              <div className="space-y-4 z-10">
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

                {/* Remember Me Checkbox */}
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
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer border border-yellow-300/10"
                >
                  {tAuth.accessDashboard.toUpperCase()}
                </button>

                {unverifiedEmail && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-left space-y-2 mt-2">
                    <p className="text-[10px] text-red-400 font-medium leading-relaxed">
                      {language === 'id'
                        ? `⚠️ Email Anda (${unverifiedEmail}) belum diverifikasi. Silakan periksa email Anda (termasuk folder spam) untuk tautan konfirmasi.`
                        : `⚠️ Your email (${unverifiedEmail}) is not verified. Please check your inbox (and spam folder) for the confirmation link.`}
                    </p>
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={resendVerification}
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
                      <p className="text-[9px] text-green-400 text-center font-bold">
                        {language === 'id' ? '✓ Email verifikasi berhasil dikirim!' : '✓ Verification email sent!'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center mt-5 z-10">
                <button
                  type="button"
                  onClick={() => setAuthScreen('register')}
                  className="text-[10px] font-extrabold text-yellow-400 hover:underline transition cursor-pointer"
                >
                  {tAuth.noAccount}
                </button>
              </div>
            </form>
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
            className="w-full max-w-sm mx-auto flex flex-col justify-center relative z-10"
          >
            <form
              onSubmit={handleForgotSubmit}
              className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full"
            >
              {/* Top gold line gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

              {/* Back Button */}
              <button
                type="button"
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

              <div className="space-y-4 z-10">
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
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 border border-yellow-300/10"
                >
                  SEND RESET LINK
                </button>
              </div>
            </form>
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
            className="w-full max-w-sm mx-auto flex flex-col justify-center relative z-10"
          >
            <form
              onSubmit={handleResetSubmit}
              className="bg-[#0b061c]/85 border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden backdrop-blur-2xl flex flex-col w-full"
            >
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

              <div className="space-y-4 z-10">
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
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl text-[11px] tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:brightness-110 active:scale-98 cursor-pointer mt-1 border border-emerald-400/10"
                >
                  SAVE NEW PASSWORD
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
