import React, { useEffect, useRef, useState } from 'react';
import { MiningItem, Upgrade, GameStats } from '../types';
import { ProceduralAudio } from './ProceduralAudio';
import { Zap, ShieldAlert, Award, Compass, RotateCcw, AlertTriangle, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface GrokMinerGameProps {
  stats: GameStats;
  upgrades: Upgrade[];
  onAddGold: (amount: number) => void;
  onLevelComplete: () => void;
  onLevelFailed: () => void;
  onRestartGame: () => void;
}

export default function GrokMinerGame({
  stats,
  upgrades,
  onAddGold,
  onLevelComplete,
  onLevelFailed,
  onRestartGame
}: GrokMinerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [dynamiteCount, setDynamiteCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lastNotification, setLastNotification] = useState<string>('System Calibrated. Ready to mine Grok Gold!');

  // Game references for loop (to avoid closure stale state in requestAnimationFrame)
  const gameStateRef = useRef({
    score: stats.gold,
    targetScore: stats.targetGold,
    level: stats.level,
    timeLeft: 60,
    isMuted: false,
    
    // Physics variables
    minerX: 400,
    minerY: 45,
    clawAngle: 0,
    clawAngleSpeed: 0.025,
    clawAngleDirection: 1, // 1 for right, -1 for left
    clawLength: 30,
    clawState: 'swing' as 'swing' | 'shoot' | 'reel' | 'rewind',
    clawSpeed: 7, // shoot speed
    baseReelSpeed: 3, // reel in speed
    
    // Upgrades modifiers
    reelMultiplier: 1,
    shootMultiplier: 1,
    hasLaser: false,
    hasOracle: false,
    
    // Level items
    items: [] as MiningItem[],
    caughtItem: null as MiningItem | null,
    
    // Starfield background
    stars: [] as { x: number; y: number; size: number; alpha: number; speed: number }[],
    
    // Explosion visual
    explosion: null as { x: number; y: number; radius: number; maxRadius: number } | null,
  });

  // Calculate stats modifiers based on upgrades
  useEffect(() => {
    const engineUpgrade = upgrades.find(u => u.id === 'engine');
    const tetherUpgrade = upgrades.find(u => u.id === 'tether');
    const laserUpgrade = upgrades.find(u => u.id === 'laser');
    const oracleUpgrade = upgrades.find(u => u.id === 'oracle');
    const recycleUpgrade = upgrades.find(u => u.id === 'recycle');

    gameStateRef.current.reelMultiplier = 1 + (engineUpgrade ? engineUpgrade.level * 0.25 : 0);
    gameStateRef.current.shootMultiplier = 1 + (tetherUpgrade ? tetherUpgrade.level * 0.25 : 0);
    gameStateRef.current.hasLaser = (laserUpgrade ? laserUpgrade.level > 0 : false);
    gameStateRef.current.hasOracle = (oracleUpgrade ? oracleUpgrade.level > 0 : false);
    
    // Reset dynamite based on fusion recycler level
    if (recycleUpgrade) {
      setDynamiteCount(1 + recycleUpgrade.level);
    }
  }, [upgrades]);

  // Handle Mute
  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    ProceduralAudio.setMuted(newMute);
    gameStateRef.current.isMuted = newMute;
  };

  // Setup items for the current level
  const initLevel = () => {
    const width = 800;
    const height = 500;
    const level = stats.level;
    const newItems: MiningItem[] = [];

    // Background Stars
    const newStars = [];
    for (let i = 0; i < 40; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        alpha: Math.random(),
        speed: 0.01 + Math.random() * 0.02
      });
    }
    gameStateRef.current.stars = newStars;

    // Spawn layout algorithm to prevent overlaps
    const checkOverlap = (x: number, y: number, r: number) => {
      for (const item of newItems) {
        const dist = Math.hypot(item.x - x, item.y - y);
        if (dist < item.radius + r + 15) return true;
      }
      return false;
    };

    // Item generation config
    const spawnItem = (type: MiningItem['type'], r: number, val: number, wt: number, col: string, lbl: string) => {
      let attempts = 0;
      while (attempts < 50) {
        const x = 50 + Math.random() * (width - 100);
        // Start items below the ship console (y > 110)
        const y = 140 + Math.random() * (height - 180);
        
        if (!checkOverlap(x, y, r)) {
          newItems.push({
            id: Math.random().toString(),
            type,
            x,
            y,
            radius: r,
            value: val,
            weight: wt,
            color: col,
            label: lbl,
            pulse: type === 'core_node'
          });
          break;
        }
        attempts++;
      }
    };

    // Number of items scales with level difficulty
    const goldCount = 6 + level;
    const stoneCount = 4 + Math.min(level, 4);
    const nodeCount = 1 + Math.min(Math.floor(level / 2), 3);
    const mysteryCount = 1 + Math.min(Math.floor(level / 3), 2);

    // Spawn Grok Gold Nodes (Big, Medium, Small)
    for (let i = 0; i < goldCount; i++) {
      const roll = Math.random();
      if (roll < 0.2) {
        // Large Nugget
        spawnItem('gold_large', 30, 500, 15, '#F59E0B', 'XL Grok Gold');
      } else if (roll < 0.6) {
        // Medium Nugget
        spawnItem('gold_medium', 20, 250, 8, '#FBBF24', 'Grok Gold');
      } else {
        // Small Nugget
        spawnItem('gold_small', 12, 100, 4, '#FDE047', 'Small Nugget');
      }
    }

    // Spawn AI Core Nodes (High-value, pulsing, light)
    for (let i = 0; i < nodeCount; i++) {
      spawnItem('core_node', 18, 600, 3, '#06B6D4', 'AI Core Node');
    }

    // Spawn Cyber Space Trash / Scrap
    const scrapCount = 2 + Math.min(level, 3);
    for (let i = 0; i < scrapCount; i++) {
      spawnItem('cyber_scrap', 15, 120, 5, '#94A3B8', 'Cyber Scrap');
    }

    // Spawn Heavy Cosmic Stones
    for (let i = 0; i < stoneCount; i++) {
      const roll = Math.random();
      if (roll < 0.3) {
        spawnItem('stone_large', 28, 20, 25, '#4B5563', 'Cosmic Boulder');
      } else {
        spawnItem('stone_small', 15, 10, 12, '#6B7280', 'Cosmic Stone');
      }
    }

    // Spawn Mystery Decoders / Bags
    for (let i = 0; i < mysteryCount; i++) {
      spawnItem('mystery_bag', 16, 150, 5, '#8B5CF6', 'Mystery Bag');
    }

    gameStateRef.current.items = newItems;
    gameStateRef.current.clawLength = 30;
    gameStateRef.current.clawState = 'swing';
    gameStateRef.current.caughtItem = null;
    gameStateRef.current.score = stats.gold;
    gameStateRef.current.targetScore = stats.targetGold;
    gameStateRef.current.level = stats.level;
    gameStateRef.current.timeLeft = 60;
    
    setTimeLeft(60);
    setIsPlaying(true);
    setLastNotification(`Calibrating warp coordinates for Level ${stats.level}... Mine ${stats.targetGold} G-USD!`);
  };

  // Start Level
  useEffect(() => {
    initLevel();
  }, [stats.level]);

  // Countdown timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        gameStateRef.current.timeLeft = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle level completion/failure when time runs out
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      
      // Check win condition
      if (gameStateRef.current.score >= gameStateRef.current.targetScore) {
        ProceduralAudio.playLevelComplete();
        onLevelComplete();
      } else {
        ProceduralAudio.playLevelFailed();
        onLevelFailed();
      }
    }
  }, [timeLeft, isPlaying, onLevelComplete, onLevelFailed]);

  // Hook Fire action
  const fireClaw = () => {
    if (!isPlaying) return;
    if (gameStateRef.current.clawState === 'swing') {
      gameStateRef.current.clawState = 'shoot';
      ProceduralAudio.playLaser();
    }
  };

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        fireClaw();
      } else if (e.code === 'KeyD' || e.code === 'KeyE') {
        // Use Dynamite
        e.preventDefault();
        triggerDynamite();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, dynamiteCount]);

  // Dynamite detonator
  const triggerDynamite = () => {
    if (!isPlaying) return;
    const ref = gameStateRef.current;
    if (ref.clawState === 'reel' && ref.caughtItem && dynamiteCount > 0) {
      // Trigger Explosion!
      ProceduralAudio.playExplosion();
      setDynamiteCount(prev => prev - 1);
      
      ref.explosion = {
        x: ref.caughtItem.x,
        y: ref.caughtItem.y,
        radius: 10,
        maxRadius: 60
      };
      
      setLastNotification(`DETONATED Fusion Recycler! Blew up heavy ${ref.caughtItem.label}!`);
      
      ref.caughtItem = null;
      ref.clawState = 'rewind';
    }
  };

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const ref = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. UPDATE physics
      
      // Update star animation
      ref.stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
      });

      // Update explosion animation
      if (ref.explosion) {
        ref.explosion.radius += 3;
        if (ref.explosion.radius >= ref.explosion.maxRadius) {
          ref.explosion = null;
        }
      }

      // Claw state machine
      if (ref.clawState === 'swing') {
        // Swing the claw pendulum
        ref.clawAngle += ref.clawAngleSpeed * ref.clawAngleDirection;
        // Turn around at swing limits
        if (ref.clawAngle > Math.PI / 2.3) {
          ref.clawAngle = Math.PI / 2.3;
          ref.clawAngleDirection = -1;
        } else if (ref.clawAngle < -Math.PI / 2.3) {
          ref.clawAngle = -Math.PI / 2.3;
          ref.clawAngleDirection = 1;
        }
      } else if (ref.clawState === 'shoot') {
        // Extend the claw outward
        ref.clawLength += ref.clawSpeed * ref.shootMultiplier;
        
        // Compute claw tip coordinate
        const tipX = ref.minerX + Math.sin(ref.clawAngle) * ref.clawLength;
        const tipY = ref.minerY + Math.cos(ref.clawAngle) * ref.clawLength;

        // Check if out of bounds (rewind)
        if (tipX < 0 || tipX > width || tipY > height) {
          ref.clawState = 'rewind';
        }

        // Check collision with items
        for (let i = 0; i < ref.items.length; i++) {
          const item = ref.items[i];
          const dist = Math.hypot(item.x - tipX, item.y - tipY);
          if (dist < item.radius + 10) {
            // caught it!
            ref.caughtItem = item;
            ref.items.splice(i, 1);
            ref.clawState = 'reel';
            break;
          }
        }
      } else if (ref.clawState === 'reel') {
        // Pull claw back with the item
        if (ref.caughtItem) {
          // Reel speed is inversely proportional to item weight, boosted by engine upgrades
          const effectiveWeight = Math.max(1, ref.caughtItem.weight);
          const currentReelSpeed = (ref.baseReelSpeed / (effectiveWeight / 4)) * ref.reelMultiplier;
          ref.clawLength -= currentReelSpeed;
          
          // Move caught item along with the tip
          ref.caughtItem.x = ref.minerX + Math.sin(ref.clawAngle) * ref.clawLength;
          ref.caughtItem.y = ref.minerY + Math.cos(ref.clawAngle) * ref.clawLength;

          // Sound effect click
          if (Math.floor(ref.clawLength) % 15 === 0) {
            ProceduralAudio.playReel(ref.caughtItem.weight);
          }

          // Check if item reached the miner console
          if (ref.clawLength <= 30) {
            // Item collected!
            let itemVal = ref.caughtItem.value;
            
            // Apply Oracle boost if owned
            if (ref.hasOracle) {
              itemVal = Math.floor(itemVal * 1.25);
            }

            // Handle Mystery Bag random outcomes
            if (ref.caughtItem.type === 'mystery_bag') {
              const roll = Math.random();
              if (roll < 0.25) {
                // Instantly double value
                itemVal = 500;
                setLastNotification(`🍀 DECODED: Deep Mining Bonus (+500 G-USD)!`);
              } else if (roll < 0.50) {
                // Free dynamite charge
                setDynamiteCount(prev => prev + 1);
                setLastNotification(`🍀 DECODED: Acquired 1x Extra Fusion Recycler!`);
              } else if (roll < 0.75) {
                // Reel Speed Burst for this round
                ref.reelMultiplier += 0.5;
                setLastNotification(`🍀 DECODED: Speed Overdrive online (+50% reel speed)!`);
              } else {
                // Simple standard high gold reward
                itemVal = 300;
                setLastNotification(`🍀 DECODED: Recovered Space Treasures (+300 G-USD)!`);
              }
            } else {
              setLastNotification(`🚀 EXTRACTED: ${ref.caughtItem.label} (+${itemVal} G-USD)!`);
            }

            // Trigger score updates
            onAddGold(itemVal);
            ref.score += itemVal;
            ProceduralAudio.playScore();

            ref.caughtItem = null;
            ref.clawLength = 30;
            ref.clawState = 'swing';
          }
        } else {
          // Fallback if item is gone
          ref.clawState = 'rewind';
        }
      } else if (ref.clawState === 'rewind') {
        // Fast reel back empty
        ref.clawLength -= 12 * ref.reelMultiplier;
        if (ref.clawLength <= 30) {
          ref.clawLength = 30;
          ref.clawState = 'swing';
        }
      }

      // 2. DRAW elements on Canvas
      ctx.clearRect(0, 0, width, height);

      // Starfield background
      ref.stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid backdrop lines (Subtle)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw mining bounds threshold line (under the mining console)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, 95);
      ctx.lineTo(width, 95);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Laser Sight Dotted Line (from upgrade)
      if (ref.clawState === 'swing' && ref.hasLaser) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.moveTo(ref.minerX, ref.minerY);
        ctx.lineTo(
          ref.minerX + Math.sin(ref.clawAngle) * 450,
          ref.minerY + Math.cos(ref.clawAngle) * 450
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw items
      ref.items.forEach(item => {
        ctx.save();
        
        // Glow effect
        ctx.shadowBlur = item.pulse ? 10 + Math.sin(Date.now() / 150) * 4 : 4;
        ctx.shadowColor = item.color;

        if (item.type.startsWith('gold')) {
          // Drawing irregular bumpy gold nuggets
          ctx.fillStyle = item.color;
          ctx.beginPath();
          const points = item.type === 'gold_large' ? 10 : 7;
          for (let p = 0; p < points; p++) {
            const angle = (p / points) * Math.PI * 2;
            const roughness = 2 + (p % 3) * (item.radius * 0.12);
            const dist = item.radius - roughness;
            const px = item.x + Math.sin(angle) * dist;
            const py = item.y + Math.cos(angle) * dist;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(item.x - item.radius * 0.3, item.y - item.radius * 0.3, item.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'core_node') {
          // Drawing tech quantum core node
          const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.12;
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2;
          
          // Outer orbiting tech rings
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius * 1.5 * pulseScale, 0, Math.PI * 2);
          ctx.stroke();

          // Inner solid core
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.radius * pulseScale, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle dot
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(item.x - 2, item.y - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type.startsWith('stone')) {
          // Drawing gray space stones
          ctx.fillStyle = item.color;
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const sides = item.type === 'stone_large' ? 6 : 5;
          for (let s = 0; s < sides; s++) {
            const angle = (s / sides) * Math.PI * 2;
            const roughness = (s % 2) * (item.radius * 0.2);
            const dist = item.radius - roughness;
            const px = item.x + Math.sin(angle) * dist;
            const py = item.y + Math.cos(angle) * dist;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (item.type === 'cyber_scrap') {
          // Cyber Space Scrap - square diamond chip format
          ctx.fillStyle = item.color;
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(item.x, item.y - item.radius);
          ctx.lineTo(item.x + item.radius, item.y);
          ctx.lineTo(item.x, item.y + item.radius);
          ctx.lineTo(item.x - item.radius, item.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Circuit design line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.moveTo(item.x - 5, item.y);
          ctx.lineTo(item.x + 5, item.y);
          ctx.stroke();
        } else if (item.type === 'mystery_bag') {
          // Mystery Decode Bag
          ctx.fillStyle = item.color;
          ctx.beginPath();
          // Box / capsule bag
          ctx.roundRect(item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2, 6);
          ctx.fill();

          // Neon purple border
          ctx.strokeStyle = '#A78BFA';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Question mark text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', item.x, item.y);
        }

        ctx.restore();
      });

      // Draw caught item
      if (ref.caughtItem) {
        const item = ref.caughtItem;
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = item.color;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Dynamite Explosion
      if (ref.explosion) {
        ctx.save();
        const gradient = ctx.createRadialGradient(
          ref.explosion.x, ref.explosion.y, ref.explosion.radius * 0.1,
          ref.explosion.x, ref.explosion.y, ref.explosion.radius
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.2, '#FEE2E2');
        gradient.addColorStop(0.5, '#F87171');
        gradient.addColorStop(0.8, '#EF4444');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ref.explosion.x, ref.explosion.y, ref.explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Miner Space Cable / Laser Beam
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      // Orange gradient glow for the cable beam
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(ref.minerX, ref.minerY);
      const tipX = ref.minerX + Math.sin(ref.clawAngle) * ref.clawLength;
      const tipY = ref.minerY + Math.cos(ref.clawAngle) * ref.clawLength;
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      // Draw The Claw Claw-Claw!
      ctx.save();
      ctx.translate(tipX, tipY);
      ctx.rotate(-ref.clawAngle);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      
      // Draw left claw prong
      ctx.arc(-10, 0, 10, Math.PI * 1.2, Math.PI * 0.2, true);
      // Draw right claw prong
      ctx.arc(10, 0, 10, Math.PI * 1.8, Math.PI * 0.8);
      ctx.stroke();
      
      // Draw connecting base node
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Space Station Cabin / Miner Base at top center
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ref.minerX, ref.minerY - 15, 30, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Blinking warning console light
      const isConsoleBlink = Math.floor(Date.now() / 400) % 2 === 0;
      ctx.fillStyle = isConsoleBlink ? '#22C55E' : '#15803D';
      ctx.beginPath();
      ctx.arc(ref.minerX - 12, ref.minerY - 22, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isConsoleBlink ? '#EF4444' : '#991B1B';
      ctx.beginPath();
      ctx.arc(ref.minerX + 12, ref.minerY - 22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Labeled Logo in Cockpit
      ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CLAW ENG v3.5', ref.minerX, ref.minerY - 32);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, upgrades, onAddGold]);

  return (
    <div id="grok-miner-game" className="flex flex-col h-full bg-slate-950 border border-amber-500/20 rounded-xl overflow-hidden shadow-2xl relative">
      {/* HUD Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-amber-500/20 text-xs font-mono select-none z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-500 uppercase font-semibold">Goal:</span>
            <span className="text-amber-300 font-bold">{stats.targetGold} G-USD</span>
          </div>

          <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="uppercase font-semibold">Dynamite:</span>
            <span className="font-bold">{dynamiteCount}</span>
            {gameStateRef.current.clawState === 'reel' && gameStateRef.current.caughtItem && dynamiteCount > 0 && (
              <button 
                onClick={triggerDynamite}
                className="ml-1 bg-red-600 hover:bg-red-700 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse"
              >
                DETONATE (D)
              </button>
            )}
          </div>
        </div>

        {/* Time Left */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded border font-bold ${
            timeLeft <= 10 
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <span className="uppercase text-[10px]">COSMIC WINDOW:</span>
            <span>{timeLeft}s</span>
          </div>

          {/* Mute toggle button */}
          <button 
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800 border border-slate-700 rounded transition-colors"
            title={isMuted ? 'Unmute game' : 'Mute game'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main viewport canvas */}
      <div className="flex-grow flex items-center justify-center bg-slate-950 p-2 relative">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={500}
          onClick={fireClaw}
          className="w-full max-w-full aspect-[8/5] border border-amber-500/10 rounded bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 cursor-crosshair shadow-inner"
        />

        {/* Screen overlay alerts */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 font-mono text-center px-4 backdrop-blur-sm border border-amber-500/20">
            {stats.gold >= stats.targetGold ? (
              <div className="space-y-4 max-w-md">
                <div className="flex justify-center">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-full text-emerald-400">
                    <Sparkles className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-emerald-400 uppercase tracking-widest font-sans">COSMIC WINDOW EXCEEDED</h2>
                <p className="text-slate-300 text-sm">
                  Congratulations, Captain! You harvested <span className="text-emerald-400 font-bold">{stats.gold} G-USD</span>, exceeding the target orbit yield of {stats.targetGold} G-USD.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold">TIPS:</span> Visit the Command Deck to buy quantum thrusters or consulting algorithms before jumping to Level {stats.level + 1}!
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="flex justify-center animate-bounce">
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-full text-red-400">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest font-sans">ORBIT DECAY PREDICTED</h2>
                <p className="text-slate-300 text-sm">
                  Orbital target missed. Collected <span className="text-red-400 font-bold">{stats.gold} / {stats.targetGold} G-USD</span>. Stellar fuel has run out.
                </p>
                <button 
                  onClick={onRestartGame}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg text-sm font-semibold tracking-wider font-sans uppercase shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  REBOOT CORE
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cockpit Status Ticker / Instructions bar */}
      <div className="bg-slate-900 border-t border-amber-500/20 p-2.5 px-4 font-mono text-[11px] flex items-center justify-between gap-4 z-10 select-none">
        <div className="flex items-center gap-2 text-amber-500/80 max-w-[80%] overflow-hidden text-ellipsis whitespace-nowrap">
          <Compass className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
          <span className="text-slate-500 uppercase font-bold flex-shrink-0">TELEMETRY:</span>
          <span className="text-slate-300 italic">{lastNotification}</span>
        </div>
        
        <div className="text-slate-500 text-right font-semibold hidden sm:block">
          TAP/SPACE: Shoot Hook • D: Use Dynamite
        </div>
      </div>
    </div>
  );
}
