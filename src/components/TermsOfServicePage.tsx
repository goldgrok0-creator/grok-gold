import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TermsOfServicePageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({
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
          <FileText className="w-4 h-4 text-yellow-400" />
          {isId ? 'Syarat & Ketentuan Layanan' : 'Terms of Service'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 text-slate-300 text-xs leading-relaxed">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-base font-bold text-white mb-1">
            {isId ? 'Ketentuan Penggunaan Portal' : 'Portal Terms of Service'}
          </h1>
          <p className="text-[11px] text-slate-400">
            {isId ? 'Terakhir diperbarui: 21 Juli 2026' : 'Last updated: July 21, 2026'}
          </p>
        </div>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-yellow-400" />
              1. {isId ? 'Ketentuan Pendaftaran Akun' : 'Account Registration Terms'}
            </h3>
            <p>
              {isId
                ? 'Setiap pengguna bertanggung jawab penuh untuk menjaga kerahasiaan nama pengguna dan kredensial masuk akun. Pendaftaran akun hanya diperbolehkan bagi individu berusia di atas 18 tahun.'
                : 'Users are fully responsible for maintaining the confidentiality of their login credentials. Account creation is strictly permitted for individuals aged 18 years and older.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              2. {isId ? 'Ketentuan Unit Kontrak' : 'Mining Contract Conditions'}
            </h3>
            <p>
              {isId
                ? 'Partisipasi dalam unit penambangan digital diproses sesuai aturan rasio reward harian yang tercantum pada masing-masing paket kontrak. Klaim hasil dilakukan secara mandiri oleh pengguna sesuai periode klaim yang berlaku.'
                : 'Participation in digital mining contracts operates according to the specified daily reward percentage. Daily claims are initialized directly by users following applicable cooldown schedules.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              3. {isId ? 'Ketentuan Deposit & Penarikan' : 'Deposit & Withdrawal Rules'}
            </h3>
            <p>
              {isId
                ? 'Seluruh proses deposit harus dikirimkan ke rekening atau alamat tujuan resmi yang tertera di portal. Penarikan saldo diproses secara transparan setelah melewati verifikasi otomatis oleh sistem.'
                : 'All deposits must be routed through official accounts displayed in the portal. Withdrawal requests undergo automated validation prior to instant disbursement.'}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-yellow-400" />
              4. {isId ? 'Pelanggaran & Pembekuan' : 'Violations & Account Suspension'}
            </h3>
            <p>
              {isId
                ? 'Segala bentuk kecurangan, pemalsuan bukti transaksi, atau manipulasi sistem akan menyebabkan pembekuan akun secara sementara atau permanen guna melindungi integritas ekosistem.'
                : 'Any attempts at fraudulent activity, fake payment proofs, or system manipulation will trigger immediate account review or suspension.'}
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;
