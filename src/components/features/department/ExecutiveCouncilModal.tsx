import React, { useState, useEffect } from 'react';
import { ElectedExecutive } from '../../../types';
import { fetchElectedExecutives } from '../../../lib/supabase';
import { X, Award, Phone, Mail, User, ShieldCheck } from 'lucide-react';

interface ExecutiveCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveCouncilModal: React.FC<ExecutiveCouncilModalProps> = ({ isOpen, onClose }) => {
  const [executives, setExecutives] = useState<ElectedExecutive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchElectedExecutives()
        .then((data) => {
          setExecutives(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#13171D] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#13171D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#087A3E]/10 flex items-center justify-center text-[#087A3E] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                  ASSON Executive Council
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#087A3E]/10 text-[#087A3E] text-[10px] font-bold">
                  2024/2025
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Elected student leaders • Department of Statistics, University of Ibadan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-none">
          {loading ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              Loading executive council details...
            </div>
          ) : executives.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs">
              No elected executives on file for this session.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {executives.map((exec) => (
                <div
                  key={exec.id}
                  className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#087A3E]/40 transition-colors"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Picture / Avatar & Office Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {exec.imageUrl ? (
                          <img
                            src={exec.imageUrl}
                            alt={exec.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[#087A3E]/10 text-[#087A3E] font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#087A3E]/20">
                            {exec.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                            {exec.name}
                          </h3>
                          <span className="text-[11px] text-zinc-500 font-mono block">
                            {exec.level} Level
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-[#087A3E] text-white text-[10px] font-bold tracking-wide uppercase shrink-0 shadow-2xs">
                        {exec.office}
                      </span>
                    </div>

                    {/* Bio / Quote */}
                    {exec.bio && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                        &ldquo;{exec.bio}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions & Contact Links */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Session: {exec.session}
                    </span>

                    <div className="flex items-center gap-2">
                      {exec.whatsapp && (
                        <a
                          href={`https://wa.me/${exec.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#087A3E]/10 hover:bg-[#087A3E]/20 text-[#087A3E] font-bold text-[11px] transition-colors"
                        >
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                      {exec.email && (
                        <a
                          href={`mailto:${exec.email}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                          title={exec.email}
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#087A3E]" />
            <span>Authenticated ASSON Electoral & Executive Roster</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
