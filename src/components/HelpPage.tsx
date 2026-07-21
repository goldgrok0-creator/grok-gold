import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { CONFIG } from '../types';

interface HelpPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  triggerModal: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({
  language,
  setCurrentTab,
  triggerModal,
}) => {
  const faqs = [
    {
      q: language === 'id' ? 'Bagaimana cara membeli Kontrak Emas?' : 'How do I purchase Gold Contracts?',
      a: language === 'id' ? 'Anda dapat menyetor dana Anda di menu Wallet -> Deposit. Setelah itu, buka menu Kontrak, tentukan jumlah unit yang diinginkan, lalu ketuk tombol "Beli Sekarang". Kontrak langsung aktif berproduksi.' : 'First top up your balance via Wallet -> Deposit. Once your balance is loaded, navigate to the Contracts page, input your desired unit quantity, and click "Buy Now".'
    },
    {
      q: language === 'id' ? 'Berapa persentase hasil harian?' : 'What is the daily mining yield rate?',
      a: language === 'id' ? `Setiap kontrak aktif memberikan tingkat hasil harian sebesar ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% langsung ke saldo reward Anda sampai mencapai batas capping penambangan 250%.` : `Each active contract guarantees a premium ${(CONFIG.DAILY_REWARD_PERCENT * 100).toFixed(0)}% daily yield credited straight to your Reward Balance, running continuously until reaching 250% capping.`
    },
    {
      q: language === 'id' ? 'Apa yang dimaksud batas Capping 250%?' : 'What is the 250% capping limit?',
      a: language === 'id' ? 'Capping adalah batas maksimal pendapatan kontrak Anda (2.5 kali modal beli). Jika Anda membeli kontrak senilai Rp 1.000.000, penambangan otomatis berhenti saat total hasil mencapai Rp 2.500.000.' : 'Capping is the maximum lifetime earning capacity of your contract (2.5x principal). For instance, a Rp 1,000,000 contract produces up to Rp 2,500,000 in total mining yields.'
    },
    {
      q: language === 'id' ? 'Bagaimana sistem komisi MLM / Network?' : 'How does the network MLM system work?',
      a: language === 'id' ? 'Sistem kami menggunakan struktur bertingkat: Komisi Sponsor Utama (10%), Rebate Level 1 (5%), dan Level 2 (2%). Komisi langsung masuk ke saldo tunai dan meningkatkan progress capping Anda.' : 'We operate a multi-level referral hierarchy: Direct Sponsor incentives (10%), Generation Level 1 rebates (5%), and Level 2 rebates (2%). Commissions directly load to your balance.'
    }
  ];

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
          {language === 'id' ? 'Pusat Bantuan' : 'Help Center'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="text-xs font-black text-gold-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
          <HelpCircle className="w-4 h-4 text-gold-primary" />
          {language === 'id' ? 'Pertanyaan Umum (FAQ)' : 'Frequently Asked Questions'}
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-2xl text-left space-y-1.5">
              <span className="text-xs font-black text-gold-primary block">Q: {faq.q}</span>
              <span className="text-[10px] text-slate-300 font-medium block leading-relaxed">A: {faq.a}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={() => triggerModal('💬 Layanan Pelanggan GROCKGOLD Telegram Support:<br><b>@GrockGold_Support_Bot</b><br><br>Email: support@grockgold.com<br>Waktu Respons: 24/7 Live.', 'info')}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gold-primary font-bold rounded-2xl text-xs uppercase transition flex items-center justify-center gap-2 cursor-pointer"
          >
            HUBUNGI CUSTOMER SERVICE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpPage;
