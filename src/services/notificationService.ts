export const notificationService = {
  getSystemNotifications(language: 'id' | 'en') {
    return [
      {
        id: 1,
        title: language === 'id' ? 'Sistem Cloud Penambangan Stabil' : 'Cloud Mining Fleets Stabilized',
        desc: language === 'id' ? 'Semua unit ekskavator di Randgold West Africa beroperasi dengan efisiensi puncak 98.4%.' : 'All excavator fleets in Randgold West Africa are operating at peak efficiency of 98.4%.',
        time: '14 Jul 2026, 10:24',
        type: 'success'
      },
      {
        id: 2,
        title: language === 'id' ? 'Kemitraan Emas Randgold Resources' : 'Randgold Resources Partnership Active',
        desc: language === 'id' ? 'GrockGold Mining mengesahkan audit sertifikat kepemilikan kuartal ini untuk keandalan penarikan.' : 'GrockGold Mining verified this quarter’s certificate audit to ensure flawless and secure liquidity withdrawals.',
        time: '13 Jul 2026, 08:12',
        type: 'info'
      },
      {
        id: 3,
        title: language === 'id' ? 'Keamanan Enkripsi Lapis Dua Berjalan' : 'Two-Factor Secure Tunnel Enforced',
        desc: language === 'id' ? 'Akses sistem diamankan penuh secara real-time. Hubungi admin untuk keluhan kode OTP.' : 'Terminal access is fully encrypted in real-time. Contact official admins for any access issues.',
        time: '12 Jul 2026, 15:45',
        type: 'info'
      },
      {
        id: 4,
        title: language === 'id' ? 'Program Welcome Bonus Deposit' : 'New Member Welcome Bonus Open',
        desc: language === 'id' ? 'Dapatkan Rp 1.800.000 dengan mengumpulkan 80 mitra aktif di struktur jaringan penambangan Anda.' : 'Claim Rp 1,800,000 by accumulating 80 active depositors with at least 1 Stock Contract in your networks.',
        time: '10 Jul 2026, 09:00',
        type: 'warning'
      }
    ];
  }
};
