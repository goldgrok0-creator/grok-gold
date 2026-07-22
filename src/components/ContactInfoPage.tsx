import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

interface ContactInfoPageProps {
  language: 'id' | 'en';
  setCurrentTab: (tab: string) => void;
  triggerModal?: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const ContactInfoPage: React.FC<ContactInfoPageProps> = ({
  language,
  setCurrentTab,
  triggerModal,
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
          <MessageSquare className="w-4 h-4 text-yellow-400" />
          {isId ? 'Informasi Kontak & Bantuan' : 'Contact Information & Support'}
        </h2>
      </div>

      <div className="bg-[#0e061c] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 text-slate-300 text-xs">
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-base font-bold text-white mb-1">
            {isId ? 'Pusat Bantuan & Layanan Pelanggan' : 'Customer Support & Contact Desks'}
          </h1>
          <p className="text-[11px] text-slate-400">
            {isId
              ? 'Tim dukungan pelanggan kami siap membantu kendala akun dan informasi portal 24/7.'
              : 'Our official support desks are available 24/7 for account queries and technical guidance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: WhatsApp Support */}
          <div className="bg-[#140a2b] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {isId ? 'Layanan Whatsapp Resmi' : 'Official WhatsApp Line'}
              </h4>
              <p className="text-[11px] text-slate-400 mb-2">
                {isId ? 'Dukungan respon cepat untuk anggota' : 'Fast-response support line for members'}
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold transition"
              >
                +62 812-3456-7890
              </a>
            </div>
          </div>

          {/* Card 2: Email Support */}
          <div className="bg-[#140a2b] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {isId ? 'Email Bantuan Portal' : 'Support Email'}
              </h4>
              <p className="text-[11px] text-slate-400 mb-2">
                {isId ? 'Untuk pertanyaan kendala umum & kemitraan' : 'For inquiries, accounts & verification'}
              </p>
              <a
                href="mailto:support@grockgold.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-[11px] font-bold transition"
              >
                support@grockgold.com
              </a>
            </div>
          </div>

          {/* Card 3: Operational Hours */}
          <div className="bg-[#140a2b] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {isId ? 'Jam Operasional' : 'Operating Hours'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isId ? 'Senin - Minggu: 24 Jam Nonstop' : 'Monday - Sunday: 24/7 Nonstop'}
              </p>
              <p className="text-[10px] text-yellow-400/80 font-semibold mt-1">
                {isId ? 'Sistem Otomatis Aktivasi 24/7' : '24/7 Automated Activation Systems'}
              </p>
            </div>
          </div>

          {/* Card 4: Office Location */}
          <div className="bg-[#140a2b] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {isId ? 'Alamat Kantor Operasional' : 'Operational Office Address'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                GrockGold Mining Ltd Center<br />
                Johannesburg, South Africa / Jakarta, Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#140a2b]/60 border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            {isId ? 'Kirim Pesan Langsung Ke Tim Bantuan' : 'Send Direct Message To Support'}
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (triggerModal) {
                triggerModal(
                  isId
                    ? '✅ Pesan Anda telah terkirim! Tim dukungan akan menghubungi Anda melalui WhatsApp atau Email.'
                    : '✅ Message sent successfully! Our support team will respond to your registered contact details.',
                  'success'
                );
              }
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder={isId ? 'Nama Lengkap / Username' : 'Full Name / Username'}
                className="w-full bg-[#0a0314] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
              <input
                type="text"
                required
                placeholder={isId ? 'Nomor WhatsApp / Email' : 'WhatsApp Number / Email'}
                className="w-full bg-[#0a0314] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder={isId ? 'Tuliskan pesan atau kendala Anda di sini...' : 'Type your inquiry or message here...'}
              className="w-full bg-[#0a0314] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 resize-none"
            ></textarea>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
            >
              {isId ? 'Kirim Pesan' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfoPage;
