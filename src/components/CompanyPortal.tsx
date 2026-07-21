import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Info, 
  Layers, 
  TrendingUp, 
  Newspaper, 
  HelpCircle, 
  Mail, 
  User, 
  Lock, 
  Shield, 
  Activity, 
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  X, 
  Cpu, 
  Coins, 
  Users, 
  CheckCircle, 
  Award, 
  Star, 
  ArrowRight, 
  MapPin, 
  Phone, 
  DollarSign, 
  Calendar,
  LockKeyhole,
  Check
} from 'lucide-react';

interface CompanyPortalProps {
  language: 'id' | 'en';
  toggleLanguage: () => void;
  onNavigateToAuth: (screen: 'login' | 'register') => void;
  memberCount: number;
}

export default function CompanyPortal({ 
  language, 
  toggleLanguage, 
  onNavigateToAuth,
  memberCount 
}: CompanyPortalProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'vision' | 'values'>('history');
  
  // Gold chart interactive state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll spy or active section detection
  const [activeSection, setActiveSection] = useState('home');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Live gold price counter simulation
  const [liveGoldPrice, setLiveGoldPrice] = useState(1458230);
  const [priceChange, setPriceChange] = useState(12500);
  const [isPriceUp, setIsPriceUp] = useState(true);

  // Handle scroll effect for Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Simple scroll spy logic
      const sections = ['home', 'about', 'ecosystem', 'advantages', 'goldprice', 'stats', 'news', 'faq', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate gold price small ticks
  useEffect(() => {
    const interval = setInterval(() => {
      const tick = Math.floor((Math.random() - 0.45) * 800);
      setLiveGoldPrice(prev => {
        const nextPrice = prev + tick;
        setIsPriceUp(tick >= 0);
        setPriceChange(prevChange => prevChange + tick);
        return nextPrice;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Gold Chart Coordinates mapping
  const chartDataSets = {
    '24h': [1451000, 1453200, 1450500, 1454000, 1456100, 1455200, 1458230],
    '7d': [1435000, 1442000, 1439000, 1448000, 1452000, 1449000, 1458230],
    '30d': [1395000, 1412000, 1408000, 1425000, 1438000, 1430000, 1458230]
  };

  const currentChartData = chartDataSets[selectedRange];
  const chartLabels = {
    '24h': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30d': ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Now']
  }[selectedRange];

  const minVal = Math.min(...currentChartData) * 0.995;
  const maxVal = Math.max(...currentChartData) * 1.005;
  const valueRange = maxVal - minVal;

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  // Convert array data to SVG polyline coordinates
  const points = currentChartData.map((val, i) => {
    const x = paddingX + (i * (width - paddingX * 2)) / (currentChartData.length - 1);
    const y = height - paddingY - ((val - minVal) * (height - paddingY * 2)) / valueRange;
    return { x, y, value: val };
  });

  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathString = `${pathString} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Content dictionary
  const portalText = {
    id: {
      slogan: 'ROOTED IN AFRICA. BUILT FOR THE WORLD.',
      subtitle: 'Dari jantung kekayaan sumber daya alam Afrika hingga pasar global, GrockGold Mining menyatukan teknologi mutakhir, armada armada modern, dan ekosistem pertambangan digital kelas dunia.',
      ctaLogin: 'MASUK PORTAL',
      ctaRegister: 'DAFTAR AKUN',
      statsActiveMiners: 'Miner Aktif',
      statsTotalAssets: 'Total Aset',
      statsTransactions: 'Transaksi Sukses',
      statsCountries: 'Negara Global',
      
      aboutTitle: 'TENTANG GROCKGOLD MINING',
      aboutText: 'GrockGold Mining merupakan anak perusahaan terkemuka dari RandGold Resources yang berfokus penuh pada pengembangan layanan alat berat pertambangan, optimalisasi hash daya tambang, serta integrasi ekosistem modern global.',
      aboutSubtitle: 'Terinspirasi dari kekayaan sumber daya alam Afrika yang melimpah, GrockGold hadir dengan visi menyatukan industri pertambangan konvensional dengan instrumen teknologi modern, digitalisasi kontrak, serta kenyamanan ekspansi jangka panjang.',
      aboutTabHistory: 'Sejarah Perusahaan',
      aboutTabVision: 'Visi & Misi',
      aboutTabValues: 'Nilai Utama',
      
      historyContent: 'Didirikan sebagai bagian dari aliansi strategis di Johannesburg, Afrika Selatan, GrockGold Mining bertransformasi dari sekadar operator tambang konvensional menjadi raksasa pertambangan digital. Mengandalkan konsesi tambang kaya emas di Afrika Barat dan didukung penuh oleh RandGold Resources, kami menyediakan armada ekskavator berat berteknologi tinggi dan fasilitas pemrosesan murni guna memaksimalkan hasil penambangan yang berkeadilan bagi seluruh mitra komunitas di seluruh dunia.',
      visionContent: 'Visi kami adalah menjadi ekosistem pertambangan emas terintegrasi terbesar di dunia yang transparan, berteknologi tinggi, serta mudah diakses oleh siapa saja dari mana saja. Misi kami meliputi penyediaan armada alat berat kelas dunia yang efisien, standarisasi hasil tambang melalui verifikasi real-time, memajukan komunitas global, dan menjamin likuiditas transaksi emas digital secara aman.',
      valuesContent: 'Keberhasilan GrockGold didorong oleh 5 pilar utama kami: STRENGTH (ketangguhan operasional), INTEGRITY (transparansi tanpa kompromi), INNOVATION (teknologi digital cerdas), EXCELLENCE (standar kualitas tertinggi), dan SUSTAINABILITY (tanggung jawab sosial dan kelestarian ekologi).',

      ecosystemTitle: 'EKOSISTEM GROCKGOLD',
      ecosystemSubtitle: 'Sinergi infrastruktur fisik pertambangan riil dan portofolio teknologi digital super canggih.',
      ecoMining: 'Mining Equipment & Operations',
      ecoMiningDesc: 'Pengadaan, perawatan, dan pengerahan armada ekskavator berkapasitas tinggi di konsesi tambang utama untuk menghasilkan batuan emas berkadar murni tinggi.',
      ecoTech: 'Digital Mining Technology',
      ecoTechDesc: 'Sistem monitoring telemetri IoT real-time, integrasi smart dashboard pertambangan, dan optimasi hash penambangan modern.',
      ecoMarket: 'Marketplace & Liquidity',
      ecoMarketDesc: 'Fasilitas pertukaran nilai yang cepat dan konversi hasil pertambangan langsung ke mata uang fiat atau aset emas digital secara instan.',
      ecoComm: 'Global Community',
      ecoCommDesc: 'Jejaring kolaboratif antar mitra pertambangan dan investor dari lebih 24 negara yang berkomitmen membangun masa depan energi dan mineral.',

      advTitle: 'KEUNGGULAN UTAMA KAMI',
      advSubtitle: 'Mengapa korporasi dan ribuan mitra global mempercayakan portofolio pertambangan mereka kepada GrockGold.',
      adv1Title: 'Keamanan Kelas Bank',
      adv1Desc: 'Enkripsi data berlapis, penyimpanan emas fisik tersertifikasi, dan audit berkala menjamin seluruh aset Anda tetap terlindungi.',
      adv2Title: 'Transparansi Penuh',
      adv2Desc: 'Laporan produksi harian, telemetri operasional langsung, dan verifikasi hash instan yang dapat diaudit kapan saja.',
      adv3Title: 'Inovasi Tanpa Batas',
      adv3Desc: 'Kontrak pertambangan digital yang fleksibel, proses otomatisasi penuh tanpa biaya perantara konvensional.',
      adv4Title: 'Jejaring Global',
      adv4Desc: 'Didukung RandGold Resources dengan kemitraan strategis di Afrika, Eropa, Amerika, dan Asia Pasifik.',

      goldTitle: 'HARGA EMAS LIVE & GRAFIK',
      goldSubtitle: 'Pantau fluktuasi harga acuan emas GrockGold global secara real-time berdasarkan pasar fisik internasional.',
      goldUnit: 'per Unit GLD',
      goldHigh: 'Tertinggi 24h',
      goldLow: 'Terendah 24h',
      goldInteractivePrompt: 'Arahkan kursor atau sentuh grafik untuk melihat riwayat harga',

      newsTitle: 'EVENT & PENGUMUMAN TERBARU',
      newsSubtitle: 'Ikuti perkembangan terbaru ekspansi tambang, laporan berkala, dan siaran pers korporat kami.',
      news1Title: 'Ekspansi Armada Ekskavator di Konsesi Afrika Barat',
      news1Desc: 'GrockGold menambah 12 unit ekskavator berat hidrolik baru guna melipatgandakan kapasitas produksi batuan mentah harian.',
      news2Title: 'Sertifikasi Keamanan ISO 9001 & ISO 14001',
      news2Desc: 'Kami resmi menerima sertifikasi standar manajemen kualitas internasional dan kepatuhan ramah lingkungan untuk seluruh operasional tambang.',
      news3Title: 'GrockGold Melampaui Rekor Rp 12 Triliun dalam Total Aset',
      news3Desc: 'Berkat lonjakan efisiensi operasional dan kepercayaan mitra, total cadangan aset emas yang diaudit kini melampaui rekor baru.',

      faqTitle: 'PERTANYAAN YANG SERING DIAJUKAN',
      faqSubtitle: 'Temukan jawaban cepat mengenai legalitas, cara kerja kontrak, dan jaminan keamanan GrockGold Mining.',
      faqQ1: 'Apa itu GrockGold Mining dan bagaimana hubungannya dengan RandGold Resources?',
      faqA1: 'GrockGold Mining adalah anak perusahaan berteknologi tinggi dari RandGold Resources yang mengkhususkan diri dalam pengadaan armada alat berat dan digitalisasi hasil penambangan emas riil di Afrika Selatan & Afrika Barat.',
      faqQ2: 'Bagaimana cara kerja kontrak pertambangan di platform ini?',
      faqA2: 'Mitra membeli unit kontrak pertambangan yang merepresentasikan kepemilikan kapasitas hash alat berat. Hasil tambang harian didistribusikan secara otomatis ke saldo Wallet Anda setiap siklus 24 jam.',
      faqQ3: 'Apakah investasi dan saldo dana saya aman?',
      faqA3: 'Sangat aman. Platform kami didukung oleh dana lindung nilai emas fisik riil dari hasil bumi konsesi RandGold Resources. Seluruh proses transaksi menggunakan enkripsi tingkat militer dan dilindungi sistem verifikasi otentikasi ganda.',
      faqQ4: 'Berapa batas minimum penarikan dan berapa lama prosesnya?',
      faqA4: 'Batas minimum penarikan adalah Rp 100.000. Proses penarikan diproses secara instan hingga maksimal beberapa menit langsung ke rekening bank lokal terdaftar Anda atau dompet USDT.',
      faqQ5: 'Bagaimana cara mendaftar dan mulai berpartisipasi?',
      faqA5: 'Sangat mudah! Anda hanya perlu mengeklik tombol "DAFTAR AKUN", mengisi formulir identitas dasar, dan akun Anda akan langsung aktif tanpa biaya pendaftaran tersembunyi.',

      contactTitle: 'HUBUNGI KANTOR GLOBAL KAMI',
      contactSubtitle: 'Ada pertanyaan atau membutuhkan konsultasi korporat? Tim profesional kami siap membantu Anda 24/7.',
      contactFormName: 'Nama Lengkap',
      contactFormEmail: 'Alamat Email',
      contactFormMsg: 'Pesan atau Pertanyaan Anda',
      contactFormSubmit: 'KIRIM PESAN',
      contactSuccessMsg: 'Terima kasih! Pesan Anda telah sukses dikirim ke tim dukungan kami.',
      contactOffice: 'Kantor Pusat Global',
      contactAddress: 'Johannesburg South Africa Mining Hub, RandGold Block, Floor 12.'
    },
    en: {
      slogan: 'ROOTED IN AFRICA. BUILT FOR THE WORLD.',
      subtitle: 'From the heart of Africa\'s rich natural resources to the global market, GrockGold Mining integrates cutting-edge technology, heavy excavator fleets, and a world-class digital mining ecosystem.',
      ctaLogin: 'MEMBER PORTAL',
      ctaRegister: 'REGISTER NOW',
      statsActiveMiners: 'Active Miners',
      statsTotalAssets: 'Total Assets',
      statsTransactions: 'Successful Transactions',
      statsCountries: 'Global Countries',

      aboutTitle: 'ABOUT GROCKGOLD MINING',
      aboutText: 'GrockGold Mining is a premier subsidiary of RandGold Resources, fully focused on heavy mining equipment operations, yield hash rate optimization, and international digital integration.',
      aboutSubtitle: 'Inspired by the abundant natural wealth of Africa, GrockGold bridges conventional mineral mining with modern technology, secure contract digitization, and effortless global scalability.',
      aboutTabHistory: 'Corporate History',
      aboutTabVision: 'Vision & Mission',
      aboutTabValues: 'Core Values',

      historyContent: 'Established through a strategic alliance in Johannesburg, South Africa, GrockGold Mining evolved from a traditional mining contractor into a high-tech gold mining powerhouse. Leveraging gold-rich concessions in West Africa and backed by RandGold Resources, we manage a state-of-the-art heavy fleet of heavy excavators and processing facilities to yield high-purity gold outputs, sharing sustainable value with our global community.',
      visionContent: 'Our vision is to be the world\'s largest and most transparent integrated digital gold mining ecosystem, accessible to everyone, everywhere. Our mission includes deploying premium high-efficiency heavy excavator fleets, standardizing daily yields via real-time telemetry, empowering global communities, and guaranteeing high-liquidity secure conversions of mined assets.',
      valuesContent: 'The success of GrockGold rests on 5 core pillars: STRENGTH (operational resilience), INTEGRITY (uncompromising transparency), INNOVATION (smart digital technology), EXCELLENCE (highest global quality standard), and SUSTAINABILITY (environmental stewardship and community care).',

      ecosystemTitle: 'GROCKGOLD ECOSYSTEM',
      ecosystemSubtitle: 'Synergy of real physical mining infrastructure and advanced digital asset management.',
      ecoMining: 'Heavy Equipment & Operations',
      ecoMiningDesc: 'Sourcing, maintaining, and deploying high-capacity excavator fleets across premium mineral concessions to extract high-yield gold reserves.',
      ecoTech: 'Digital Mining Technology',
      ecoTechDesc: 'Real-time IoT telemetry monitoring, unified operations dashboards, and advanced hashing speed enhancements.',
      ecoMarket: 'Marketplace & Liquidity',
      ecoMarketDesc: 'High-speed value exchanges and instant conversion of mined yields to local fiat currency or secure gold assets.',
      ecoComm: 'Global Community',
      ecoCommDesc: 'A collaborative network of mining partners and investors from over 24 countries committed to securing future mineral reserves.',

      advTitle: 'KEY ADVANTAGES',
      advSubtitle: 'Why institutional partners and thousands of global members trust GrockGold with their mineral portfolios.',
      adv1Title: 'Bank-Grade Security',
      adv1Desc: 'Multi-layer data encryption, certified gold reserves vault storage, and regular independent audits protect your assets.',
      adv2Title: 'Total Transparency',
      adv2Desc: 'Live daily production logs, real-time telemetry updates, and instantly verifiable mining yields.',
      adv3Title: 'Limitless Innovation',
      adv3Desc: 'Highly flexible digital contracts, completely automated payouts, and zero conventional broker fees.',
      adv4Title: 'Global Network',
      adv4Desc: 'Backed by RandGold Resources with robust strategic partnerships across Africa, Europe, Americas, and Asia Pacific.',

      goldTitle: 'LIVE GOLD PRICE & INTERACTIVE CHART',
      goldSubtitle: 'Monitor live international gold reference prices calibrated against premium spot physical markets.',
      goldUnit: 'per GLD Unit',
      goldHigh: '24h High',
      goldLow: '24h Low',
      goldInteractivePrompt: 'Hover or tap on the chart to inspect pricing history',

      newsTitle: 'EVENTS & ANNOUNCEMENTS',
      newsSubtitle: 'Stay updated with our mining concessions expansions, periodic audits, and press releases.',
      news1Title: 'Excavator Fleet Expansion in West Africa Concessions',
      news1Desc: 'GrockGold deploys 12 new hydraulic heavy excavator units to double daily raw ore excavation capacities.',
      news2Title: 'Standardized ISO 9001 & ISO 14001 Quality Certification',
      news2Desc: 'We have officially obtained world-class quality management and ecological compliance certifications for all active mine sites.',
      news3Title: 'GrockGold Exceeds Rp 12 Trillion in Verified Assets Under Management',
      news3Desc: 'Driven by stellar mining efficiency and surging partner trust, our audited gold reserves have soared to historic heights.',

      faqTitle: 'FREQUENTLY ASKED QUESTIONS',
      faqSubtitle: 'Quick answers about GrockGold legalities, contract structures, and security protocols.',
      faqQ1: 'What is GrockGold Mining and its relation to RandGold Resources?',
      faqA1: 'GrockGold Mining is a high-tech mining subsidiary of RandGold Resources, specializing in heavy excavator leasing and modern digitized gold yields across South & West Africa.',
      faqQ2: 'How do the digital mining contracts work?',
      faqA2: 'Members lease contract units representing shares of heavy machinery excavation hash. Daily mining yields are automatically calculated and distributed to your Wallet every 24-hour cycle.',
      faqQ3: 'Is my deposit and wallet balance safe?',
      faqA3: 'Absolutely. All digital contracts are backed by substantial physical gold reserves harvested from our real concessions. Transactions feature bank-grade encryption and multi-factor authentication systems.',
      faqQ4: 'What is the minimum withdrawal limit and processing speed?',
      faqA4: 'The minimum withdrawal limit is Rp 100,000. Withdrawal requests are processed instantly or within a maximum of a few minutes directly to your registered local bank or USDT address.',
      faqQ5: 'How do I sign up and start participating?',
      faqA5: 'It is incredibly easy! Simply click "REGISTER NOW", fill in your basic credentials, and your account will be immediately activated with no hidden registration costs.',

      contactTitle: 'CONTACT OUR GLOBAL OFFICE',
      contactSubtitle: 'Have questions or require corporate assistance? Our dedicated global support team is available 24/7.',
      contactFormName: 'Full Name',
      contactFormEmail: 'Email Address',
      contactFormMsg: 'Your Message or Inquiry',
      contactFormSubmit: 'SEND MESSAGE',
      contactSuccessMsg: 'Thank you! Your inquiry has been successfully sent to our support specialists.',
      contactOffice: 'Global Headquarters',
      contactAddress: 'Johannesburg South Africa Mining Hub, RandGold Block, Floor 12.'
    }
  };

  const text = portalText[language];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSuccess(true);
      setTimeout(() => {
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setContactSuccess(false);
      }, 5000);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="w-full bg-[#04010a] text-slate-100 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#05020f]/90 border-b border-yellow-500/10 backdrop-blur-md py-3 shadow-lg' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="text-base sm:text-lg font-black tracking-widest text-white uppercase flex items-center gap-2">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent">GROCK</span>
              <span className="text-yellow-500">GOLD</span>
            </div>
            <div className="text-[7px] text-slate-400 font-bold tracking-wider uppercase">
              A RANDGOLD RESOURCES COMPANY
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {[
              { id: 'home', label: language === 'id' ? 'Beranda' : 'Home' },
              { id: 'about', label: language === 'id' ? 'Tentang Kami' : 'About' },
              { id: 'ecosystem', label: language === 'id' ? 'Ekosistem' : 'Ecosystem' },
              { id: 'goldprice', label: language === 'id' ? 'Harga Emas' : 'Live Gold' },
              { id: 'news', label: language === 'id' ? 'Berita' : 'News' },
              { id: 'faq', label: 'FAQ' },
              { id: 'contact', label: language === 'id' ? 'Kontak' : 'Contact' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-xs font-bold tracking-widest uppercase transition-colors relative py-1 hover:text-yellow-400 cursor-pointer ${
                  activeSection === link.id ? 'text-yellow-500' : 'text-slate-300'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div 
                    layoutId="activeUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-yellow-500/30 bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest uppercase transition cursor-pointer text-slate-300 hover:text-white"
            >
              <Globe className="w-3.5 h-3.5 text-yellow-500" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Login & Register */}
            <button
              onClick={() => onNavigateToAuth('login')}
              className="px-4 py-2 border border-yellow-500/30 text-yellow-400 hover:text-white hover:bg-yellow-500/10 text-xs font-extrabold tracking-widest uppercase rounded-xl transition cursor-pointer"
            >
              LOGIN
            </button>
            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition hover:brightness-110 shadow-lg shadow-yellow-500/10 active:scale-[0.98] cursor-pointer"
            >
              REGISTER
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300"
            >
              <Globe className="w-3 h-3 text-yellow-500" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[65px] left-0 right-0 z-[999] bg-[#060312] border-b border-yellow-500/10 backdrop-blur-xl px-5 py-6 space-y-4 flex flex-col shadow-2xl lg:hidden"
          >
            {[
              { id: 'home', label: language === 'id' ? 'Beranda' : 'Home' },
              { id: 'about', label: language === 'id' ? 'Tentang Kami' : 'About' },
              { id: 'ecosystem', label: language === 'id' ? 'Ekosistem' : 'Ecosystem' },
              { id: 'goldprice', label: language === 'id' ? 'Harga Emas' : 'Live Gold' },
              { id: 'news', label: language === 'id' ? 'Berita' : 'News' },
              { id: 'faq', label: 'FAQ' },
              { id: 'contact', label: language === 'id' ? 'Kontak' : 'Contact' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm font-black uppercase tracking-widest text-left text-slate-300 hover:text-yellow-400 py-1 cursor-pointer"
              >
                {link.label}
              </button>
            ))}

            <div className="h-[1px] bg-white/5 my-2" />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToAuth('login'); }}
                className="py-3 border border-yellow-500/20 text-yellow-400 text-xs font-black tracking-widest uppercase rounded-xl transition text-center"
              >
                LOGIN
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToAuth('register'); }}
                className="py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition text-center"
              >
                REGISTER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section id="home" className="min-h-screen relative flex items-center pt-24 overflow-hidden">
        {/* Visual Background Elements */}
        <div className="absolute inset-0 bg-[#04010b]" />
        
        {/* African Concession Gold mining mockup abstract layer */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Mesh grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
          {/* Glowing spotlights */}
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]" />
        </div>

        {/* Dynamic moving floating polygon representing heavy extraction */}
        <div className="absolute right-[-10%] top-[10%] w-[600px] h-[600px] opacity-15 pointer-events-none hidden xl:block">
          <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 via-transparent to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black tracking-widest uppercase text-yellow-400">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                <span>RANDGOLD RESOURCES GROUP</span>
              </div>

              {/* Slogan */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-orbitron">
                Rooted in <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 bg-clip-text text-transparent">Africa</span>,<br className="hidden sm:inline" /> 
                Built for the <span className="text-yellow-500">World</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {text.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => onNavigateToAuth('login')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition hover:brightness-110 hover:shadow-[0_4px_30px_rgba(245,158,11,0.2)] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <Coins className="w-4.5 h-4.5 animate-bounce" />
                  <span>{text.ctaLogin}</span>
                </button>
                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="px-8 py-4 bg-slate-900/80 border border-slate-800 hover:border-yellow-500/30 text-white text-xs font-black tracking-widest uppercase rounded-xl transition hover:bg-slate-800/80 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>{text.ctaRegister}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Key Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start pt-6 border-t border-white/5 max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-wider uppercase text-slate-400">
                  <CheckCircle className="w-4 h-4 text-yellow-500" />
                  <span>ISO 9001 CERTIFIED</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black tracking-wider uppercase text-slate-400">
                  <CheckCircle className="w-4 h-4 text-yellow-500" />
                  <span>AUDITED RESERVES</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black tracking-wider uppercase text-slate-400">
                  <CheckCircle className="w-4 h-4 text-yellow-500" />
                  <span>SECURE TRANSFERS</span>
                </div>
              </div>

            </div>

            {/* Right Interactive Card / Visual Column */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-sm bg-gradient-to-b from-[#120a2a] to-[#060312] border border-yellow-500/20 rounded-[36px] p-6 shadow-[0_0_50px_rgba(234,179,8,0.08)] relative overflow-hidden backdrop-blur-md"
              >
                {/* Internal glowing radial element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Animated Gold Hex Coin mockup */}
                <div className="relative flex justify-center py-6">
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="w-32 h-32 relative preserve-3d"
                  >
                    {/* Glowing outer circle */}
                    <div className="absolute inset-[-10px] rounded-full border border-yellow-500/10 animate-ping opacity-50" />
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center p-[3px] shadow-[0_0_35px_rgba(234,179,8,0.3)]">
                      <div className="w-full h-full rounded-full bg-[#070314] flex flex-col items-center justify-center border border-yellow-500/30">
                        <span className="text-2xl font-black text-gradient-gold font-orbitron">GLD</span>
                        <span className="text-[7px] text-yellow-500/80 font-black tracking-widest uppercase">GROCKGOLD</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  {/* Realtime stats card */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">{language === 'id' ? 'Nilai Acuan Spot' : 'Spot Reference Price'}</span>
                      <span className="text-yellow-400 font-black font-mono text-sm">Rp {liveGoldPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">{language === 'id' ? 'Fluktuasi 24h' : '24h Fluctuation'}</span>
                      <span className={`font-black font-mono flex items-center gap-0.5 ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPriceUp ? '▲' : '▼'} Rp {Math.abs(priceChange).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="h-[1px] bg-white/5 my-1" />
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase font-mono">
                      <span>Status Jaringan</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Micro features list */}
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <Cpu className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <span>HEAVY FLEET</span>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <Users className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                      <span>{memberCount}+ USERS</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION (TENTANG KAMI) */}
      <section id="about" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#04010b] to-[#070313]">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
              {language === 'id' ? 'PROFIL KORPORASI' : 'CORPORATE PROFILE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
              {text.aboutTitle}
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {text.aboutText}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Visual Map Badge & Big Quote */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* African Concession Gold map graphic */}
              <div className="bg-[#100726]/40 border border-yellow-500/10 rounded-[32px] p-6 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* SVG Abstract Continent Africa mapping */}
                <div className="w-48 h-48 mb-4 relative opacity-80">
                  <svg viewBox="0 0 100 120" className="w-full h-full text-yellow-500/40 fill-current">
                    <path d="M40 10 Q50 5, 55 12 T65 15 T75 25 T80 40 T78 55 T65 75 T50 90 T42 105 T38 115 T35 110 T25 95 T18 80 T15 65 T12 50 T15 35 T22 25 T30 15 Z" />
                    {/* Glowing spot markers representing mines in West & South Africa */}
                    <circle cx="25" cy="50" r="3" className="text-yellow-400 fill-current animate-ping" />
                    <circle cx="25" cy="50" r="2" className="text-yellow-400 fill-current" />
                    <circle cx="38" cy="110" r="3" className="text-yellow-400 fill-current animate-ping" />
                    <circle cx="38" cy="110" r="2" className="text-yellow-400 fill-current" />
                  </svg>
                </div>

                <h3 className="text-sm font-extrabold text-white tracking-widest uppercase font-orbitron">AFRICAN HERITAGE</h3>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-2 uppercase max-w-xs">
                  {language === 'id' 
                    ? 'Konsesi Tambang Emas Kaya Mineral di Afrika Selatan & Barat Menjadi Pondasi Produksi Kami.'
                    : 'Rich Gold Mining Concessions in South & West Africa Lay the Foundation of Our Output.'}
                </p>
              </div>

              {/* Bold Quote */}
              <div className="border-l-4 border-yellow-500 pl-4 space-y-1">
                <span className="text-xs font-black text-yellow-500 uppercase tracking-widest font-mono">CORPORATE STATEMENT</span>
                <p className="text-xs sm:text-sm text-slate-300 font-bold italic leading-relaxed">
                  {language === 'id' 
                    ? '"Dari jantung Afrika hingga pasar global, GrockGold Mining berkomitmen penuh menciptakan efisiensi ekstraksi mineral dan nilai abadi bagi ekosistem."'
                    : '"From the heart of Africa to the global market, GrockGold Mining is committed to maximizing mineral extraction efficiency and enduring value."'}
                </p>
              </div>

            </div>

            {/* Right Column: Dynamic tabbed content switcher */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tab headers with premium bottom border */}
              <div className="flex border-b border-white/5 pb-2 gap-4">
                {[
                  { id: 'history', label: text.aboutTabHistory },
                  { id: 'vision', label: text.aboutTabVision },
                  { id: 'values', label: text.aboutTabValues }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-xs font-black tracking-widest uppercase pb-2 transition cursor-pointer ${
                      activeTab === tab.id 
                        ? 'text-yellow-500 border-b-2 border-yellow-500' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Body */}
              <div className="bg-[#0b061c]/40 border border-white/5 rounded-2xl p-6 min-h-[180px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-medium"
                  >
                    {activeTab === 'history' && <p>{text.historyContent}</p>}
                    {activeTab === 'vision' && <p>{text.visionContent}</p>}
                    {activeTab === 'values' && <p>{text.valuesContent}</p>}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Minor icons breakdown row */}
              <div className="grid grid-cols-4 gap-3 pt-3 text-center">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">RICH RESOURCE</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Users className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">STRONG TEAM</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">PROUD HERITAGE</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Globe className="w-5 h-5 text-yellow-500 mx-auto mb-1.5" />
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">GLOBAL VISION</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. ECOSYSTEM SECTION (EKOSISTEM) */}
      <section id="ecosystem" className="py-24 relative bg-[#04010a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
              {language === 'id' ? 'INTEGRASI INFRASTRUKTUR' : 'INFRASTRUCTURE INTEGRATION'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
              {text.ecosystemTitle}
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {text.ecosystemSubtitle}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Eco Card 1 */}
            <div className="bg-[#100726]/30 border border-white/5 hover:border-yellow-500/30 rounded-[28px] p-5 transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center transition group-hover:scale-105">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{text.ecoMining}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.ecoMiningDesc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[9px] text-yellow-500 font-black tracking-widest uppercase">
                HEAVY EQUIPMENT LEASING
              </div>
            </div>

            {/* Eco Card 2 */}
            <div className="bg-[#100726]/30 border border-white/5 hover:border-yellow-500/30 rounded-[28px] p-5 transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center transition group-hover:scale-105">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{text.ecoTech}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.ecoTechDesc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[9px] text-yellow-500 font-black tracking-widest uppercase">
                IoT TELEMETRY LOGS
              </div>
            </div>

            {/* Eco Card 3 */}
            <div className="bg-[#100726]/30 border border-white/5 hover:border-yellow-500/30 rounded-[28px] p-5 transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center transition group-hover:scale-105">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{text.ecoMarket}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.ecoMarketDesc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[9px] text-yellow-500 font-black tracking-widest uppercase">
                INSTANT LIQUIDITY EXCHANGE
              </div>
            </div>

            {/* Eco Card 4 */}
            <div className="bg-[#100726]/30 border border-white/5 hover:border-yellow-500/30 rounded-[28px] p-5 transition duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center transition group-hover:scale-105">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{text.ecoComm}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.ecoCommDesc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[9px] text-yellow-500 font-black tracking-widest uppercase">
                GLOBAL 24+ REGIONS
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. ADVANTAGES SECTION (KEUNGGULAN) */}
      <section id="advantages" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070313] to-[#04010a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
              {language === 'id' ? 'MUTU LAYANAN' : 'QUALITY OF SERVICE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
              {text.advTitle}
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {text.advSubtitle}
            </p>
          </div>

          {/* 2x2 Bento grid advantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Advantage 1 */}
            <div className="bg-gradient-to-br from-[#120a26] to-slate-950/80 border border-white/5 rounded-3xl p-6.5 flex gap-5 relative overflow-hidden">
              <div className="shrink-0 w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center">
                <LockKeyhole className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">{text.adv1Title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {text.adv1Desc}
                </p>
              </div>
            </div>

            {/* Advantage 2 */}
            <div className="bg-gradient-to-br from-[#120a26] to-slate-950/80 border border-white/5 rounded-3xl p-6.5 flex gap-5 relative overflow-hidden">
              <div className="shrink-0 w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">{text.adv2Title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {text.adv2Desc}
                </p>
              </div>
            </div>

            {/* Advantage 3 */}
            <div className="bg-gradient-to-br from-[#120a26] to-slate-950/80 border border-white/5 rounded-3xl p-6.5 flex gap-5 relative overflow-hidden">
              <div className="shrink-0 w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">{text.adv3Title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {text.adv3Desc}
                </p>
              </div>
            </div>

            {/* Advantage 4 */}
            <div className="bg-gradient-to-br from-[#120a26] to-slate-950/80 border border-white/5 rounded-3xl p-6.5 flex gap-5 relative overflow-hidden">
              <div className="shrink-0 w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">{text.adv4Title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {text.adv4Desc}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. LIVE GOLD PRICE & INTERACTIVE CHART */}
      <section id="goldprice" className="py-24 relative bg-[#04010a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side info */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
                {language === 'id' ? 'DATA PASAR REAL-TIME' : 'REAL-TIME MARKET FEED'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
                {text.goldTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                {text.goldSubtitle}
              </p>

              {/* Stats pill boxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b061c]/60 border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">{text.goldHigh}</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    Rp {(liveGoldPrice * 1.015).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="bg-[#0b061c]/60 border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">{text.goldLow}</span>
                  <span className="text-sm font-black text-rose-400 font-mono">
                    Rp {(liveGoldPrice * 0.985).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-500 leading-relaxed font-semibold">
                ⚠️ {language === 'id' 
                  ? 'Harga acuan dikalibrasi secara dinamis berdasarkan pergerakan fisik Spot London Gold Market.' 
                  : 'Calibration prices are dynamically aligned in real-time against physical London Gold Spot Market flows.'}
              </div>
            </div>

            {/* Right side interactive chart */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-b from-[#120a2a] to-[#060312] border border-yellow-500/20 rounded-[32px] p-6 shadow-2xl relative">
                
                {/* Header controls */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[9px] text-yellow-500/60 font-black uppercase block tracking-wider mb-0.5">GROCKGOLD INDEX</span>
                    <h3 className="text-lg font-black text-white font-mono">
                      {hoveredIndex !== null ? (
                        <>Rp {points[hoveredIndex].value.toLocaleString('id-ID')}</>
                      ) : (
                        <>Rp {liveGoldPrice.toLocaleString('id-ID')}</>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold ml-1.5 font-sans lowercase">{text.goldUnit}</span>
                    </h3>
                  </div>

                  {/* Range selectors */}
                  <div className="flex bg-black/40 border border-white/5 rounded-lg p-1 gap-1">
                    {(['24h', '7d', '30d'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => { setSelectedRange(range); setHoveredIndex(null); }}
                        className={`px-3 py-1 text-[10px] font-black rounded-md uppercase transition cursor-pointer ${
                          selectedRange === range 
                            ? 'bg-yellow-500 text-slate-950 font-black' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Chart Area */}
                <div className="relative w-full h-[180px] select-none">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Background Gradients */}
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.5, 1].map((p, i) => {
                      const y = paddingY + p * (height - paddingY * 2);
                      return (
                        <line 
                          key={i} 
                          x1={paddingX} 
                          y1={y} 
                          x2={width - paddingX} 
                          y2={y} 
                          stroke="rgba(255, 255, 255, 0.03)" 
                          strokeWidth="1" 
                          strokeDasharray="4 4" 
                        />
                      );
                    })}

                    {/* Area fill */}
                    <path d={areaPathString} fill="url(#chartGlow)" />

                    {/* Path line */}
                    <path 
                      d={pathString} 
                      fill="none" 
                      stroke="url(#lineGradient)" 
                      strokeWidth="2.5" 
                      className="text-yellow-500 stroke-current" 
                    />

                    {/* Dynamic line gradient */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>

                    {/* Glowing dots */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r={hoveredIndex === i ? 6 : 3} 
                          className={`${hoveredIndex === i ? 'text-yellow-400 fill-yellow-400' : 'text-amber-500/80 fill-amber-500/80'} transition-all`} 
                        />
                        {hoveredIndex === i && (
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="11" 
                            fill="none" 
                            stroke="#fbbf24" 
                            strokeWidth="1.5" 
                            className="animate-ping opacity-60" 
                          />
                        )}
                      </g>
                    ))}

                    {/* Hidden interactive transparent overlay bars for touch/hover */}
                    {points.map((p, i) => {
                      const barWidth = (width - paddingX * 2) / (currentChartData.length - 1);
                      const startX = p.x - barWidth / 2;
                      return (
                        <rect
                          key={i}
                          x={startX}
                          y={0}
                          width={barWidth}
                          height={height}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredIndex(i)}
                          onTouchStart={() => setHoveredIndex(i)}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center px-[40px] pt-3 text-[9px] font-mono font-bold text-slate-500 uppercase">
                  {chartLabels.map((lbl, i) => (
                    <span key={i}>{lbl}</span>
                  ))}
                </div>

                {/* Prompt info */}
                <p className="text-[8px] sm:text-[9px] text-center text-slate-500 font-semibold tracking-wider uppercase mt-4">
                  💡 {text.goldInteractivePrompt}
                </p>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. STATISTIK PERUSAHAAN */}
      <section id="stats" className="py-24 relative bg-gradient-to-b from-[#04010a] to-[#070313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-1 bg-[#100726]/30 border border-white/5 rounded-3xl p-6">
              <span className="text-[10px] text-yellow-500/60 font-black uppercase tracking-wider block">{text.statsActiveMiners}</span>
              <div className="text-2xl sm:text-3.5xl font-black font-orbitron text-white">
                {memberCount.toLocaleString('id-ID')}+
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'MITRA REGISTERED' : 'REGISTERED MEMBERS'}</p>
            </div>

            <div className="space-y-1 bg-[#100726]/30 border border-white/5 rounded-3xl p-6">
              <span className="text-[10px] text-yellow-500/60 font-black uppercase tracking-wider block">{text.statsTotalAssets}</span>
              <div className="text-2xl sm:text-3.5xl font-black font-orbitron text-gradient-gold">
                Rp 12.8 T
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'CADANGAN TERVERIFIKASI' : 'VERIFIED RESERVES'}</p>
            </div>

            <div className="space-y-1 bg-[#100726]/30 border border-white/5 rounded-3xl p-6">
              <span className="text-[10px] text-yellow-500/60 font-black uppercase tracking-wider block">{text.statsTransactions}</span>
              <div className="text-2xl sm:text-3.5xl font-black font-orbitron text-white">
                Rp 8.4 T+
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'DICAIRKAN HINGGA SEKARANG' : 'DISBURSED SINCE LAUNCH'}</p>
            </div>

            <div className="space-y-1 bg-[#100726]/30 border border-white/5 rounded-3xl p-6">
              <span className="text-[10px] text-yellow-500/60 font-black uppercase tracking-wider block">{text.statsCountries}</span>
              <div className="text-2xl sm:text-3.5xl font-black font-orbitron text-gradient-gold">
                24+
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'WILAYAH OPERASI' : 'ACTIVE REGIONS'}</p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. EVENTS & ANNOUNCEMENTS (BERITA) */}
      <section id="news" className="py-24 relative bg-[#04010a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
              {language === 'id' ? 'KOMUNIKASI MEDIA' : 'MEDIA & COMMUNICATIONS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
              {text.newsTitle}
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {text.newsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* News 1 */}
            <div className="bg-[#100726]/30 border border-white/5 rounded-3xl p-6 hover:border-yellow-500/20 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>20 JULY 2026</span>
                </div>
                <h3 className="text-sm font-black text-white hover:text-yellow-400 transition leading-snug uppercase">
                  {text.news1Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.news1Desc}
                </p>
              </div>
              <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-yellow-500 font-black tracking-widest uppercase self-start">
                FLEET CAPACITY
              </span>
            </div>

            {/* News 2 */}
            <div className="bg-[#100726]/30 border border-white/5 rounded-3xl p-6 hover:border-yellow-500/20 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>15 JULY 2026</span>
                </div>
                <h3 className="text-sm font-black text-white hover:text-yellow-400 transition leading-snug uppercase">
                  {text.news2Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.news2Desc}
                </p>
              </div>
              <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-yellow-500 font-black tracking-widest uppercase self-start">
                COMPLIANCE
              </span>
            </div>

            {/* News 3 */}
            <div className="bg-[#100726]/30 border border-white/5 rounded-3xl p-6 hover:border-yellow-500/20 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>10 JULY 2026</span>
                </div>
                <h3 className="text-sm font-black text-white hover:text-yellow-400 transition leading-snug uppercase">
                  {text.news3Title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                  {text.news3Desc}
                </p>
              </div>
              <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-yellow-500 font-black tracking-widest uppercase self-start">
                MILESTONE
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 9. PARTNERS & CERTIFICATIONS */}
      <section className="py-16 relative bg-[#060312] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center text-xs font-black tracking-widest uppercase text-slate-500 mb-8">
            {language === 'id' ? 'ALIANSI STRATEGIS & KEMITRAAN KOALISI' : 'STRATEGIC ALLIANCES & AUDITED PARTNERS'}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-items-center opacity-65">
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-400">RANDGOLD CO.</div>
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-400">WORLD GOLD COUNCIL</div>
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-400">AFRICA MINING GROUP</div>
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-400">SA MINES HUB</div>
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-400 col-span-2 md:col-span-1">ISO 9001 COMPLIANCE</div>
          </div>

        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section id="faq" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070313] to-[#04010a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block">
              {language === 'id' ? 'RESPON CEPAT KONSULTASI' : 'FAST ADVISORY'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-orbitron tracking-wider text-white">
              {text.faqTitle}
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full" />
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {text.faqSubtitle}
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {[
              { q: text.faqQ1, a: text.faqA1 },
              { q: text.faqQ2, a: text.faqA2 },
              { q: text.faqQ3, a: text.faqA3 },
              { q: text.faqQ4, a: text.faqA4 },
              { q: text.faqQ5, a: text.faqA5 }
            ].map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-[#100726]/30 border border-white/5 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex justify-between items-center text-left text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 hover:text-white cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-yellow-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 border-t border-white/5 pt-3"
                      >
                        <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. CONTACT SECTION */}
      <section id="contact" className="py-24 relative bg-[#04010a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left side Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.25em] block mb-2">
                  {language === 'id' ? 'HUBUNGI TIM DUKUNGAN' : 'INQUIRE NOW'}
                </span>
                <h2 className="text-2xl font-black uppercase font-orbitron tracking-wider text-white">
                  {text.contactTitle}
                </h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                  {text.contactSubtitle}
                </p>
              </div>

              {contactSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6 text-center text-xs sm:text-sm text-emerald-400 font-black">
                  {text.contactSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">{text.contactFormName}</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        className="w-full bg-[#100726]/60 border border-white/5 focus:border-yellow-500/50 outline-none rounded-xl px-4 py-3 text-xs font-medium text-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">{text.contactFormEmail}</label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        className="w-full bg-[#100726]/60 border border-white/5 focus:border-yellow-500/50 outline-none rounded-xl px-4 py-3 text-xs font-medium text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1.5">{text.contactFormMsg}</label>
                    <textarea 
                      rows={5}
                      required
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      className="w-full bg-[#100726]/60 border border-white/5 focus:border-yellow-500/50 outline-none rounded-xl px-4 py-3 text-xs font-medium text-white transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
                  >
                    {text.contactFormSubmit}
                  </button>
                </form>
              )}
            </div>

            {/* Right side Location / Office details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#100726]/30 border border-white/5 rounded-3xl p-6 space-y-5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{text.contactOffice}</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider mb-0.5">Physical Address</span>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {text.contactAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Mail className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider mb-0.5">Corporate Email</span>
                      <p className="text-xs text-slate-300 font-mono">support@grockgoldmining.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider mb-0.5">Corporate Phone</span>
                      <p className="text-xs text-slate-300 font-mono">+27 (11) 555-8900</p>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5 my-1" />

                {/* Social media footer icons */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Connect on Socials</span>
                  <div className="flex gap-2.5">
                    {['TELEGRAM', 'TWITTER', 'INSTAGRAM', 'LINKEDIN'].map(soc => (
                      <span 
                        key={soc}
                        className="text-[9px] bg-white/5 border border-white/10 text-slate-300 font-black px-2.5 py-1 rounded-md hover:text-yellow-500 hover:border-yellow-500/20 transition cursor-pointer"
                      >
                        {soc}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="bg-[#05020e] border-t border-white/5 py-12 text-center sm:text-left text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-sm font-black tracking-widest text-white uppercase mb-1">
                GROCK<span className="text-yellow-500">GOLD</span>
              </div>
              <div className="text-[8px] tracking-wider uppercase font-mono">
                A RANDGOLD RESOURCES COMPANY | PARTNER PORTAL
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
              <span className="hover:text-yellow-500 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-yellow-500 cursor-pointer">Terms & Conditions</span>
              <span className="hover:text-yellow-500 cursor-pointer">Risk Disclosure</span>
              <span className="hover:text-yellow-500 cursor-pointer">Anti-Money Laundering (AML)</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 my-6" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono">
            <span>© 2026 GROCKGOLD MINING CO. ALL RIGHTS RESERVED.</span>
            <span>JOHANNESBURG, REPUBLIC OF SOUTH AFRICA</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
