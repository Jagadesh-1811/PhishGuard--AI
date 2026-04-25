import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { BentoTabs } from './components/BentoTabs';
import { Showcase } from './components/Showcase';
import { NoiseOverlay, SerratedDivider, StickyNote } from './components/Common';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowLeft, Terminal, Lock, Cpu, Globe } from 'lucide-react';

type View = 'home' | 'docs' | 'privacy';

export default function App() {
  const [view, setView] = useState<View>('home');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (newView: View) => {
    setView(newView);
    scrollToTop();
  };

  const DocsView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto pt-32 pb-64 px-6 space-y-16"
    >
      <div className="space-y-6">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-stone-white/40 hover:text-acid-lime transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Back to Dashboard</span>
        </button>
        <h1 className="text-6xl md:text-8xl serif font-light italic">Technical <span className="not-italic">Documentation</span></h1>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-acid-lime" />
             <h2 className="text-2xl serif italic">01. Setup & Environment</h2>
          </div>
          <div className="bg-warm-charcoal p-8 rounded-3xl border border-stone-white/5 space-y-6">
             <p className="text-stone-white/70 leading-relaxed">
               PhishGuard AI operates as a local-first application. To initialize the forensic engine, you must have the Ollama runtime active on your workstation.
             </p>
             <div className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-stone-black rounded-lg border border-stone-white/5 text-stone-white/40 italic">
                  # 1. Download Ollama from ollama.ai
                </div>
                <div className="p-4 bg-stone-black rounded-lg border border-stone-white/5 text-acid-lime">
                  ollama pull gpt-oss:120b-cloud
                </div>
                <div className="p-4 bg-stone-black rounded-lg border border-stone-white/5 text-stone-white/40 italic">
                  # 2. Start the local inference server
                </div>
                <div className="p-4 bg-stone-black rounded-lg border border-stone-white/5 text-acid-lime">
                  ollama serve
                </div>
             </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Globe className="w-5 h-5 text-acid-lime" />
             <h2 className="text-2xl serif italic">02. Gmail Integration</h2>
          </div>
          <div className="bg-warm-charcoal p-8 rounded-3xl border border-stone-white/5 space-y-6">
             <p className="text-stone-white/70 leading-relaxed">
               The "Live Monitor" requires an App Password to bridge the encrypted local daemon with your Gmail inbox via IMAP.
             </p>
             <ol className="list-decimal list-inside space-y-4 text-stone-white/70">
                <li>Navigate to <span className="text-acid-lime">myaccount.google.com</span> and select Security.</li>
                <li>Enable <span className="font-bold">2-Step Verification</span> if not already active.</li>
                <li>Search for <span className="font-bold whitespace-nowrap">"App Passwords"</span> in the global search bar.</li>
                <li>Generate an app-specific token labeled "PhishGuard".</li>
                <li>Paste the 16-character sequence into the Dashboard login.</li>
             </ol>
          </div>
        </section>
      </div>
    </motion.div>
  );

  const PrivacyView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto pt-32 pb-64 px-6 space-y-16"
    >
      <div className="space-y-6">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-stone-white/40 hover:text-acid-lime transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Back to Dashboard</span>
        </button>
        <h1 className="text-6xl md:text-8xl serif font-light italic">Privacy <span className="not-italic">Manifesto</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {[
          { title: 'Zero Data Retention', desc: 'Analyzed email headers and bodies are processed in-memory and discarded upon session termination. We persist zero external logs.', icon: Lock },
          { title: 'Local Inference', desc: 'No correspondence is sent to cloud servers. All LLM execution happens on your GPU/CPU via the local Ollama instance.', icon: Cpu },
          { title: 'Credential Security', desc: 'Your Gmail App Password is used solely for the active session handshake and is never stored on a database.', icon: Globe },
          { title: 'Encrypted Handshake', desc: 'All mail-agent communication is performed over TLS-secured IMAP and SMTP protocols directly from your device.', icon: Shield },
        ].map(item => (
          <div key={item.title} className="bg-warm-charcoal p-12 border border-stone-white/5 space-y-8">
            <item.icon className="w-8 h-8 text-acid-lime" />
            <h3 className="serif text-3xl font-light italic">{item.title}</h3>
            <p className="text-stone-white/60 leading-relaxed text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="text-center p-12 bg-acid-lime text-stone-black rounded-[48px]">
         <h3 className="serif text-4xl mb-4 italic font-light">Transparency by Default.</h3>
         <p className="font-medium text-sm">PhishGuard AI is open-source. For independent security audits, visit our Github repository.</p>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-stone-black">
      <NoiseOverlay />

      {/* Header / Brand & Nav */}
      <div className="fixed top-8 left-0 right-0 z-50 px-8 flex justify-between items-center">
        {/* Brand Name - Left Corner */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-acid-lime flex items-center justify-center">
             <Shield className="w-4 h-4 text-stone-black" />
          </div>
          <span className="serif text-xl font-light italic tracking-tight group-hover:text-acid-lime transition-colors">PhishGuard AI</span>
        </div>

        {/* Navigation Pill - Center (only on Home) */}
        {view === 'home' && (
          <div className="hidden md:flex items-center gap-1 glass p-1 rounded-full">
            {[
              { label: 'Scanner', href: '#scanner' },
              { label: 'Methodology', href: '#showcase' },
              { label: 'Documentation', action: () => navigateTo('docs') },
              { label: 'Privacy', action: () => navigateTo('privacy') },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.href) {
                    const el = document.querySelector(item.href);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-5 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 hover:bg-stone-white hover:text-stone-black"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* CTA - Right Corner */}
        <div>
           <button 
             onClick={() => {
               const el = document.querySelector('#scanner');
               el?.scrollIntoView({ behavior: 'smooth' });
             }}
             className="bg-acid-lime text-stone-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
           >
             Analyze Now
           </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero />
            <SerratedDivider position="bottom" className="bg-stone-black border-t border-stone-white/5" />
            <BentoTabs />
            <Showcase />
            
            <section className="py-48 px-6 flex justify-center">
              <div className="max-w-xl w-full">
                <StickyNote title="Local Verification Engine" className="scale-110 shadow-2xl shadow-acid-lime/30">
                  PhishGuard AI utilizes purely local gpt-oss neural topography. Ensure your local inference server is optimized for high-throughput sentiment analysis.
                  <div className="mt-8">
                    <button onClick={() => navigateTo('docs')} className="w-full bg-stone-black text-acid-lime py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-black/80 transition-all">
                      View Deployment Requirements
                    </button>
                  </div>
                </StickyNote>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'docs' && <DocsView key="docs" />}
        {view === 'privacy' && <PrivacyView key="privacy" />}
      </AnimatePresence>

      <footer className="py-10 px-8 border-t border-stone-white/5 bg-warm-charcoal/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          {/* Logo & Brand */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full border border-stone-border flex items-center justify-center bg-stone-black group-hover:bg-acid-lime group-hover:border-acid-lime transition-all">
              <Shield className="w-3 h-3 group-hover:text-stone-black transition-colors" />
            </div>
            <span className="serif text-lg font-light italic tracking-tight">PhishGuard AI</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-10 text-[9px] font-mono uppercase tracking-[0.3em] opacity-40">
             <button onClick={() => navigateTo('docs')} className="hover:text-acid-lime transition-colors">Documentation</button>
             <button onClick={() => navigateTo('privacy')} className="hover:text-acid-lime transition-colors">Privacy Policy</button>
             <a href="https://github.com/Jagadesh-1811/phisingguradai" target="_blank" rel="noreferrer" className="hover:text-acid-lime transition-colors">Source Code</a>
             <button onClick={() => navigateTo('home')} className="hover:text-acid-lime transition-colors">Dashboard</button>
          </div>

          {/* System Status / Copyright */}
          <div className="flex items-center gap-6 opacity-20 text-[8px] font-mono uppercase tracking-[0.4em]">
             <span className="hidden lg:inline">Unit // Sentinel-01</span>
             <span>© 2026 PhishGuard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
