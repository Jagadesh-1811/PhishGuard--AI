import React from 'react';
import { CatalogLabel } from './Common';

const cards = [
  { 
    id: 1, 
    title: 'URL Heuristics', 
    fig: 'Fig. 1A', 
    matter: 'Traditional phishing detection relies on blocklists of known malicious URLs. PhishGuard AI deconstructs the URI intent itself. By analyzing character entropy, TLD reputation, and path-logic dissonance, our local model identifies predatory redirection before the browser initiates a handshake. This ensures zero-day protection without external database reliance.',
    tags: ['Entropy Scan', 'URI Intent', 'Zero-Day']
  },
  { 
    id: 2, 
    title: 'Metadata Integrity', 
    fig: 'Fig. 2B', 
    matter: 'Modern email spoofing mimics trusted headers with microscopic precision. Our integrity methodology involves a deep-packet analysis of DKIM signatures and SPF alignments processed locally. We detect hidden "Reply-To" discrepancies and inconsistent mailing-agent identifiers that social engineering often masks. Security is found in the technical dissonance.',
    tags: ['DKIM/SPF', 'Spoof Detection', 'Heuristics']
  },
  { 
    id: 3, 
    title: 'Forensic Sentiment', 
    fig: 'Fig. 3C', 
    matter: 'Phishing is a psychological attack. The gpt-oss model performs linguistic forensic analysis to determine the "Ugency Coefficient" of the correspondence. By mapping command-logic structures and authority-impersonation patterns, PhishGuard AI identifies the subtle coercive language that precedes a data breach. Privacy is maintained via purely local neural execution.',
    tags: ['Linguistic Logic', 'Sentiment AI', 'Local-Only']
  },
];

export const Showcase: React.FC = () => {
  return (
    <section id="showcase" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl serif font-light leading-tight">
              A <span className="italic">Technical Forensic</span> deconstruction of modern threat vectors.
            </h2>
          </div>
          <div className="pb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">Methodology / 01</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 grid-flow-row">
          {cards.map((card) => (
            <div 
              key={card.id}
              className="bg-[#292524] p-12 min-h-[500px] border border-stone-white/5 flex flex-col justify-between hover:bg-[#322d2b] transition-colors duration-500 group"
            >
              <div className="space-y-12">
                <div className="flex justify-between items-start">
                  <CatalogLabel figure={card.fig} className="static p-0! bg-transparent! border-none! backdrop-blur-none!" />
                  <div className="flex gap-2">
                    {card.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-mono uppercase tracking-widest px-2 py-1 border border-stone-white/10 rounded-full opacity-40 group-hover:opacity-100 transition-opacity">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="serif text-4xl italic font-light leading-tight group-hover:text-acid-lime transition-colors">
                  {card.title}
                </h3>
              </div>
              
              <div className="space-y-8">
                <p className="text-base text-stone-white/70 leading-relaxed font-medium">
                  {card.matter}
                </p>
                <div className="pt-6 border-t border-stone-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Full Specification Available</span>
                  <div className="w-12 h-px bg-stone-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
