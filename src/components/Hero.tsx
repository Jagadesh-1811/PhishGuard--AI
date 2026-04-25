import React from 'react';
import { StickyNote } from './Common';

export const Hero: React.FC = () => {
  return (
    <section className="pt-40 pb-32 px-6 min-h-[80vh] flex items-center justify-center text-center">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Centered Text Content */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light leading-[1.05] tracking-tight">
            The <span className="italic">Digital Sentinel</span> for your Private Correspondence.
          </h1>
          <p className="text-xl text-stone-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Local-first AI phishing detection that respects your privacy. 
            No cloud. No tracking. Just absolute security for your inbox.
          </p>
          
          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-stone-black bg-warm-charcoal overflow-hidden opacity-70 grayscale transition-all hover:grayscale-0 hover:scale-110">
                   <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="user" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold tracking-wide">2,400+ Users Secured</span>
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Real-time Detection Active</span>
            </div>
          </div>
        </div>

        <div className="pt-8">
           <button 
             onClick={() => window.location.hash = '#manual'}
             className="bg-acid-lime text-stone-black px-12 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-acid-lime/20"
           >
             Initialize Scanning Sequence
           </button>
        </div>
      </div>
    </section>
  );
};
