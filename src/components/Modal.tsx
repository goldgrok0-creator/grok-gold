import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function Modal({
  isOpen,
  message,
  type,
  showConfirm = false,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
      case 'danger':
        return <XCircle className="w-12 h-12 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-12 h-12 text-cyan-400" />;
    }
  };

  const isCustomHtml = message.includes('<div') || message.includes('<p') || message.includes('<h') || message.includes('<span');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-[92%] sm:w-full max-w-[420px] max-h-[85vh] bg-[#12072b]/95 border border-purple-500/40 rounded-[24px] p-4 sm:p-5 shadow-[0_0_50px_rgba(147,51,234,0.3)] z-10 flex flex-col backdrop-blur-xl"
          >
            {/* Top Close Button (X) */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body / Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 my-1 custom-modal-scroll">
              {!isCustomHtml && (
                <div className="flex justify-center my-3">
                  {getIcon()}
                </div>
              )}

              <div 
                className={`text-slate-100 ${isCustomHtml ? 'text-left' : 'text-center text-[15px] font-semibold leading-relaxed py-2'}`}
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>

            {/* Pinned Bottom Action Footer */}
            <div className="shrink-0 pt-3 border-t border-purple-500/20 mt-2 flex gap-3 justify-center">
              {showConfirm ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-full text-sm font-bold transition cursor-pointer"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      if (onConfirm) onConfirm();
                      onClose();
                    }}
                    className="flex-1 h-11 py-2.5 px-4 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black hover:brightness-110 rounded-full text-sm font-extrabold transition shadow-[0_0_20px_rgba(251,191,36,0.35)] cursor-pointer uppercase tracking-wider"
                  >
                    {confirmText}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full h-11 sm:h-12 py-2.5 px-6 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black hover:brightness-110 rounded-full text-base font-black transition shadow-[0_0_25px_rgba(251,191,36,0.35)] cursor-pointer uppercase tracking-wider flex items-center justify-center active:scale-[0.98]"
                >
                  OK
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

