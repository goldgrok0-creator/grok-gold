import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCw, AlertCircle, Sparkles, Trophy, X, Coins, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppState, SPIN_ITEMS } from '../AppContext';
import { Transaction } from '../types';
import { supabase } from '../supabase';

// Web Audio & MP3 Sound Synthesizer/Player for Lucky Spin
class SpinAudioFX {
  private spinningAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.spinningAudio = new Audio('/spinning.mp3');
        this.spinningAudio.loop = true;
        this.winAudio = new Audio('/win.mp3');
      } catch (e) {
        console.warn('Audio element initialization warning:', e);
      }
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play spinning audio loop from spinning.mp3 or fallback to synthesized wheel ticking
  playSpinningSound(durationMs = 3600) {
    if (this.spinningAudio) {
      this.spinningAudio.currentTime = 0;
      this.spinningAudio.loop = true;
      const playPromise = this.spinningAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Play Web Audio synthesized spin ticking if mp3 unavailable or blocked
          this.playSpinningWebAudio(durationMs);
        });
      }
    } else {
      this.playSpinningWebAudio(durationMs);
    }
  }

  // Stop spinning audio loop immediately when wheel stops
  stopSpinningSound() {
    if (this.spinningAudio) {
      try {
        this.spinningAudio.pause();
        this.spinningAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // Play win audio from win.mp3 or synthesize celebratory fanfare
  playWinSound() {
    this.stopSpinningSound();
    if (this.winAudio) {
      this.winAudio.currentTime = 0;
      const playPromise = this.winAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.playWinWebAudio();
        });
      }
    } else {
      this.playWinWebAudio();
    }
  }

  // Fallback Web Audio synthesized wheel ticking
  private playSpinningWebAudio(durationMs = 3600) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const durationSec = durationMs / 1000;
    let tickDelay = 0.045;
    let currentTime = startTime;

    while (currentTime < startTime + durationSec) {
      const time = currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.02);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.025);

      const progress = (time - startTime) / durationSec;
      tickDelay = 0.045 + Math.pow(progress, 2.8) * 0.38;
      currentTime += tickDelay;
    }
  }

  // Fallback Web Audio synthesized victory fanfare
  private playWinWebAudio() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 784.00, 1046.50, 1318.51];

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

    setTimeout(() => {
      if (!this.ctx) return;
      const chordNow = this.ctx.currentTime;
      [523.25, 659.25, 784.00, 1046.50].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordNow);

        gain.gain.setValueAtTime(0.2, chordNow);
        gain.gain.exponentialRampToValueAtTime(0.001, chordNow + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(chordNow);
        osc.stop(chordNow + 1.25);
      });
    }, 450);
  }

  // Play neutral Zonk sound
  playZonkSound() {
    this.stopSpinningSound();
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

const audioFX = new SpinAudioFX();

// Canvas Particle Explosion Component for High-Value & Cash Prize Wins
const ParticleCanvas: React.FC<{ active: boolean; amount: number; onClose: () => void }> = ({ active, amount, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;

    const isHighValue = amount >= 2000;
    const particleCount = isHighValue ? 120 : 70;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      gravity: number;
      rotation: number;
      rotSpeed: number;
      type: 'circle' | 'star' | 'emoji' | 'spark';
      emoji?: string;
    }

    const colors = ['#FFD700', '#F59E0B', '#FBBF24', '#34D399', '#A855F7', '#EC4899', '#3B82F6', '#FFFFFF'];
    const emojis = ['💰', '🪙', '✨', '⭐', '💵'];

    const particles: Particle[] = [];

    // Spawn explosion particles
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * (isHighValue ? 16 : 10);
      const typeRand = Math.random();
      const pType: Particle['type'] = typeRand < 0.35 ? 'emoji' : typeRand < 0.65 ? 'star' : typeRand < 0.85 ? 'spark' : 'circle';

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 3),
        size: pType === 'emoji' ? 18 + Math.random() * 12 : 3 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.18 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type: pType,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }

    // Shockwave expansion ring
    let ringRadius = 10;
    let ringAlpha = 1;
    const ringMaxRadius = Math.min(width, height) * (isHighValue ? 0.45 : 0.3);

    let startTime = Date.now();

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.translate(cx, cy);
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw shockwave ring
      if (ringAlpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.lineWidth = isHighValue ? 6 : 3;
        ctx.strokeStyle = `rgba(250, 204, 21, ${ringAlpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#facc15';
        ctx.stroke();
        ctx.restore();

        ringRadius += isHighValue ? 12 : 8;
        ringAlpha -= 0.025;
      }

      // Update & draw particles
      let aliveCount = 0;

      for (let p of particles) {
        if (p.alpha <= 0) continue;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'emoji' && p.emoji) {
          ctx.font = `${p.size}px sans-serif`;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        } else if (p.type === 'star') {
          drawStar(p.x, p.y, 5, p.size, p.size / 2, p.color, p.alpha);
        } else if (p.type === 'spark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.restore();
      }

      const elapsed = Date.now() - startTime;
      if (aliveCount > 0 && elapsed < 3500) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        onClose();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, amount]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none w-full h-full"
    />
  );
};

export interface LuckySpinPageProps {
  calculateCountdown?: (
    nextResetAt: number | null | undefined,
    serverTimeOffset?: number,
    spinsRemaining?: number
  ) => {
    formatted: string;
    remainingSeconds: number;
    hours: string;
    minutes: string;
    seconds: string;
    isLocked: boolean;
  };
}

export const LuckySpinPage: React.FC<LuckySpinPageProps> = ({ calculateCountdown }) => {
  const { language, setCurrentTab, triggerModal, updateState, setBoostTimeLeft, state, currentAccount } = useAppState();

  const [spinRotation, setSpinRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  
  const [todaySpins, setTodaySpins] = useState(0);
  const [maxDailySpins, setMaxDailySpins] = useState(3);
  const [nextResetAt, setNextResetAt] = useState<number | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(86400);

  const [luckySpinHistory, setLuckySpinHistory] = useState<any[]>([]);
  const [winModalData, setWinModalData] = useState<{ amount: number; label: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particleExplosionActive, setParticleExplosionActive] = useState(false);
  const [particleExplosionAmount, setParticleExplosionAmount] = useState(0);

  const activeUsername = state.username || currentAccount?.username || localStorage.getItem('grockgold_logged_in_username_v4') || '';

  const freeSpinBal = state.freeSpinBalance ?? 1000000;
  const bonusSpinBal = state.bonusSpinBalance ?? 0;
  const spinsRemainingToday = Math.max(0, maxDailySpins - todaySpins);
  const canSpin = !isSpinning && !isLoadingInfo && freeSpinBal > 0 && spinsRemainingToday > 0;

  const formatCountdown = (totalSec: number) => {
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Fetch real-time info from database on mount & when username changes
  const fetchSpinInfo = async (retryCount = 0) => {
    if (!activeUsername) {
      setIsLoadingInfo(false);
      return;
    }
    setIsLoadingInfo(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        const sessionEmail = session.user?.email?.toLowerCase();
        const activeEmail = currentAccount?.email?.toLowerCase();
        if (!activeEmail || !sessionEmail || sessionEmail === activeEmail) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const res = await fetch(`/api/lucky-spin/info?username=${encodeURIComponent(activeUsername)}`, { headers });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setTodaySpins(data.todaySpins || 0);
        setMaxDailySpins(data.maxDailySpins || 3);

        if (data.nextResetAt && (data.todaySpins || 0) >= (data.maxDailySpins || 3)) {
          setNextResetAt(data.nextResetAt);
          const offset = (data.serverTime || Date.now()) - Date.now();
          setServerTimeOffset(offset);
          const currentServerNow = Date.now() + offset;
          const initialRemaining = Math.max(0, Math.floor((data.nextResetAt - currentServerNow) / 1000));
          setRemainingSeconds(initialRemaining);
        } else {
          setNextResetAt(0);
          setRemainingSeconds(86400);
        }

        if (Array.isArray(data.history)) {
          setLuckySpinHistory(data.history);
        }
        updateState(prev => ({
          ...prev,
          username: prev.username || activeUsername,
          isLoggedIn: true,
          freeSpinBalance: data.freeSpinBalance !== undefined ? data.freeSpinBalance : prev.freeSpinBalance,
          bonusSpinBalance: data.bonusSpinBalance !== undefined ? data.bonusSpinBalance : prev.bonusSpinBalance,
          mainBalance: data.mainBalance !== undefined ? data.mainBalance : prev.mainBalance
        }));
      }
    } catch (err: any) {
      if (retryCount < 1) {
        // Retry once after 1 second if network briefly dropped or server reconnected
        setTimeout(() => {
          fetchSpinInfo(retryCount + 1);
        }, 1000);
      } else {
        console.warn("Informasi Lucky Spin tidak dapat diambil saat ini (koneksi terputus/server sibuk). Menggunakan data lokal.");
      }
    } finally {
      setIsLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchSpinInfo();

    const handleFocus = () => {
      fetchSpinInfo();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeUsername]);

  // Ticker for smooth 24-hour countdown (only runs when all tickets are used up)
  useEffect(() => {
    if (!nextResetAt || todaySpins < maxDailySpins) {
      setRemainingSeconds(86400);
      return;
    }

    const updateTimer = () => {
      const currentServerNow = Date.now() + serverTimeOffset;
      const diffSec = Math.max(0, Math.floor((nextResetAt - currentServerNow) / 1000));
      setRemainingSeconds(diffSec);

      // When countdown hits 00:00:00, refetch info to trigger server-side 24h reset & refresh quota
      if (diffSec <= 0) {
        fetchSpinInfo();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextResetAt, serverTimeOffset, todaySpins, maxDailySpins]);

  const activeCountdownFormatted = () => {
    if (calculateCountdown) {
      return calculateCountdown(nextResetAt, serverTimeOffset, spinsRemainingToday).formatted;
    }
    return spinsRemainingToday > 0 ? '24:00:00' : formatCountdown(remainingSeconds);
  };

  const handleStartSpin = async () => {
    if (isSpinning) return;
    if (!activeUsername) {
      triggerModal(
        language === 'id'
          ? '❌ SILAKAN LOGIN\n\nSesi Anda tidak ditemukan. Silakan login terlebih dahulu untuk mengakses Lucky Spin.'
          : '❌ PLEASE LOGIN\n\nSession not found. Please log in first to access Lucky Spin.',
        'warning'
      );
      return;
    }

    if (spinsRemainingToday <= 0) {
      triggerModal(
        language === 'id'
          ? `❌ LIMIT SPIN HARIAN TERCAPAI\n\nAnda telah mencapai limit maksimal ${maxDailySpins} kali spin per periode 24 jam.\n\nOtomatis reset dalam ${formatCountdown(remainingSeconds)}.`
          : `❌ DAILY SPIN LIMIT REACHED\n\nYou have reached the maximum limit of ${maxDailySpins} spins per 24-hour period.\n\nAuto resets in ${formatCountdown(remainingSeconds)}.`,
        'warning'
      );
      return;
    }

    if (freeSpinBal <= 0) {
      triggerModal(
        language === 'id'
          ? `❌ SALDO FREE SPIN HABIS\n\nSaldo Free Spin Anda saat ini Rp 0.\n\nUndang member baru untuk menambahkan Saldo Free Spin Rp 50.000 per referral!`
          : `❌ OUT OF FREE SPIN BALANCE\n\nYour Free Spin balance is currently Rp 0.\nInvite new members to gain +Rp 50,000 Free Spin balance per referral!`,
        'warning'
      );
      return;
    }

    // Disable button immediately to prevent double click
    setIsSpinning(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        const sessionEmail = session.user?.email?.toLowerCase();
        const activeEmail = currentAccount?.email?.toLowerCase();
        if (!activeEmail || !sessionEmail || sessionEmail === activeEmail) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      // Execute backend atomic transaction spin request
      const response = await fetch('/api/lucky-spin/spin', {
        method: 'POST',
        headers,
        body: JSON.stringify({ username: activeUsername })
      });

      const data = await response.json();

      if (data.todaySpins !== undefined) {
        setTodaySpins(data.todaySpins);
      }
      if (data.nextResetAt) {
        setNextResetAt(data.nextResetAt);
        const offset = (data.serverTime || Date.now()) - Date.now();
        setServerTimeOffset(offset);
        const currentServerNow = Date.now() + offset;
        setRemainingSeconds(Math.max(0, Math.floor((data.nextResetAt - currentServerNow) / 1000)));
      }

      if (!data.success) {
        setIsSpinning(false);
        triggerModal(
          language === 'id' ? `❌ GAGAL SPIN\n\n${data.error || 'Terjadi kesalahan sistem.'}` : `❌ SPIN FAILED\n\n${data.error || 'System error.'}`,
          'danger'
        );
        return;
      }

      // Calculate smooth target rotation angle targeting prizeIndex from server
      const targetPrizeIndex = data.prizeIndex !== undefined ? data.prizeIndex : 1;
      const degreePerSegment = 360 / SPIN_ITEMS.length;
      const extraSpins = 6;
      const targetSegmentCenter = (targetPrizeIndex * degreePerSegment) + (degreePerSegment / 2);
      const targetAngle = (360 - targetSegmentCenter) % 360;
      const targetRotation = spinRotation + (extraSpins * 360) + targetAngle - (spinRotation % 360);

      setSpinRotation(targetRotation);

      // Play audio spinning sound if sound enabled
      if (soundEnabled) {
        audioFX.playSpinningSound(3600);
      }

      // On animation complete (3.6s)
      setTimeout(() => {
        setIsSpinning(false);
        
        const prize = data.prize;
        const wonAmount = prize?.type === 'cash' ? prize.value : 0;
        setTodaySpins(data.todaySpins || (todaySpins + 1));
        if (Array.isArray(data.spinHistory)) {
          setLuckySpinHistory(data.spinHistory);
        }

        // Update real-time balance from backend result
        updateState(prev => ({
          ...prev,
          freeSpinBalance: data.newFreeSpinBalance,
          bonusSpinBalance: data.newBonusSpinBalance !== undefined ? data.newBonusSpinBalance : ((prev.bonusSpinBalance ?? 0) + wonAmount),
          mainBalance: data.newMainBalance,
          totalEarned: prev.totalEarned + wonAmount
        }), true);

        if (wonAmount > 0) {
          if (soundEnabled) {
            audioFX.playWinSound();
          }

          // Trigger Canvas Particle Explosion Overlay
          setParticleExplosionAmount(wonAmount);
          setParticleExplosionActive(true);

          // Fire vibrant multi-burst confetti animation
          try {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.55 },
              colors: ['#FFD700', '#FFA500', '#22C55E', '#A855F7', '#EC4899', '#3B82F6']
            });
            setTimeout(() => {
              confetti({
                particleCount: 80,
                angle: 60,
                spread: 70,
                origin: { x: 0.1, y: 0.65 },
                colors: ['#FFD700', '#22C55E', '#EAB308']
              });
              confetti({
                particleCount: 80,
                angle: 120,
                spread: 70,
                origin: { x: 0.9, y: 0.65 },
                colors: ['#FFD700', '#22C55E', '#EAB308']
              });
            }, 220);
          } catch (e) {
            console.warn("Confetti error:", e);
          }

          setWinModalData({
            amount: wonAmount,
            label: prize?.label || `Rp ${wonAmount.toLocaleString('id-ID')}`
          });
        } else {
          if (soundEnabled) {
            audioFX.playZonkSound();
          }

          triggerModal(
            language === 'id'
              ? `😢 ${prize?.label || 'COBA LAGI'}\n\nPutaran Anda mendarat di ${prize?.label || 'Zonk'}.\nSaldo Free Spin Anda TIDAK berkurang (Rp 0). Silakan coba lagi!`
              : `😢 ${prize?.label || 'TRY AGAIN'}\n\nYour spin landed on ${prize?.label || 'Zonk'}.\nNo Free Spin balance was deducted (Rp 0). Try again!`,
            'info'
          );
        }
      }, 3600);

    } catch (err: any) {
      console.error("Spin error:", err);
      setIsSpinning(false);
      triggerModal(
        language === 'id' ? '❌ Gagal terhubung ke server untuk memproses spin.' : '❌ Failed to connect to server for spin processing.',
        'danger'
      );
    }
  };

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition" onClick={() => setCurrentTab('home')} />
          <h2 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent font-orbitron">
            {language === 'id' ? 'RODA BERHADIAH' : 'LUCKY SPIN WHEEL'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${soundEnabled ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-purple-950/60 border-purple-500/20 text-slate-500'}`}
            title={soundEnabled ? (language === 'id' ? "Matikan Suara" : "Mute Sound") : (language === 'id' ? "Aktifkan Suara" : "Enable Sound")}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            onClick={fetchSpinInfo}
            disabled={isLoadingInfo}
            className="p-1.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-300 hover:text-white transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInfo ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* NOT LOGGED IN WARNING BANNER */}
      {!activeUsername && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{language === 'id' ? 'Sesi login tidak ditemukan. Silakan login terlebih dahulu untuk memutar Lucky Spin.' : 'Login session not found. Please log in first to spin.'}</span>
          </div>
          <button
            onClick={() => setCurrentTab('profile')}
            className="px-3 py-1 bg-amber-500 text-black font-bold text-[10px] rounded-xl hover:bg-amber-400 transition cursor-pointer shrink-0 ml-2"
          >
            {language === 'id' ? 'LOGIN' : 'LOGIN'}
          </button>
        </div>
      )}

      {/* SALDO FREE SPIN & REWARD SPIN DUAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CARD 1: SALDO FREE SPIN (MODAL BERMAIN) */}
        <div className="bg-gradient-to-r from-[#190638] via-[#0b021a] to-[#190638] border-2 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.35)] rounded-3xl p-3.5 flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 border border-purple-400 flex items-center justify-center text-lg shadow-md shrink-0">
              🎯
            </div>
            <div>
              <span className="text-[8.5px] font-black tracking-widest text-purple-300 block uppercase font-orbitron">
                {language === 'id' ? 'SALDO FREE SPIN' : 'FREE SPIN BALANCE'}
              </span>
              <div className="text-lg font-black text-amber-400 font-orbitron leading-none mt-0.5">
                Rp {(state.freeSpinBalance ?? 1000000).toLocaleString('id-ID')}
              </div>
              <span className="text-[8px] text-slate-400 font-medium block mt-0.5">
                {language === 'id' ? 'Dipotong sesuai hasil menang (Rp 0 jika Zonk)' : 'Deducted by win amount (Rp 0 if Zonk)'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: SALDO REWARD SPIN (HADIAH PERMAINAN) */}
        <div className="bg-gradient-to-r from-[#21093b] via-[#0f041d] to-[#21093b] border-2 border-fuchsia-500/80 shadow-[0_0_20px_rgba(217,70,239,0.35)] rounded-3xl p-3.5 flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-800 border border-fuchsia-400 flex items-center justify-center text-lg shadow-md shrink-0">
              🎁
            </div>
            <div>
              <span className="text-[8.5px] font-black tracking-widest text-fuchsia-300 block uppercase font-orbitron">
                {language === 'id' ? 'REWARD SPIN (WALLET)' : 'REWARD SPIN (WALLET)'}
              </span>
              <div className="text-lg font-black text-fuchsia-300 font-orbitron leading-none mt-0.5">
                Rp {(state.bonusSpinBalance ?? 0).toLocaleString('id-ID')}
              </div>
              <span className="text-[8px] text-slate-400 font-medium block mt-0.5">
                {language === 'id' ? 'Total akumulasi hadiah kemenangan Lucky Spin' : 'Total accumulated spin prizes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Spin Daily Limit Counter */}
      <div className="bg-gradient-to-br from-[#1b082e] to-[#0a0314] border border-fuchsia-500/20 rounded-3xl p-4 shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[8.5px] font-black tracking-widest text-fuchsia-400 block uppercase mb-1">{language === 'id' ? 'LIMIT SPIN HARIAN' : 'DAILY SPIN LIMIT'}</span>
          <div className="text-lg font-black text-white font-orbitron flex items-center gap-1.5 leading-none">
            🎟️ <span className="text-amber-400">{language === 'id' ? 'Spin Sisa:' : 'Spins Left:'} {spinsRemainingToday}/{maxDailySpins}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium block mt-1">
            {language === 'id' ? `Telah digunakan ${todaySpins} dari ${maxDailySpins} spin periode ini` : `Used ${todaySpins} of ${maxDailySpins} spins in this period`}
          </span>
        </div>
        <div className="bg-black/60 border border-amber-500/30 rounded-2xl px-3.5 py-2 text-right shadow-inner">
          <span className="text-[7.5px] text-slate-400 font-bold block uppercase mb-0.5">{language === 'id' ? 'RESET 24 JAM' : '24H RESET'}</span>
          <span className="text-[13px] font-mono font-black text-amber-400 tracking-wider font-orbitron">
            {activeCountdownFormatted()}
          </span>
        </div>
      </div>

      {/* Physical Rotating Wheel Canvas Area */}
      <div className="bg-[#0b0519] border border-purple-500/10 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Glowing outer ring */}
        <div className="relative w-56 h-56 rounded-full border-4 border-yellow-500 bg-[#120735] shadow-[0_0_25px_rgba(234,179,8,0.45)] flex items-center justify-center overflow-hidden mb-5 z-10"
          style={{ 
            transform: `rotate(${spinRotation}deg)`,
            transition: isSpinning ? 'transform 3.6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
          }}
        >
          {/* Outer Ring Circle details */}
          <div className="absolute inset-0 border-8 border-purple-900/40 pointer-events-none z-20" />
          
          {/* segments */}
          {SPIN_ITEMS.map((item, idx) => {
            const angle = idx * 45;
            return (
              <div 
                key={idx}
                className="absolute inset-0 origin-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                {/* Line separator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 bg-yellow-500/25 origin-bottom z-10" />
                
                {/* Segment text label */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-center"
                  style={{ 
                    transform: 'rotate(22.5deg)',
                    color: item.type === 'zonk' ? '#94a3b8' : '#facc15'
                  }}
                >
                  <div>{item.label}</div>
                  <div className="text-[6px] opacity-40 leading-none mt-0.5">{item.type === 'zonk' ? '❌' : '💰'}</div>
                </div>
              </div>
            );
          })}

          {/* Golden Spinner Center Pin Hub */}
          <div className="absolute w-12 h-12 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-full border-2 border-white/90 z-30 shadow-2xl flex items-center justify-center font-black text-black text-[9px] tracking-wide uppercase leading-none">
            GGM
          </div>
        </div>

        {/* Wheel pointer at the top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

        {/* SPIN TRIGGER AREA & REMAINING COUNTER BADGE */}
        <div className="w-full max-w-[240px] flex flex-col items-center gap-2 z-10">
          <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-orbitron text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <span>🎟️</span>
            <span>{language === 'id' ? `Spin Sisa: ${spinsRemainingToday}/${maxDailySpins}` : `Spins Left: ${spinsRemainingToday}/${maxDailySpins}`}</span>
          </div>

          <button
            onClick={handleStartSpin}
            disabled={isSpinning}
            className={`w-full py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer ${isSpinning ? 'bg-purple-950 border border-white/5 text-amber-400 animate-pulse cursor-not-allowed' : (!canSpin ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30' : 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black hover:brightness-110 active:scale-95 shadow-yellow-500/20')}`}
          >
            {isSpinning ? (language === 'id' ? 'MEMUTAR RODA...' : 'SPINNING...') : !activeUsername ? (language === 'id' ? 'SILAKAN LOGIN TERLEBIH DAHULU' : 'PLEASE LOGIN FIRST') : spinsRemainingToday <= 0 ? (language === 'id' ? 'LIMIT HARIAN HABIS (3/3)' : 'DAILY LIMIT REACHED') : freeSpinBal <= 0 ? (language === 'id' ? 'SALDO FREE SPIN HABIS' : 'OUT OF BALANCE') : (language === 'id' ? 'PUTAR SEKARANG' : 'SPIN NOW')}
          </button>
        </div>
      </div>

      {/* Available Prizes Odds list */}
      <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'id' ? 'Daftar Hadiah Tersedia' : 'Available Prizes'}</div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{language === 'id' ? 'Rp 5.000 Tunai' : 'Rp 5,000 Cash'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{language === 'id' ? 'Rp 2.000 Tunai' : 'Rp 2,000 Cash'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
            <span>{language === 'id' ? 'Rp 1.000 Tunai' : 'Rp 1,000 Cash'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 bg-white/[0.01] p-2 rounded-xl border border-white/5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{language === 'id' ? 'Rp 500 Tunai' : 'Rp 500 Cash'}</span>
          </div>
        </div>
      </div>

      {/* Spin Result History */}
      <div className="bg-[#0b0519] border border-white/5 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{language === 'id' ? 'Riwayat Putaran Anda' : 'Your Spin History'}</div>
        
        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
          {luckySpinHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-semibold">
              {language === 'id' ? 'Belum ada riwayat putaran' : 'No spin history yet'}
            </div>
          ) : (
            luckySpinHistory.map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🎟️</span>
                  <span className="text-[10px] font-black text-white">{language === 'id' ? 'Putaran Lucky Spin' : 'Lucky Spin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${item.type === 'cash' ? 'text-emerald-400' : item.type === 'boost' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {item.prize}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {item.date ? new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GLOWING CASH WIN POPUP MODAL */}
      <AnimatePresence>
        {winModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setWinModalData(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e0a38] via-[#0f041d] to-[#17062e] border-2 border-yellow-400/80 shadow-[0_0_50px_rgba(234,179,8,0.5)] p-6 text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background ambient radial glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-10 right-0 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={() => setWinModalData(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Glowing Icon Trophy/Coins */}
              <div className="relative mx-auto mb-4 w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-bounce">
                <Trophy className="w-10 h-10 text-black drop-shadow-md" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-200 animate-spin" />
              </div>

              {/* Title & Amount */}
              <div className="space-y-1 mb-5">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block font-orbitron">
                  {language === 'id' ? '🎉 SELAMAT! HADIAH TUNAI 🎉' : '🎉 CONGRATULATIONS! CASH PRIZE 🎉'}
                </span>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 font-orbitron drop-shadow-lg">
                  Rp {winModalData.amount.toLocaleString('id-ID')}
                </h3>
                <p className="text-xs text-purple-200/80 font-medium pt-1">
                  {language === 'id' ? 'Hasil kemenangan Lucky Spin Wheel' : 'Lucky Spin Wheel winning outcome'}
                </p>
              </div>

              {/* Balance impact details */}
              <div className="bg-black/50 border border-yellow-500/30 rounded-2xl p-3.5 space-y-2 mb-6 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {language === 'id' ? 'Saldo Free Spin Dipotong:' : 'Free Spin Balance Deducted:'}
                  </span>
                  <span className="font-mono font-bold text-rose-300">
                    -Rp {winModalData.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {language === 'id' ? 'Reward Spin (Wallet) Bertambah:' : 'Reward Spin (Wallet) Added:'}
                  </span>
                  <span className="font-mono font-black text-emerald-400">
                    +Rp {winModalData.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Claim Action Button */}
              <button
                onClick={() => {
                  setParticleExplosionAmount(winModalData.amount);
                  setParticleExplosionActive(true);
                  try {
                    confetti({
                      particleCount: 80,
                      spread: 80,
                      origin: { y: 0.6 }
                    });
                  } catch (e) {}
                  setWinModalData(null);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 font-orbitron"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                {language === 'id' ? 'KLAIM HADIAH SEKARANG' : 'CLAIM PRIZE NOW'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANVAS PARTICLE EXPLOSION OVERLAY FOR CASH PRIZE WINS */}
      <ParticleCanvas
        active={particleExplosionActive}
        amount={particleExplosionAmount}
        onClose={() => setParticleExplosionActive(false)}
      />
    </div>
  );
};
export default LuckySpinPage;

