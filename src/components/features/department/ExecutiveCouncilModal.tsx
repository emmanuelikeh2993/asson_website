import React, { useState, useEffect } from 'react';
import { ElectedExecutive } from '../../../types';
import { fetchElectedExecutives } from '../../../lib/supabase';
import { Award, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Modal } from '../../ui/Modal';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ASSON Executive Council" maxWidth="2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-light flex items-center justify-center text-brand-green shrink-0">
              <Award className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-main">
                  Elected Student Leadership
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 text-xs font-bold">
                  {executives[0]?.session || '2026/2027'}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Department of Statistics, University of Ibadan
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-muted text-xs">
            Loading executive council details...
          </div>
        ) : executives.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-xs">
            No elected executives on file for this session.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {executives.map((exec) => (
              <div
                key={exec.id}
                className="p-4 rounded-2xl bg-surface-bg border border-border-light flex flex-col justify-between space-y-3 shadow-2xs hover:border-brand-green/50 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {exec.imageUrl ? (
                        <img
                          src={exec.imageUrl}
                          alt={exec.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-border-light shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-deep dark:text-emerald-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-brand-green/20">
                          {exec.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-text-main leading-snug">
                          {exec.name}
                        </h4>
                        <span className="text-xs text-text-muted font-mono block">
                          {exec.level} Level
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg bg-brand-deep text-white text-xs font-bold tracking-wide uppercase shrink-0 shadow-2xs">
                      {exec.office}
                    </span>
                  </div>

                  {exec.bio && (
                    <p className="text-xs text-text-muted leading-relaxed italic">
                      &ldquo;{exec.bio}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border-light text-xs">
                  <span className="text-xs text-text-subtle font-mono">
                    Session: {exec.session}
                  </span>

                  <div className="flex items-center gap-2">
                    {exec.whatsapp && (
                      <a
                        href={`https://wa.me/${exec.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 min-h-[44px] sm:min-h-[36px] rounded-lg bg-brand-light hover:bg-emerald-100 dark:hover:bg-emerald-950 text-brand-deep dark:text-emerald-300 font-bold text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" /> WhatsApp
                      </a>
                    )}
                    {exec.email && (
                      <a
                        href={`mailto:${exec.email}`}
                        aria-label={`Email ${exec.name}`}
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-lg bg-surface-card border border-border-light text-text-main font-medium text-xs hover:border-brand-green transition-colors"
                        title={exec.email}
                      >
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-border-light text-xs text-text-muted flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span>Authenticated ASSON Electoral &amp; Executive Roster</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
