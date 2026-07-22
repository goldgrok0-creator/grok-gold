import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  language,
  setCurrentTab,
}) => {
  const isId = language === 'id';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft
          className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition"
          onClick={() => setCurrentTab('home')}
        />
        <h2 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 text-slate-300 text-xs leading-relaxed">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-base font-bold text-white mb-1">
            {isId ? 'Kebijakan Privasi & Perlindungan Data' : 'Privacy & Data Protection Policy'}
          </h1>
          <p className="text-[11px] text-slate-400">
            {isId ? 'Terakhir diperbarui: 21 Juli 2026' : 'Last updated: July 21, 2026'}
          </p>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-yellow-400" />
              1. {isId ? 'Pengumpulan Data Pengguna' : 'Collection of User Data'}
            </h3>
            <p>
              {isId
                ? 'Kami mengumpulkan data akun dasar yang Anda berikan secara langsung saat mendaftar, seperti nama pengguna (username), nomor WhatsApp/telepon, dan informasi transaksi saldo. Kami tidak mengumpulkan atau menyimpan data sensitif pribadi tanpa persetujuan eksplisit dari pengguna.'
                : 'We collect basic account information directly provided upon registration, including username, contact phone/WhatsApp number, and account transaction histories. We do not store sensitive personal information without explicit user consent.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-yellow-400" />
              2. {isId ? 'Penggunaan Informasi' : 'Use of Information'}
            </h3>
            <p>
              {isId
                ? 'Data yang dikumpulkan hanya digunakan untuk verifikasi autentikasi akun, pemrosesan permintaan deposit & penarikan saldo, serta komunikasi pembaruan sistem dan penanganan kendala pengguna secara langsung.'
                : 'Collected data is exclusively used for account authentication, processing deposit and withdrawal requests, sending essential system notifications, and direct customer support.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              3. {isId ? 'Keamanan Data & Enkripsi' : 'Data Security & Encryption'}
            </h3>
            <p>
              {isId
                ? 'Seluruh lalu lintas data dan otentikasi diproses melalui enkripsi standar industri (SSL/TLS dan SHA-256) serta dilindungi oleh arsitektur database Supabase. Kata sandi pengguna tidak disimpan secara mentah (plain text) di server.'
                : 'All web traffic and user authentication requests are processed via industry-standard TLS encryption protocols and secured using Supabase infrastructure. Passwords are hashed and never stored in plain text.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-yellow-400" />
              4. {isId ? 'Hak Pengguna' : 'User Rights'}
            </h3>
            <p>
              {isId
                ? 'Pengguna memiliki hak penuh untuk memperbarui profil, mengubah nomor kontak, atau meminta penghapusan riwayat akun melalui layanan dukungan pelanggan resmi.'
                : 'Users maintain full rights to update their profile details or request account information updates through official customer support channels.'}
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;
