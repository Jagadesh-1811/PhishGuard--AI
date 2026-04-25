import React from 'react';

export const NoiseOverlay: React.FC = () => (
  <div className="noise-overlay" aria-hidden="true" />
);

interface SerratedDividerProps {
  position: 'top' | 'bottom';
  className?: string;
}

export const SerratedDivider: React.FC<SerratedDividerProps> = ({ position, className = '' }) => (
  <div 
    className={`h-4 w-full bg-warm-charcoal ${position === 'top' ? 'serrated-top' : 'serrated-bottom'} ${className}`}
    aria-hidden="true"
  />
);

interface StickyNoteProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ title, children, className = '' }) => (
  <div className={`bg-acid-lime p-10 rounded-[24px] sticky-note-transform text-warm-charcoal ${className}`}>
    <h3 className="serif text-2xl mb-4 italic font-light">{title}</h3>
    <div className="font-medium text-sm leading-relaxed mb-6">
      {children}
    </div>
    <div className="border-t border-warm-charcoal/10 pt-4 flex justify-between items-center text-[10px] uppercase tracking-wider font-mono">
      <span>Ref. ID: PG-2024-X</span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-warm-charcoal animate-pulse" />
        Live Scan
      </span>
    </div>
  </div>
);

interface CatalogLabelProps {
  figure: string;
  className?: string;
}

export const CatalogLabel: React.FC<CatalogLabelProps> = ({ figure, className = '' }) => (
  <div className={`absolute top-4 left-4 glass px-3 py-1.5 rounded-full flex items-center gap-2 z-10 ${className}`}>
    <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">{figure}</span>
    <div className="w-1.5 h-1.5 rounded-full bg-acid-lime" />
  </div>
);
