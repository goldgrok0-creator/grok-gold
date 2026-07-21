import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Download } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface AboutPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  triggerModal: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  language,
  setCurrentTab,
  triggerModal,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 text-left"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
        <h2 className="text-sm font-black tracking-widest text-white uppercase">
          {language === 'id' ? 'Tentang Kami' : 'About Us'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-gold-primary/25 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-center mb-1">
          <span className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 bg-clip-text text-transparent font-orbitron">
            GROCKGOLD
          </span>
        </div>

        <div className="text-[11px] text-slate-300 font-semibold leading-relaxed text-center whitespace-pre-line border-b border-white/5 pb-4">
          {language === 'id' ? (
            'GrockGold Mining Ltd adalah perusahaan penambangan dan pengelolaan portofolio komersial berskala internasional yang terafiliasi resmi dengan Randgold Resources West Africa.\n\nKami mengintegrasikan teknologi cloud hashing penambangan canggih untuk memberikan jaminan aksesibilitas portofolio berkinerja tinggi bagi seluruh mitra terdaftar.'
          ) : (
            'GrockGold Mining Ltd is a premium international gold mining operations and asset platform, officially partnered with Randgold Resources West Africa.\n\nWe build advanced high-throughput cloud hashing solutions that enable transparent, stable, and highly rewarding digital gold mining contract investment fleets.'
          )}
        </div>

        <div className="space-y-2 text-xs font-semibold text-slate-300">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">{t.company}</span>
            <span className="text-white text-right">GrockGold Mining Ltd.</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">{t.license}</span>
            <span className="text-white">12345/MINING/2026-REG</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{t.regulated}</span>
            <span className="text-white text-right">Ministry of Energy & Minerals Registry</span>
          </div>
        </div>

        <button
          onClick={() => triggerModal(`📄 Official License & Certifications Of GrockGold Mining.<br><br>Issuer: Ministry of Energy & Minerals Registry<br>Registered Entity: GrockGold Mining Ltd.<br>Verification Hash: #SHA256-GGM998162816B<br>Status: LICENSED & COMPLIANT`, 'success')}
          className="w-full py-3.5 bg-gradient-to-r from-yellow-300 via-gold-primary to-yellow-600 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD LEGAL DOCUMENT
        </button>
      </div>
    </motion.div>
  );
};

export default AboutPage;
