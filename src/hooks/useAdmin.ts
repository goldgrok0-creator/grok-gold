import { useState } from 'react';
import { useAppState } from '../AppContext';
import { adminService } from '../services/adminService';
import { SystemError } from '../types';

export const useAdmin = () => {
  const {
    globalConfig,
    setGlobalConfig,
    language,
    triggerModal,
    state,
    setState,
    updateState,
    syncFromSupabase
  } = useAppState();

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const saveConfig = async (newConfig: any) => {
    const success = await adminService.saveConfig(newConfig);
    if (success) {
      setGlobalConfig(newConfig);
      triggerModal(
        language === 'id' ? '✅ Konfigurasi sistem berhasil disimpan!' : '✅ System configuration saved successfully!',
        'success'
      );
      return true;
    } else {
      triggerModal(
        language === 'id' ? '❌ Gagal menyimpan konfigurasi sistem.' : '❌ Failed to save system configuration.',
        'danger'
      );
      return false;
    }
  };

  const resetAllData = async () => {
    const success = await adminService.resetData();
    if (success) {
      triggerModal(
        language === 'id'
          ? '🚨 DATABASE BERHASIL DIRESET!\n\nSemua akun pengguna, transaksi, deposit, penarikan, dan kontrak telah dihapus dari database Supabase.\n\nSistem diinisialisasi ulang ke kondisi awal.'
          : '🚨 DATABASE SUCCESSFULLY RESET!\n\nAll custom users, transactions, deposits, withdrawals, and contract fleets have been fully purged from the Supabase database.',
        'success'
      );
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      return true;
    } else {
      triggerModal(
        language === 'id' ? '❌ Gagal mereset database.' : '❌ Failed to reset database.',
        'danger'
      );
      return false;
    }
  };

  const runDiagnostics = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLog([]);

    const logSteps = [
      { progress: 10, msg: '[SYSTEM] Initializing connection to EXC-700 Block Registry...' },
      { progress: 25, msg: '[SYSTEM] Establishing handshake with South Africa telemetry... OK' },
      { progress: 40, msg: '[SYSTEM] Querying Mali Operational Site L2... WARN: Temperature spike' },
      { progress: 60, msg: '[SYSTEM] Pinging Ghana active hashing rigs... OK' },
      { progress: 75, msg: '[SYSTEM] Evaluating satellite packet drop rate on Tanzania Gateway... OK' },
      { progress: 90, msg: '[SYSTEM] Reconciling ledger blocks with decentralized validator node... COMPLETE' },
      { progress: 100, msg: '[SYSTEM] Diagnostic scan complete. System status compiled.' }
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setScanProgress(step.progress);
        setScanLog(prev => [...prev, step.msg]);

        if (step.progress === 100) {
          setIsScanning(false);
          // Generate simulated system error
          const errorPool = [
            {
              errorCode: 'ERR-304',
              message: language === 'id' 
                ? 'Suhu teras termal melebihi batas keselamatan (86°C)' 
                : 'Thermal core temperature exceeded safety safety margin (86°C)',
              node: 'Mali Operational Site L2',
              severity: 'critical' as const
            },
            {
              errorCode: 'ERR-115',
              message: language === 'id'
                ? 'Fluktuasi voltase terdeteksi pada kompresor Turbo Accelerator'
                : 'Voltage fluctuation detected on Turbo Accelerator compressor',
              node: 'EXC-700 South Africa Node',
              severity: 'warning' as const
            },
            {
              errorCode: 'ERR-502',
              message: language === 'id'
                ? 'Keterlambatan sinkronisasi blok terdeteksi (+1.8 detik)'
                : 'Block synchronization delay detected (+1.8s)',
              node: 'Tanzania Gateway Node',
              severity: 'warning' as const
            },
            {
              errorCode: 'ERR-211',
              message: language === 'id'
                ? 'Kegagalan deteksi detak jantung pada rig penambangan Ghana #9'
                : 'Heartbeat signal failure on Ghana active mining rig #9',
              node: 'Ghana Active Rigs',
              severity: 'critical' as const
            }
          ];

          const picked = errorPool[Math.floor(Math.random() * errorPool.length)];
          const newErr: SystemError = {
            id: 'err-' + Date.now(),
            timestamp: Date.now(),
            errorCode: picked.errorCode,
            message: picked.message,
            node: picked.node,
            severity: picked.severity,
            resolved: false
          };

          setState(prev => ({
            ...prev,
            systemErrors: [newErr, ...(prev.systemErrors || [])]
          }));

          triggerModal(
            language === 'id'
              ? `⚠️ PEMINDAIAN SELESAI\n\nMenemukan isu: ${picked.errorCode} di ${picked.node}.\nSilakan periksa Riwayat Error untuk melakukan debugging!`
              : `⚠️ SCAN COMPLETE\n\nIssue discovered: ${picked.errorCode} at ${picked.node}.\nPlease check Error History to initiate troubleshooting!`,
            'warning'
          );
        }
      }, (index + 1) * 600);
    });
  };

  const resolveError = (errId: string) => {
    if (resolvingId) return;
    setResolvingId(errId);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        systemErrors: (prev.systemErrors || []).map(err => 
          err.id === errId ? { ...err, resolved: true } : err
        )
      }));
      setResolvingId(null);
      triggerModal(
        language === 'id'
          ? '✅ Debugging berhasil! Unit ekskavator kembali beroperasi dengan efisiensi puncak.'
          : '✅ Troubleshooting successful! The excavator unit is restored to 100% operational efficiency.',
        'success'
      );
    }, 1500);
  };

  return {
    saveConfig,
    resetAllData,
    runDiagnostics,
    resolveError,
    isScanning,
    scanProgress,
    scanLog,
    resolvingId
  };
};
