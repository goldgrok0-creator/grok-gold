import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Globe,
  Coins,
  Star,
  Users,
  Cpu,
  Wallet,
  FileText,
  Award,
  ShieldCheck,
  Eye,
  HelpCircle,
  Gem,
  ArrowUpRight,
  Lock,
  ChevronRight,
  Calendar,
  Briefcase,
  Activity,
  TrendingUp,
  Sparkles,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';

interface CompanyLandingPageProps {
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function CompanyLandingPage({
  language,
  setLanguage,
  onLoginClick,
  onRegisterClick
}: CompanyLandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Gold price simulator
  const [goldPrice, setGoldPrice] = useState(1458200);
  const [priceChange, setPriceChange] = useState(2400);
  const [priceChangePercent, setPriceChangePercent] = useState(0.16);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Scroll detection for Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate Gold Price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.45) * 800; // slightly upward bias
      setGoldPrice(prev => Math.round(prev + change));
      const percentage = (change / goldPrice) * 100;
      setPriceChange(change);
      setPriceChangePercent(percentage);
    }, 4000);
    return () => clearInterval(interval);
  }, [goldPrice]);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 5000);
  };

  const t = {
    id: {
      slogan: "ROOTED IN AFRICA. BUILT FOR THE WORLD.",
      subSlogan: "MENJADI EKOSISTEM PERTAMBANGAN MODERN YANG LAHIR DARI AFRIKA DAN BERKEMBANG MENJADI JARINGAN GLOBAL.",
      heroDesc: "GrokGold Mining merupakan anak perusahaan dari RandGold Resources yang berfokus pada pengembangan layanan alat berat, teknologi pertambangan harian otomatis, serta ekosistem pertambangan modern terintegrasi.",
      login: "MASUK PORTAL",
      register: "DAFTAR SEKARANG",
      about: "Tentang Kami",
      aboutTitle: "AFRICAN HERITAGE, GLOBAL STRENGTH",
      aboutText1: "Afrika merupakan rumah bagi beberapa wilayah penghasil emas terbesar di dunia dan memiliki sejarah panjang dalam industri pertambangan global. Berangkat dari semangat tersebut, GrokGold mengadopsi nilai kerja keras, ketangguhan, inovasi, dan pengembangan berkelanjutan sebagai fondasi utama perusahaan.",
      aboutText2: "Terinspirasi dari kekayaan sumber daya alam Afrika yang telah menjadi salah satu pusat pertambangan emas terbesar di dunia, GrokGold hadir dengan visi menghubungkan pengalaman industri pertambangan, inovasi teknologi, dan pengembangan komunitas dalam satu ekosistem yang terintegrasi.",
      vision: "VISI",
      visionText: "Menjadi ekosistem pertambangan modern yang lahir dari Afrika dan berkembang menjadi jaringan global dalam bidang alat berat, teknologi pertambangan, dan pengembangan sumber daya alam secara berkelanjutan.",
      mission: "MISI",
      missions: [
        "Mengembangkan layanan armada alat berat yang efisien dan modern.",
        "Mendukung inovasi digital dalam otomasi industri pertambangan global.",
        "Membangun jaringan komunitas penambang dan kemitraan strategis global.",
        "Mengintegrasikan teknologi digital canggih dalam operasional harian pertambangan.",
        "Menciptakan nilai jangka panjang melalui pengembangan sumber daya manusia dan inovasi berkelanjutan."
      ],
      coreValues: "Core Values Perusahaan",
      values: [
        { title: "STRENGTH", desc: "Ketangguhan dalam menghadapi tantangan industri." },
        { title: "INTEGRITY", desc: "Transparansi, keamanan, dan profesionalisme mutlak." },
        { title: "INNOVATION", desc: "Mendorong kemajuan industri melalui teknologi modern." },
        { title: "EXCELLENCE", desc: "Standar kualitas operasional kelas dunia di setiap sektor." },
        { title: "SUSTAINABILITY", desc: "Pertumbuhan yang bertanggung jawab bagi lingkungan dan masyarakat." }
      ],
      ecosystem: "Ekosistem Terintegrasi",
      ecosystemTitle: "EKOSISTEM GROK GOLD MINING",
      ecoItems: [
        { title: "Heavy Equipment", desc: "Manajemen armada berat berteknologi tinggi untuk eksploitasi emas berstandar internasional.", icon: Cpu },
        { title: "Mining Operations", desc: "Eksplorasi geografis mendalam dan pengawasan operasional harian yang transparan.", icon: Briefcase },
        { title: "Mining Technology", desc: "Sistem monitoring pintar berbasis cloud dan sistem pelaporan digital real-time.", icon: Activity },
        { title: "Global Community", desc: "Kemitraan strategis global dan kolaborasi penambang di lebih dari 40 negara.", icon: Users },
        { title: "Asset Marketplace", desc: "Kontrak kerja sama pertambangan dengan yield harian 2.0% yang menguntungkan.", icon: Coins },
        { title: "Premium Investment", desc: "Akses eksklusif portofolio pertambangan emas fisik di Afrika Selatan.", icon: Gem }
      ],
      advantages: "Keunggulan Kami",
      advTitle: "MENGAPA MEMILIH GROK GOLD?",
      advItems: [
        { title: "Keamanan Terjamin", desc: "Sistem enkripsi tingkat militer dan verifikasi multi-faktor untuk melindungi aset serta data Anda.", icon: ShieldCheck },
        { title: "Transparansi Mutlak", desc: "Semua data pertambangan, transaksi deposit & penarikan dicatat secara transparan dan dapat divalidasi.", icon: Eye },
        { title: "Inovasi Otomatis", desc: "Sistem distribusi hasil tambang otomatis (mining yield) langsung ke saldo Anda setiap hari.", icon: Sparkles },
        { title: "Jaringan Global", desc: "Didukung penuh oleh Randgold Resources Company dengan infrastruktur legal berlisensi global.", icon: Globe }
      ],
      goldPriceTitle: "HARGA EMAS LIVE (IDR)",
      goldPriceSub: "Data diperbarui secara real-time berdasarkan bursa komoditas global.",
      statsTitle: "STATISTIK PORTAL PERUSAHAAN",
      stats: [
        { label: "Anggota Terdaftar", value: "Initializing..." },
        { label: "Status Operasional", value: "Awaiting Genesis" },
        { label: "Antrean Validasi", value: "Pending Activation" },
        { label: "Status Koneksi", value: "Protected Access" }
      ],
      newsTitle: "EVENT & PENGUMUMAN TERBARU",
      newsSub: "Ikuti perkembangan terbaru, pencapaian, dan berita industri pertambangan GrokGold.",
      newsItems: [
        { cat: "EVENT", date: "20 Juli 2026", title: "Ekspansi Tambang Baru di Johannesburg Menambah Kapasitas Yield Harian", desc: "GrokGold Mining berhasil membuka lahan eksplorasi baru fase 4A dengan perkiraan deposit mencapai 120.000 Oz emas murni." },
        { cat: "ANNOUNCEMENT", date: "15 Juli 2026", title: "Peluncuran Fitur Lucky Spin dan Bonus Referral Spesifik Anggota", desc: "Manajemen GrokGold resmi merilis program bonus loyalitas instan berupa spin roda keberuntungan bagi pemegang kontrak aktif." },
        { cat: "PARTNERSHIP", date: "08 Juli 2026", title: "Kolaborasi Teknologi Smart Mining Bersama Johannesburg Tech Group", desc: "Integrasi sensor IoT baru meningkatkan efisiensi operasional excavator sebesar 18.4% dan meningkatkan transparansi data klaim." }
      ],
      faqTitle: "PERTANYAAN UMUM (FAQ)",
      faqs: [
        { q: "Apa itu GrokGold Mining?", a: "GrokGold Mining adalah perusahaan pertambangan digital modern yang dikelola di bawah bendera Randgold Resources Company. Kami mengintegrasikan eksploitasi alat berat riil di Afrika Selatan dengan portal kolaborasi digital global." },
        { q: "Bagaimana cara mendapatkan yield harian dari pertambangan?", a: "Pengguna dapat mengaktifkan kontrak kerja sama penyewaan alat berat / operasional tambang. Setelah kontrak aktif, Anda akan menerima yield harian otomatis hingga 2.0% yang dapat diklaim setiap hari melalui menu Daily Claim." },
        { q: "Apakah dana deposit dan penarikan aman?", a: "Sangat aman. Kami menggunakan enkripsi SSL tingkat tinggi, server cadangan terdesentralisasi, serta kemitraan dengan bank lokal terkemuka di Indonesia seperti BCA untuk memastikan seluruh transaksi diproses secara instan dan aman." },
        { q: "Berapa batas minimum deposit dan penarikan?", a: "Batas minimum untuk deposit harian adalah Rp 100.000, dan batas minimum untuk penarikan (withdrawal) saldo utama juga Rp 100.000 dengan proses instan 24/7." }
      ],
      contactTitle: "HUBUNGI TIM KAMI",
      contactSub: "Punya pertanyaan seputar kemitraan atau kendala portal? Tim dukungan kami siap melayani Anda 24/7.",
      contactForm: {
        name: "Nama Lengkap",
        email: "Alamat Email",
        msg: "Pesan Anda",
        send: "KIRIM PESAN",
        success: "Pesan Anda berhasil dikirim! Tim representatif kami di Johannesburg akan segera menghubungi Anda."
      }
    },
    en: {
      slogan: "ROOTED IN AFRICA. BUILT FOR THE WORLD.",
      subSlogan: "A MODERN MINING ECOSYSTEM BORN IN AFRICA AND EXPANDING INTO A GLOBAL NETWORK.",
      heroDesc: "GrokGold Mining is a subsidiary of RandGold Resources focused on heavy equipment management, automated daily mining yields, and integrated modern mining ecosystems.",
      login: "ENTER PORTAL",
      register: "REGISTER NOW",
      about: "About Us",
      aboutTitle: "AFRICAN HERITAGE, GLOBAL STRENGTH",
      aboutText1: "Africa is home to some of the world's largest gold-producing regions and has a rich history in the global mining industry. Rooted in this legacy, GrokGold adopts hard work, resilience, innovation, and sustainable development as the company's core foundations.",
      aboutText2: "Inspired by Africa's abundant natural wealth, which has long been a global epicenter of gold mining, GrokGold connects industrial mining experience, technological innovation, and community growth in one single integrated ecosystem.",
      vision: "VISION",
      visionText: "To be a modern mining ecosystem born in Africa that grows into a global network in heavy equipment, mining technology, and sustainable natural resource development.",
      mission: "MISSION",
      missions: [
        "Develop an efficient and highly modern fleet of heavy equipment machinery.",
        "Support digital innovation in automation within the global mining industry.",
        "Build a global network of miners and key strategic partnerships.",
        "Integrate cutting-edge digital technologies in daily mining operations.",
        "Create long-term value through human resources empowerment and continuous innovation."
      ],
      coreValues: "Company Core Values",
      values: [
        { title: "STRENGTH", desc: "Resilience in overcoming complex industrial challenges." },
        { title: "INTEGRITY", desc: "Absolute transparency, security, and utmost professionalism." },
        { title: "INNOVATION", desc: "Driving industrial progress through state-of-the-art technologies." },
        { title: "EXCELLENCE", desc: "World-class operational standards in every single sector." },
        { title: "SUSTAINABILITY", desc: "Responsible growth with community and environment in mind." }
      ],
      ecosystem: "Integrated Ecosystem",
      ecosystemTitle: "GROK GOLD MINING ECOSYSTEM",
      ecoItems: [
        { title: "Heavy Equipment", desc: "High-tech heavy machinery fleet management for international gold exploitation.", icon: Cpu },
        { title: "Mining Operations", desc: "In-depth geographic exploration and completely transparent daily operational tracking.", icon: Briefcase },
        { title: "Mining Technology", desc: "Cloud-based smart monitoring system and high-fidelity real-time digital reporting.", icon: Activity },
        { title: "Global Community", desc: "Global strategic partnerships and collaborative mining networks in over 40 countries.", icon: Users },
        { title: "Asset Marketplace", desc: "Mining collaboration contracts yielding highly profitable 2.0% daily rewards.", icon: Coins },
        { title: "Premium Investment", desc: "Exclusive access to physical gold mining portfolios located in South Africa.", icon: Gem }
      ],
      advantages: "Our Advantages",
      advTitle: "WHY CHOOSE GROK GOLD?",
      advItems: [
        { title: "Military-Grade Security", desc: "High-level encryption protocols and multi-factor verification to safeguard your assets and data.", icon: ShieldCheck },
        { title: "Absolute Transparency", desc: "All mining logs, deposit entries, and withdrawal records are kept fully transparent and verifiable.", icon: Eye },
        { title: "Automated Innovation", desc: "Automated daily mining yield distribution delivered directly to your portal balance.", icon: Sparkles },
        { title: "Global Footprint", desc: "Fully backed by Randgold Resources Company with heavily licensed, global legal infrastructures.", icon: Globe }
      ],
      goldPriceTitle: "LIVE GOLD PRICE (IDR)",
      goldPriceSub: "Live commodity price feed updated in real-time based on international markets.",
      statsTitle: "COMPANY PORTAL STATISTICS",
      stats: [
        { label: "Registered Members", value: "Initializing..." },
        { label: "Operational Status", value: "Awaiting Genesis" },
        { label: "Validation Queue", value: "Pending Activation" },
        { label: "Connection Status", value: "Protected Access" }
      ],
      newsTitle: "LATEST EVENTS & ANNOUNCEMENTS",
      newsSub: "Stay updated with recent breakthroughs, milestones, and GrokGold industrial news.",
      newsItems: [
        { cat: "EVENT", date: "July 20, 2026", title: "New Mining Expansion in Johannesburg Boosts Daily Yield Capacity", desc: "GrokGold Mining successfully initiated phase 4A exploration site with estimated deposits exceeding 120,000 Oz pure gold." },
        { cat: "ANNOUNCEMENT", date: "July 15, 2026", title: "Launch of Lucky Spin Feature and Member Referral Reward Program", desc: "GrokGold officially releases the instant loyalty wheel program for all active contract holders to boost user earnings." },
        { cat: "PARTNERSHIP", date: "July 08, 2026", title: "Smart Mining Tech Collaboration with Johannesburg Tech Group", desc: "Integration of new IoT sensor systems increases excavator efficiency by 18.4% and speeds up yield validation." }
      ],
      faqTitle: "FREQUENTLY ASKED QUESTIONS",
      faqs: [
        { q: "What is GrokGold Mining?", a: "GrokGold Mining is a modern digital mining platform operated under Randgold Resources Company. We integrate physical heavy excavator machinery in South Africa with global digital collaborations." },
        { q: "How do I claim my daily mining yield?", a: "Members can activate heavy equipment rental or mining operation contracts. Once active, a daily yield of up to 2.0% is generated and can be claimed daily under the Daily Claim portal." },
        { q: "Are deposits and withdrawals secure?", a: "Yes, fully secure. We deploy high-grade SSL encryptions, decentralized hot/cold reserves, and direct partnerships with major banks like BCA for instant, hassle-free processing." },
        { q: "What are the minimum transaction limits?", a: "The minimum daily deposit requirement is IDR 100,000, and the minimum amount required for main balance withdrawals is also IDR 100,000 with 24/7 instant routing." }
      ],
      contactTitle: "CONTACT OUR OFFICES",
      contactSub: "Have inquiries regarding partnerships or portal access? Our Johannesburg support desks are active 24/7.",
      contactForm: {
        name: "Full Name",
        email: "Email Address",
        msg: "Your Message",
        send: "SEND MESSAGE",
        success: "Message transmitted successfully! Our South African representative will correspond with you shortly."
      }
    }
  };

  const activeT = language === 'id' ? t.id : t.en;

  return (
    <div id="company-portal" className="w-full min-h-screen bg-[#04010a] text-slate-100 overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* GLOW BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[120vh] right-10 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[280vh] left-10 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[450vh] right-20 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. PREMIUM TRANSPARENT NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#060311]/90 backdrop-blur-md border-b border-yellow-500/10 py-3.5 shadow-lg shadow-black/40' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full rounded-full bg-[#070313] flex items-center justify-center">
                  <span className="text-[11px] font-black font-orbitron text-yellow-500">GG</span>
                </div>
              </div>
              <div>
                <span className="text-md font-black tracking-widest text-white font-sans">
                  GROCK<span className="text-gradient-gold text-yellow-500">GOLD</span>
                </span>
                <span className="block text-[7px] text-slate-500 font-extrabold tracking-widest uppercase">MINING</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Menu Links */}
          <div className="hidden lg:flex items-center gap-7">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">Home</button>
            <button onClick={() => scrollToSection('about-company')} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">About</button>
            <button onClick={() => scrollToSection('ecosystem')} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">Ecosystem</button>
            <button onClick={() => scrollToSection('news')} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">News</button>
            <button onClick={() => scrollToSection('faq')} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="text-xs font-bold text-slate-300 hover:text-yellow-400 transition cursor-pointer uppercase tracking-wider">Contact</button>
          </div>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Picker */}
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="px-2.5 py-1 rounded bg-[#100827] hover:bg-purple-950/40 border border-yellow-500/20 text-[10px] text-yellow-400 font-extrabold flex items-center gap-1 cursor-pointer tracking-wider"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'id' ? 'ID' : 'EN'}
            </button>

            <button 
              onClick={onLoginClick}
              className="px-5 py-2 rounded-xl text-[11px] font-black tracking-widest border border-white/10 hover:border-yellow-500/40 text-white transition hover:bg-white/5 cursor-pointer"
            >
              LOGIN
            </button>
            
            <button 
              onClick={onRegisterClick}
              className="px-5 py-2 rounded-xl text-[11px] font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition cursor-pointer"
            >
              REGISTER
            </button>
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="px-2 py-1 rounded bg-[#100827] border border-yellow-500/20 text-[9px] text-yellow-400 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              {language === 'id' ? 'ID' : 'EN'}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[60px] z-[999] bg-[#070314]/98 backdrop-blur-lg border-b border-yellow-500/10 p-5 flex flex-col gap-4 shadow-2xl lg:hidden"
          >
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">HOME</button>
            <button onClick={() => scrollToSection('about-company')} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">ABOUT</button>
            <button onClick={() => scrollToSection('ecosystem')} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">ECOSYSTEM</button>
            <button onClick={() => scrollToSection('news')} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">NEWS</button>
            <button onClick={() => scrollToSection('faq')} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="text-left py-2 text-xs font-bold text-slate-200 hover:text-yellow-400 tracking-wider">CONTACT</button>
            
            <div className="h-[1px] bg-white/5 my-1" />
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button 
                onClick={onLoginClick}
                className="py-3 text-center rounded-xl text-xs font-black tracking-widest border border-white/10 text-white hover:bg-white/5 uppercase"
              >
                LOGIN
              </button>
              <button 
                onClick={onRegisterClick}
                className="py-3 text-center rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 uppercase"
              >
                REGISTER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,rgba(16,8,39,0.5)_0%,rgba(4,1,10,1)_100%)]">
        
        {/* Immersive Mining Background Grid Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 mix-blend-color-dodge filter brightness-50" 
             style={{ backgroundImage: "url('/src/assets/images/gold_excavator_1784416439957.jpg')" }} />
        
        {/* Subtle Tech Hex/Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-40" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8 py-16">
          
          {/* Subheader tag */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#180e35] border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span className="text-[9.5px] font-black tracking-[0.2em] text-amber-300 uppercase font-mono">
              A RANDGOLD RESOURCES COMPANY
            </span>
          </motion.div>

          {/* Slogan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-sans tracking-tight uppercase leading-tight text-white">
              Rooted in <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]">Africa</span>.<br />
              Built for the <span className="text-slate-100">World</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 tracking-widest font-extrabold uppercase mt-2 text-center text-purple-400/80">
              {activeT.subSlogan}
            </p>
          </motion.div>

          {/* Slogan Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold"
          >
            {activeT.heroDesc}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4"
          >
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black tracking-widest bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_4px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_35px_rgba(245,158,11,0.35)] transition duration-300 transform active:scale-98 uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 stroke-[3]" />
              <span>{activeT.login}</span>
            </button>
            
            <button 
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black tracking-widest border border-yellow-500/30 hover:border-yellow-500/60 bg-[#0d0720]/80 backdrop-blur-sm text-yellow-400 hover:text-white transition duration-300 uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{activeT.register}</span>
            </button>
          </motion.div>

          {/* Mouse scroll indicator */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('about-company')}
            className="pt-16 flex flex-col items-center gap-2 cursor-pointer text-slate-500 hover:text-yellow-400 transition"
          >
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase font-mono">SCROLL TO DISCOVER</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>

        </div>
      </section>

      {/* 3. ABOUT COMPANY SECTION */}
      <section id="about-company" className="py-24 border-t border-purple-950/25 bg-[#070314]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">{activeT.about}</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.aboutTitle}</h2>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          {/* African Origin Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Block with image and overlay info */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-yellow-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden border border-yellow-500/15 shadow-2xl bg-slate-950">
                <img 
                  src="/src/assets/images/gold_excavator_1784416439957.jpg" 
                  alt="Gold Excavation Site" 
                  className="w-full h-80 object-cover filter brightness-90 group-hover:scale-105 transition duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-1 text-left">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500 text-slate-950 font-black uppercase tracking-wider">AFRICAN LEGACY</span>
                  <p className="text-sm font-black text-white uppercase">JOHANNESBURG, SOUTH AFRICA</p>
                  <p className="text-[10px] text-slate-300 font-semibold font-mono">Headquarters & Operations Hub</p>
                </div>
              </div>
            </div>

            {/* Explanatory text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                {activeT.aboutText1}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                {activeT.aboutText2}
              </p>

              {/* South African flag / Partner note */}
              <div className="bg-purple-950/20 border border-yellow-500/10 rounded-2xl p-4 flex items-center gap-3.5 max-w-lg">
                <Globe className="w-8 h-8 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">RANDGOLD RESOURCES</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Official mineral license operations and equipment compliance certification in South Africa.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Visi & Misi Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            
            {/* Vision card */}
            <div className="bg-gradient-to-b from-[#11092a] to-[#080315] border border-yellow-500/15 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-left relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/15 transition-colors" />
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <h3 className="text-lg font-black text-white tracking-widest font-orbitron">{activeT.vision}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                {activeT.visionText}
              </p>
            </div>

            {/* Mission card */}
            <div className="bg-gradient-to-b from-[#11092a] to-[#080315] border border-yellow-500/15 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-left relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-yellow-500/15 transition-colors" />
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-black text-white tracking-widest font-orbitron">{activeT.mission}</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 font-semibold">
                {activeT.missions.map((m, index) => (
                  <li key={index} className="flex gap-2.5">
                    <span className="text-yellow-500 font-black shrink-0">0{index + 1}.</span>
                    <span className="leading-normal">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Core Values sub-section */}
          <div className="space-y-8 pt-8">
            <h3 className="text-sm font-black text-gold-primary uppercase tracking-[0.25em] text-center text-yellow-500">{activeT.coreValues}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {activeT.values.map((v, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/30 border border-white/5 hover:border-yellow-500/30 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 shadow-md"
                >
                  <span className="text-[10px] font-black text-yellow-500/50 block mb-1">VALUE 0{idx + 1}</span>
                  <h4 className="text-xs font-black text-white tracking-widest mb-1.5 uppercase font-orbitron">{v.title}</h4>
                  <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. ECOSYSTEM SECTION */}
      <section id="ecosystem" className="py-24 bg-gradient-to-b from-[#070314] to-[#04010a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">{activeT.ecosystem}</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.ecosystemTitle}</h2>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeT.ecoItems.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={index} 
                  className="bg-[#120a26]/40 border border-purple-950/40 hover:border-yellow-500/20 rounded-3xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/10 relative group"
                >
                  {/* Decorative background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="w-10 h-10 bg-[#1d123d] rounded-xl flex items-center justify-center text-yellow-400 border border-yellow-500/10 mb-4 group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5 text-yellow-500" />
                  </div>
                  
                  <h3 className="text-md font-extrabold text-white mb-2 uppercase tracking-wide group-hover:text-yellow-400 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. ADVANTAGES SECTION */}
      <section className="py-24 bg-[#050210] border-y border-purple-950/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">{activeT.advantages}</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.advTitle}</h2>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeT.advItems.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={index} 
                  className="bg-gradient-to-b from-[#100927] to-[#06030c] border border-white/5 hover:border-yellow-500/25 rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-400 border border-yellow-500/25 mb-4 shadow-inner">
                    <IconComp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-xs font-black text-white tracking-widest mb-2 uppercase font-orbitron">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. LIVE GOLD PRICE & GRAPH SECTION */}
      <section className="py-24 bg-gradient-to-b from-[#050210] to-[#040108]">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">GOLD RATES</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.goldPriceTitle}</h2>
            <p className="max-w-md mx-auto text-[11px] text-slate-400 font-bold">{activeT.goldPriceSub}</p>
          </div>

          {/* Luxury Gold Pricing Dashboard Widget */}
          <div className="bg-gradient-to-br from-[#1b0f3c] via-[#0b0518] to-[#06030d] border border-yellow-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Numerical Price Block */}
              <div className="space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-yellow-500/10 border border-yellow-500/25 text-[10px] text-yellow-400 font-black tracking-widest font-mono uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE METALS EXCHANGE
                </div>
                
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">GROCKGOLD SPOT PRICE</span>
                  <div className="text-3xl sm:text-4xl font-black text-gradient-gold font-orbitron tracking-tight text-yellow-500">
                    Rp {goldPrice.toLocaleString('id-ID')} <span className="text-sm font-sans text-slate-300 font-bold">/ Gram</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`font-black flex items-center gap-0.5 px-2 py-0.5 rounded ${priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {priceChange >= 0 ? '+' : ''}Rp {priceChange.toLocaleString('id-ID')}
                  </span>
                  <span className={`font-black font-mono ${priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {priceChangePercent >= 0 ? '▲' : '▼'} {priceChangePercent.toFixed(2)}% (24H)
                  </span>
                </div>
              </div>

              {/* Sparkline Graph Visual */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-black uppercase">
                  <span>Chart Trend Spot (24h)</span>
                  <span className="text-yellow-500 font-bold">1 Gram GLD</span>
                </div>
                
                {/* Visual SVG line */}
                <div className="h-24 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-gold-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path 
                      d="M 0 30 Q 15 22 25 24 T 50 12 T 75 8 T 100 5 L 100 30 Z" 
                      fill="url(#chart-gold-grad)" 
                      className="transition-all duration-1000"
                    />
                    {/* Stroke */}
                    <path 
                      d="M 0 30 Q 15 22 25 24 T 50 12 T 75 8 T 100 5" 
                      fill="none" 
                      stroke="#fbbf24" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    {/* Pulse Dot */}
                    <circle cx="100" cy="5" r="2.5" fill="#f59e0b" className="animate-pulse" />
                  </svg>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 font-semibold font-mono leading-none">
                  <span>08:00 WIB</span>
                  <span>14:00 WIB</span>
                  <span>Live Spot</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. STATISTICS SECTION */}
      <section className="py-16 bg-[#04010a] border-t border-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {activeT.stats.map((stat, index) => (
              <div key={index} className="space-y-1 text-center">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">{stat.label}</span>
                <div className="text-2xl sm:text-4xl font-black text-gradient-gold font-orbitron text-yellow-500">{stat.value}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. EVENTS & NEWS SECTION */}
      <section id="news" className="py-24 bg-gradient-to-b from-[#04010a] to-[#070314] border-t border-purple-950/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">ANNOUNCEMENTS</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.newsTitle}</h2>
            <p className="max-w-md mx-auto text-[11px] text-slate-400 font-bold">{activeT.newsSub}</p>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeT.newsItems.map((news, index) => (
              <div 
                key={index} 
                className="bg-[#0b061c]/50 border border-white/5 hover:border-yellow-500/20 rounded-3xl p-6 text-left flex flex-col justify-between h-80 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black font-mono">
                    <span className="text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded border border-yellow-500/20 uppercase tracking-widest">{news.cat}</span>
                    <span className="text-slate-500">{news.date}</span>
                  </div>
                  <h3 className="text-sm font-black text-white group-hover:text-yellow-400 transition-colors uppercase leading-snug">{news.title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed line-clamp-4">{news.desc}</p>
                </div>
                
                <button 
                  onClick={onLoginClick}
                  className="text-[10px] font-black text-yellow-500 hover:text-white transition flex items-center gap-1.5 uppercase cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. PARTNERS & CERTIFICATIONS SECTION */}
      <section className="py-20 bg-[#070314] border-y border-purple-950/20">
        <div className="max-w-6xl mx-auto px-4 space-y-10 text-center">
          <span className="text-[9px] font-black tracking-[0.25em] text-slate-500 uppercase font-mono">GLOBAL STANDARDS & STRATEGIC PARTNERS</span>
          
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:opacity-85 hover:grayscale-0 transition duration-500">
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">RANDGOLD</span>
              <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest">RESOURCES</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">JOHANNESBURG</span>
              <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest">MINING GROUP</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">AFRICAN GOLD</span>
              <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest">COUNCIL</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">ISO 9001</span>
              <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-widest">COMPLIANT SECURITY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section id="faq" className="py-24 bg-[#04010a]">
        <div className="max-w-3xl mx-auto px-4 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">SUPPORT DESK</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.faqTitle}</h2>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="space-y-4 text-left">
            {activeT.faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#0b061c]/40 border border-white/5 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 flex justify-between items-center text-left hover:bg-white/5 transition"
                >
                  <span className="text-xs sm:text-sm font-black text-white leading-relaxed uppercase">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full bg-[#170e35] flex items-center justify-center border border-yellow-500/20 text-yellow-400 transform transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-yellow-500" />
                  </div>
                </button>
                
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-5 text-xs text-slate-300 leading-relaxed font-semibold">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. CONTACT SECTION */}
      <section id="contact" className="py-24 bg-gradient-to-b from-[#04010a] to-[#070314] border-t border-purple-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-yellow-500 uppercase font-mono">SUPPORT</span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-sans">{activeT.contactTitle}</h2>
            <p className="max-w-md mx-auto text-[11px] text-slate-400 font-bold">{activeT.contactSub}</p>
            <div className="w-24 h-[3px] bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            
            {/* Johannesburg Address Info */}
            <div className="bg-[#0e061c] border border-yellow-500/10 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="text-[9px] font-black text-yellow-500 tracking-widest uppercase font-mono">RANDGOLD RESOURCE CORE OFFICES</span>
                <h3 className="text-md font-black text-white uppercase font-sans">GrokGold Mining Headquarters</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-300 leading-relaxed">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Physical Address</span>
                  <p>12th Floor, Randgold Towers, 42 Commissioner St, Marshalltown, Johannesburg, 2001, South Africa.</p>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Corporate Email</span>
                  <p>support@grockgoldmining.com</p>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Mining Hotline</span>
                  <p>+27 (11) 555-0192 (Mon - Fri)</p>
                </div>
              </div>

              <div className="h-[1px] bg-white/5 my-1" />

              <div className="space-y-2">
                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Corporate Social Channels</span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-[#1c0e35] text-[10px] font-extrabold text-yellow-400 border border-yellow-500/15 cursor-pointer hover:bg-yellow-500/10 hover:text-white transition uppercase">Telegram</span>
                  <span className="px-2.5 py-1 rounded bg-[#1c0e35] text-[10px] font-extrabold text-yellow-400 border border-yellow-500/15 cursor-pointer hover:bg-yellow-500/10 hover:text-white transition uppercase">LinkedIn</span>
                  <span className="px-2.5 py-1 rounded bg-[#1c0e35] text-[10px] font-extrabold text-yellow-400 border border-yellow-500/15 cursor-pointer hover:bg-yellow-500/10 hover:text-white transition uppercase">Twitter</span>
                </div>
              </div>
            </div>

            {/* Premium Dynamic Contact Form */}
            <div className="bg-[#06030d] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest text-left block">Direct Inquiries Form</span>
              
              <AnimatePresence mode="wait">
                {contactSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 bg-yellow-500/10 border border-yellow-500/35 rounded-2xl text-center text-xs text-yellow-400 font-semibold leading-relaxed space-y-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-500/30">
                      <Send className="w-5 h-5 animate-pulse" />
                    </div>
                    <p>{activeT.contactForm.success}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase">{activeT.contactForm.name}</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-[#11092a]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase">{activeT.contactForm.email}</label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#11092a]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase">{activeT.contactForm.msg}</label>
                      <textarea 
                        rows={3}
                        required
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        className="w-full bg-[#11092a]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500/40 resize-none"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs tracking-widest rounded-xl transition duration-300 hover:brightness-110 uppercase active:scale-98 shadow-md shadow-yellow-500/10 cursor-pointer"
                    >
                      {activeT.contactForm.send}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-[#030107] border-t border-purple-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-black text-white tracking-widest font-sans uppercase">GROCK<span className="text-yellow-500">GOLD</span> MINING</span>
            <span className="text-[8px] text-slate-500 font-extrabold tracking-widest uppercase">A RANDGOLD RESOURCES COMPANY</span>
          </div>

          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed max-w-xl mx-auto">
            © 2026 GrockGold Mining Limited. Registered and licensed under South African Mineral and Petroleum Resources Development Act (MPRDA). All speculative contracts subject to daily capping rules.
          </div>

          <div className="text-[8px] text-slate-600 font-mono tracking-widest uppercase mt-4">
            ROUTED IN AFRICA. BUILT FOR THE WORLD. v2.5
          </div>

        </div>
      </footer>

    </div>
  );
}
