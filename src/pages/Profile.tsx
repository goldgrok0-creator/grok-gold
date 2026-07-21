import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, User, Camera, Check, Send, Unlock, Globe, LogOut 
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { CONFIG } from '../types';
import { TRANSLATIONS } from '../translations';

const ProfilePage: React.FC = () => {
  const {
    state,
    language,
    currentAccount,
    setCurrentTab,
    triggerModal
  } = useAppState();

  const {
    changePassword,
    toggleAutoReinvest,
    toggleNotifications,
    changeLanguage,
    updateProfileImage
  } = useProfile();

  const { logout } = useAuth();

  // Local Form States
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sharedReferral, setSharedReferral] = useState(false);

  const t = TRANSLATIONS[language];

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        updateProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Link Copied Successfully!' 
        : '✅ Referral Link Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  const handleCopyCode = () => {
    const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
    navigator.clipboard.writeText(refCodeStr);
    setCopiedCode(true);
    triggerModal(
      language === 'id' 
        ? '✅ Referral Code Copied Successfully!' 
        : '✅ Referral Code Copied Successfully!', 
      'success'
    );
    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const handleUpdatePassword = async () => {
    const success = await changePassword(profileOldPassword, profileNewPassword, profileConfirmPassword);
    if (success) {
      setProfileOldPassword('');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">{t.profile}</h2>
      </div>

      {/* Profile Avatar Card */}
      <div className="bg-[#0e061c] border border-gold-primary/15 rounded-3xl p-5 shadow-xl text-center">
        <div className="relative w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-tr from-purple-900/50 to-gold-primary/30 border border-gold-primary/30 flex items-center justify-center overflow-hidden shadow-lg group">
          {state.profileImage ? (
            <img src={state.profileImage} alt="Avatar" className="w-full h-full object-cover animate-scale-up" />
          ) : (
            <User className="w-10 h-10 text-gold-primary" />
          )}
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition duration-250">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
          </label>
        </div>

        <div className="text-lg font-black text-white uppercase font-sans">{currentAccount ? currentAccount.fullName : state.username}</div>
        {state.username.toLowerCase() !== 'admin' && (
          <div className="text-xs text-purple-300 font-mono mt-0.5">ID: {currentAccount ? currentAccount.referralCode : 'GGM-0001'}</div>
        )}
      </div>

      {/* Referral Box Section */}
      {state.username.toLowerCase() !== 'admin' && (
        <div className="bg-gradient-to-br from-[#0f0620] to-[#080312] border border-purple-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-gold-primary uppercase tracking-wider font-sans">
                {language === 'id' ? 'Kode Referral Anda' : 'Your Referral Code'}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-purple-900/30 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-100 flex items-center justify-between">
                <span>{currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-gold-primary hover:text-yellow-300 transition text-xs font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  {copiedCode ? (
                    <span className="text-emerald-400 font-bold font-sans">Copied ✓</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="font-sans">COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#120824] border border-purple-500/15 rounded-2xl p-4 relative overflow-hidden shadow-inner">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block font-sans">
                  {language === 'id' ? 'Tautan Referral Resmi' : 'Official Referral Link'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleCopyLink}
                className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1 ${
                  copiedLink 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-sans' 
                    : 'bg-gradient-to-r from-yellow-400 via-gold-primary to-yellow-600 text-black shadow-md hover:brightness-110 font-sans'
                }`}
              >
                <span className="font-bold text-xs">📋</span>
                <span>{copiedLink ? (language === 'id' ? 'Copied ✓' : 'Copied ✓') : (language === 'id' ? 'Copy' : 'Copy')}</span>
              </button>
            </div>

            <div className="mt-4 pt-1">
              <div className="w-full bg-black/50 border border-purple-950/40 rounded-xl px-3 py-2.5 text-[10px] font-mono text-slate-300 break-all select-all leading-relaxed pr-16 shadow-inner">
                {`${window.location.origin}/register?ref=${currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase())}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const refCodeStr = currentAccount?.referralCode || ('GGM-' + state.username.toUpperCase());
              const shareUrl = `${window.location.origin}/register?ref=${refCodeStr}`;
              const shareText = language === 'id' 
                ? `Bergabunglah dengan sistem penambangan PT GrockGold menggunakan kode ${refCodeStr} dan hasilkan yield harian hingga ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}%! ${shareUrl}`
                : `Join the PT GrockGold mining system with code ${refCodeStr} and earn up to ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily contract yield! ${shareUrl}`;
              
              setSharedReferral(true);
              if (navigator.share) {
                navigator.share({
                  title: 'GrockGold Mining',
                  text: shareText,
                  url: shareUrl,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(shareText);
                triggerModal(language === 'id' ? '✅ Teks berbagi disalin ke clipboard!' : '✅ Share text copied to clipboard!', 'success');
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg hover:brightness-110 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="font-sans">{language === 'id' ? 'BAGIKAN REFERRAL' : 'SHARE REFERRAL'}</span>
          </button>
        </div>
      )}

      {/* Accordion / Tab Options */}
      <div className="space-y-3">
        {/* DATA AKUN SECTION */}
        <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-black text-gold-primary uppercase tracking-wider mb-3.5 flex items-center gap-2 font-sans">
            <User className="w-4 h-4 text-gold-primary" />
            {t.profileDataTitle}
          </div>
          
          <div className="space-y-2.5 text-xs font-semibold text-slate-300">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-500 font-sans">{language === 'id' ? 'Nama Lengkap' : 'Full Name'}</span>
              <span className="text-white font-bold font-sans">{currentAccount ? currentAccount.fullName : 'Kenala Wijaya'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-mono">
              <span className="text-slate-500 font-sans">Username</span>
              <span className="text-white">{currentAccount ? currentAccount.username : 'kenala'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-mono">
              <span className="text-slate-500 font-sans">Email</span>
              <span className="text-white">{currentAccount ? currentAccount.email : 'kenala@grockgold.com'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 font-mono">
              <span className="text-slate-500 font-sans">{language === 'id' ? 'No. Handphone' : 'Phone Number'}</span>
              <span className="text-white">{currentAccount ? currentAccount.phone : '+6281234567890'}</span>
            </div>
            {state.username.toLowerCase() !== 'admin' && (
              <>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500 font-sans">Uplink Sponsor</span>
                  <span className="text-amber-400 font-bold uppercase font-sans">{currentAccount?.invitedBy ? currentAccount.invitedBy : 'SYSTEM'}</span>
                </div>
                <div className="flex justify-between py-1 font-mono">
                  <span className="text-slate-500 font-sans">Referral Code</span>
                  <span className="text-gold-primary font-bold">{currentAccount ? currentAccount.referralCode : 'GGM-0001'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CHANGE PASSWORD SECTION */}
        <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg space-y-3.5">
          <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 font-sans">
            <Unlock className="w-4 h-4 text-gold-primary" />
            {t.changePasswordTitle}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase font-sans">
                {t.oldPassword}
              </label>
              <input
                type="password"
                value={profileOldPassword}
                onChange={(e) => setProfileOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase font-sans">
                {t.newPassword}
              </label>
              <input
                type="password"
                value={profileNewPassword}
                onChange={(e) => setProfileNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 tracking-wider mb-1 uppercase font-sans">
                {t.confirmNewPassword}
              </label>
              <input
                type="password"
                value={profileConfirmPassword}
                onChange={(e) => setProfileConfirmPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-black/40 border border-purple-900/40 focus:border-gold-primary/60 outline-none rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdatePassword}
              className="w-full py-2.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-xl text-[10px] tracking-wider uppercase transition shadow-md hover:brightness-110 active:scale-98 cursor-pointer font-sans"
            >
              {t.updatePassword}
            </button>
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div className="bg-[#0e061c] border border-white/5 rounded-2xl p-4 shadow-lg space-y-3.5">
          <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 font-sans">
            <Globe className="w-4 h-4 text-gold-primary" />
            {t.settingsTitle}
          </div>

          <div className="space-y-3 text-xs font-bold text-white">
            {/* Auto Reinvest Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-xs font-sans">Auto Reinvest (Rp {(CONFIG.PRICE_PER_UNIT / 1000).toLocaleString('id-ID')}k)</span>
                <span className="text-[8px] text-slate-400 font-medium font-sans">Beli kontrak otomatis dari hasil tambang</span>
              </div>
              <button
                type="button"
                onClick={() => toggleAutoReinvest(!currentAccount?.settings?.autoReinvest)}
                className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none cursor-pointer ${
                  currentAccount?.settings?.autoReinvest ? 'bg-gold-primary' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                    currentAccount?.settings?.autoReinvest ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-xs font-sans">{language === 'id' ? 'Notifikasi Real-time' : 'Real-time Notifications'}</span>
                <span className="text-[8px] text-slate-400 font-medium font-sans font-sans">Terima peringatan aktivitas armada</span>
              </div>
              <button
                type="button"
                onClick={() => toggleNotifications(!currentAccount?.settings?.notificationsEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition duration-200 focus:outline-none cursor-pointer ${
                  currentAccount?.settings?.notificationsEnabled ? 'bg-gold-primary' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                    currentAccount?.settings?.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-xs font-sans">{language === 'id' ? 'Bahasa Utama' : 'Primary Language'}</span>
                <span className="text-[8px] text-slate-400 font-medium font-sans">Setel bahasa antarmuka terminal</span>
              </div>
              <button
                type="button"
                onClick={() => changeLanguage(language === 'id' ? 'en' : 'id')}
                className="px-3 py-1 bg-purple-950/40 border border-purple-500/20 text-gold-primary rounded-lg text-[10px] font-extrabold uppercase hover:bg-purple-900/30 transition cursor-pointer font-sans"
              >
                {language === 'id' ? '🇲🇨 INDONESIA' : '🇬🇧 ENGLISH'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={logout}
          className="w-full py-4 bg-rose-950/15 border border-rose-500/25 text-rose-400 font-extrabold rounded-2xl text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 hover:bg-rose-950/35 cursor-pointer font-sans"
        >
          <LogOut className="w-4.5 h-4.5" />
          {t.logout}
        </button>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
