import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Radio, LayoutGrid, Zap } from 'lucide-react';
import { SerratedDivider } from './Common';

const tabs = [
  { id: 'manual', label: 'Manual Check', icon: ShieldCheck, color: '#D4F268' },
  { id: 'monitor', label: 'Live Monitor', icon: Radio, color: '#E7E5E4' },
  { id: 'score', label: 'Security Score', icon: LayoutGrid, color: '#E7E5E4' },
  { id: 'local', label: 'Local AI', icon: Zap, color: '#E7E5E4' },
];

type AnalysisResult = {
  verdict: 'YES' | 'NO';
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  signs: string[];
};

type ScoreDetail = {
  label: string;
  impact: number;
  note: string;
};

type LocalSnapshot = {
  score: number;
  verdict: 'SAFE' | 'PHISHING';
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  signals: ScoreDetail[];
  model: string;
  mode: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getScoreBand(score: number) {
  if (score >= 80) return 'Low Risk';
  if (score >= 55) return 'Review Needed';
  return 'High Risk';
}

function buildSecurityScore(sender: string, subject: string, body: string, result: AnalysisResult | null) {
  const findings: ScoreDetail[] = [];
  let score = 96;
  const content = `${sender} ${subject} ${body}`.toLowerCase();

  const flag = (label: string, impact: number, note: string) => {
    score -= impact;
    findings.push({ label, impact, note });
  };

  if (/urgent|immediately|asap|verify|action required|suspend|limited time/i.test(subject)) {
    flag('Urgent subject language', 14, 'The subject line uses pressure-driven wording.');
  }

  if (/password|credential|login|verify your account|reset/i.test(content)) {
    flag('Credential bait', 18, 'The message references account access or credential checks.');
  }

  if (/https?:\/\//i.test(body) || /www\./i.test(body)) {
    flag('Embedded links', 12, 'The body contains one or more outbound links.');
  }

  if (/invoice|gift card|payment|wire transfer|refund/i.test(content)) {
    flag('Financial trigger', 10, 'The message mentions payment or invoice flow.');
  }

  if (result?.verdict === 'YES') {
    flag('AI phishing verdict', 28, 'The current local model already classified the email as phishing.');
  }

  if (result?.risk === 'HIGH') {
    flag('High-risk model output', 16, 'The model risk tier is already elevated.');
  } else if (result?.risk === 'MEDIUM') {
    flag('Moderate model output', 8, 'The model flagged some suspicious traits.');
  }

  if (result?.signs?.length) {
    flag('Detected indicators', Math.min(16, result.signs.length * 4), 'The analysis returned multiple phishing indicators.');
  }

  if (!sender || !subject || !body) {
    flag('Incomplete signal set', 20, 'The score is conservative when the message context is incomplete.');
  }

  const finalScore = clampScore(score);
  const details = findings.sort((a, b) => b.impact - a.impact).slice(0, 5);

  return {
    score: finalScore,
    band: getScoreBand(finalScore),
    details,
  };
}

export const BentoTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('manual');

  // Sync tab with URL hash
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['manual', 'monitor', 'score', 'local'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Manual Analysis State
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [localSnapshot, setLocalSnapshot] = useState<LocalSnapshot | null>(null);

  // Monitor State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!sender || !subject || !body) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, subject, body }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const securityScore = buildSecurityScore(sender, subject, body, result as AnalysisResult | null);

  const runLocalSnapshot = () => {
    const base = buildSecurityScore(sender, subject, body, result as AnalysisResult | null);
    const derivedRisk = base.score >= 80 ? 'LOW' : base.score >= 55 ? 'MEDIUM' : 'HIGH';
    const derivedVerdict = derivedRisk === 'LOW' ? 'SAFE' : 'PHISHING';
    const summary = derivedVerdict === 'SAFE'
      ? 'The local rule set does not see enough pressure, credential bait, or link risk to quarantine this message.'
      : 'The local rule set sees enough coercive or credential-oriented cues to recommend blocking the message.';

    setLocalSnapshot({
      score: base.score,
      verdict: derivedVerdict,
      risk: derivedRisk,
      summary,
      signals: base.details,
      model: 'gpt-oss:120b-cloud',
      mode: 'purely local heuristic inference',
    });
  };

  const toggleMonitor = async () => {
    if (isMonitoring) {
      await fetch('/api/monitor/stop', { method: 'POST' });
      setIsMonitoring(false);
    } else {
      if (!email || !password) return;
      const resp = await fetch('/api/monitor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, interval: 5 }),
      });
      if (resp.ok) setIsMonitoring(true);
    }
  };

  React.useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(async () => {
        try {
          const resp = await fetch('/api/monitor/logs');
          const data = await resp.json();
          setLogs(data.logs || []);
        } catch (err) {
          console.error(err);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  return (
    <section id="scanner" className="py-24 px-6 bento-grid">
      <div className="max-w-7xl mx-auto">
        {/* Folder Navigation */}
        <div className="flex flex-wrap items-end -space-x-1 -mb-px relative z-10">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-8 py-4 text-sm font-semibold rounded-t-2xl transition-all duration-300
                  ${isActive ? 'bg-warm-charcoal text-acid-lime z-20 -translate-y-2' : 'bg-stone-border/20 text-stone-white/40 hover:bg-stone-border/40'}
                `}
                style={{
                  transform: isActive ? 'translateY(-8px) rotate(0deg)' : `rotate(${idx % 2 === 0 ? '-2deg' : '1deg'})`,
                }}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-warm-charcoal border border-stone-border rounded-b-3xl rounded-tr-3xl overflow-hidden relative min-h-[650px]">
          <SerratedDivider position="top" className="bg-stone-black" />
          
          <div className="p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-16"
              >
                {activeTab === 'manual' && (
                  <>
                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="text-4xl serif font-light italic">Immediate Email Deconstruction.</h2>
                      <p className="text-stone-white/60 text-sm leading-relaxed">
                        Paste the full headers and body of any suspicious correspondence. Our local gpt-oss model will perform a deep heuristic analysis.
                      </p>
                      
                      <div className="space-y-4 pt-4">
                        <input 
                          type="text" placeholder="Sender Address" value={sender} onChange={e => setSender(e.target.value)}
                          className="w-full bg-stone-black/50 border border-stone-border rounded-xl p-4 text-sm focus:border-acid-lime outline-none transition-colors"
                        />
                        <input 
                          type="text" placeholder="Subject Line" value={subject} onChange={e => setSubject(e.target.value)}
                          className="w-full bg-stone-black/50 border border-stone-border rounded-xl p-4 text-sm focus:border-acid-lime outline-none transition-colors"
                        />
                        <textarea 
                          placeholder="Email Body" rows={6} value={body} onChange={e => setBody(e.target.value)}
                          className="w-full bg-stone-black/50 border border-stone-border rounded-xl p-4 text-sm focus:border-acid-lime outline-none transition-colors resize-none"
                        />
                        <button 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="w-full bg-acid-lime text-stone-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50 transition-opacity"
                        >
                          {isAnalyzing ? 'Processing Nodes...' : 'Initialize Analysis'}
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                       {result ? (
                         <div className={`p-8 rounded-2xl border ${result.verdict === 'YES' ? 'border-red-500/50 bg-red-500/5' : 'border-acid-lime/50 bg-acid-lime/5'} h-full flex flex-col justify-between`}>
                           <div>
                             <div className="flex justify-between items-start mb-6">
                               <h3 className={`text-2xl font-bold ${result.verdict === 'YES' ? 'text-red-500' : 'text-acid-lime'}`}>
                                 {result.verdict === 'YES' ? 'PHISHING DETECTED' : 'SAFE VERDICT'}
                               </h3>
                               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${result.risk === 'HIGH' ? 'bg-red-500 text-white' : 'bg-acid-lime text-black'}`}>
                                 {result.risk} RISK
                               </span>
                             </div>
                             <p className="text-xl serif italic mb-6 wrap-break-word">"{result.reason}"</p>
                             {result.signs && (
                               <ul className="space-y-2">
                                 {result.signs.map((sign: string, i: number) => (
                                   <li key={i} className="text-sm opacity-60 flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-current" />
                                     {sign}
                                   </li>
                                 ))}
                               </ul>
                             )}
                           </div>
                           <div className="pt-8 border-t border-stone-white/10 flex items-center justify-between">
                              <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest">PG-REPORT-ALGORITHM-v4</span>
                              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-acid-lime transition-colors">Clear Report</button>
                           </div>
                         </div>
                       ) : (
                        <div className="bg-stone-black/30 border border-stone-border border-dashed rounded-2xl h-full flex flex-col justify-center items-center text-center space-y-4 p-12">
                          <ShieldCheck className="w-16 h-16 text-acid-lime opacity-10" />
                          <p className="text-xs font-mono opacity-20 uppercase tracking-widest">Ready for Secure Intake</p>
                        </div>
                       )}
                    </div>
                  </>
                )}

                {activeTab === 'monitor' && (
                  <>
                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="text-4xl serif font-light italic">Live Inbox Surveillance.</h2>
                      <p className="text-stone-white/60 text-sm leading-relaxed">
                        Connect your Gmail or Outlook via encrypted local storage. PhishGuard AI monitors your unread messages in real-time.
                      </p>
                      <div className="space-y-4 pt-4">
                         <input 
                          type="email" placeholder="Gmail Address" value={email} onChange={e => setEmail(e.target.value)}
                          className="w-full bg-stone-black/50 border border-stone-border rounded-xl p-4 text-sm focus:border-acid-lime outline-none transition-colors"
                        />
                        <input 
                          type="password" placeholder="App Password" value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full bg-stone-black/50 border border-stone-border rounded-xl p-4 text-sm focus:border-acid-lime outline-none transition-colors"
                        />
                        <button 
                          onClick={toggleMonitor}
                          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isMonitoring ? 'bg-red-500 text-white' : 'bg-acid-lime text-stone-black'}`}
                        >
                          {isMonitoring ? 'Terminate Monitor' : 'Establish Connection'}
                        </button>
                      </div>
                    </div>
                    <div className="lg:col-span-7 flex flex-col">
                       <div className="flex-1 bg-stone-black/50 border border-stone-border rounded-2xl overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-stone-border flex justify-between items-center bg-stone-black/30">
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Security Logs</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-acid-lime animate-pulse' : 'bg-red-500'}`} />
                              <span className="text-[10px] font-mono uppercase">{isMonitoring ? 'Active' : 'Offline'}</span>
                            </div>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[400px] flex-1 space-y-2 font-mono text-[10px]">
                            {logs.length > 0 ? logs.map((log, i) => (
                              <div key={i} className={`flex gap-4 p-2 rounded ${log.verdict === 'YES' ? 'bg-red-500/10 text-red-500' : 'bg-stone-white/5 opacity-60'}`}>
                                <span className="opacity-40">[{log.time}]</span>
                                <span className="font-bold flex-1 truncate">{log.sender}</span>
                                <span>{log.verdict === 'YES' ? 'THREAT' : 'SAFE'}</span>
                              </div>
                            )) : (
                              <div className="h-full flex items-center justify-center italic opacity-20">
                                No logs detected in current session...
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                  </>
                )}

                {activeTab === 'score' && (
                  <>
                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="text-4xl serif font-light italic">Security Score Engine.</h2>
                      <p className="text-stone-white/60 text-sm leading-relaxed">
                        This panel condenses the current message and the latest AI verdict into a weighted risk score so the result is readable at a glance.
                      </p>

                      <div className="p-6 rounded-2xl border border-stone-border bg-stone-black/40 space-y-5">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Current Score</p>
                            <div className="flex items-end gap-2">
                              <span className="text-7xl font-bold leading-none text-acid-lime">{securityScore.score}</span>
                              <span className="pb-2 text-sm font-mono uppercase tracking-widest opacity-40">/ 100</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${securityScore.score >= 80 ? 'bg-acid-lime text-black' : securityScore.score >= 55 ? 'bg-amber-400 text-black' : 'bg-red-500 text-white'}`}>
                            {securityScore.band}
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-stone-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-red-500 via-amber-400 to-acid-lime transition-all"
                            style={{ width: `${securityScore.score}%` }}
                          />
                        </div>

                        <p className="text-sm text-stone-white/60">
                          The score updates from the same analysis inputs used in the manual check.
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-stone-black/50 border border-stone-border rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Risk Breakdown</p>
                            <h3 className="text-2xl serif italic">Weighted indicators</h3>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Derived locally</span>
                        </div>

                        <div className="space-y-3">
                          {securityScore.details.length > 0 ? securityScore.details.map((item) => (
                            <div key={item.label} className="flex gap-4 p-4 rounded-xl bg-stone-white/5 border border-stone-white/5">
                              <div className="min-w-14 text-acid-lime font-mono text-xs uppercase tracking-widest">-{item.impact}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="font-semibold">{item.label}</span>
                                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Signal</span>
                                </div>
                                <p className="text-sm text-stone-white/60 mt-1">{item.note}</p>
                              </div>
                            </div>
                          )) : (
                            <div className="p-6 rounded-xl border border-dashed border-stone-white/10 text-center text-sm text-stone-white/40">
                              Add sender, subject, and body text to generate a score.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'local' && (
                  <>
                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="text-4xl serif font-light italic">Local AI Diagnostics.</h2>
                      <p className="text-stone-white/60 text-sm leading-relaxed">
                        This tab runs a deterministic local probe against the current email fields. It never leaves the browser and gives you a quick offline verdict before or after the backend model runs.
                      </p>

                      <div className="space-y-4 pt-4">
                        <div className="p-5 rounded-2xl bg-stone-black/50 border border-stone-border space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest opacity-40">
                            <span>Inference Mode</span>
                            <span>Local only</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-acid-lime animate-pulse" />
                            <span>Ready to generate a local snapshot</span>
                          </div>
                          <p className="text-sm text-stone-white/60">
                            Model target: <span className="text-acid-lime">gpt-oss:120b-cloud</span>
                          </p>
                        </div>

                        <button
                          onClick={runLocalSnapshot}
                          className="w-full bg-acid-lime text-stone-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                          Run Local Snapshot
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      {localSnapshot ? (
                        <div className={`p-8 rounded-2xl border h-full flex flex-col justify-between ${localSnapshot.verdict === 'PHISHING' ? 'border-red-500/50 bg-red-500/5' : 'border-acid-lime/50 bg-acid-lime/5'}`}>
                          <div className="space-y-6">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Local Verdict</p>
                                <h3 className={`text-2xl font-bold ${localSnapshot.verdict === 'PHISHING' ? 'text-red-500' : 'text-acid-lime'}`}>
                                  {localSnapshot.verdict}
                                </h3>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${localSnapshot.risk === 'HIGH' ? 'bg-red-500 text-white' : localSnapshot.risk === 'MEDIUM' ? 'bg-amber-400 text-black' : 'bg-acid-lime text-black'}`}>
                                {localSnapshot.risk} RISK
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div className="p-4 rounded-xl bg-stone-black/40 border border-stone-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Score</p>
                                <p className="text-3xl font-bold mt-2">{localSnapshot.score}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-stone-black/40 border border-stone-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Model</p>
                                <p className="mt-2 text-sm text-stone-white/70 wrap-break-word">{localSnapshot.model}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-stone-black/40 border border-stone-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">Mode</p>
                                <p className="mt-2 text-sm text-stone-white/70">{localSnapshot.mode}</p>
                              </div>
                            </div>

                            <p className="text-xl serif italic wrap-break-word">"{localSnapshot.summary}"</p>

                            {localSnapshot.signals.length > 0 && (
                              <ul className="space-y-2">
                                {localSnapshot.signals.map((signal) => (
                                  <li key={signal.label} className="text-sm opacity-70 flex items-start gap-3">
                                    <span className="min-w-10 text-acid-lime font-mono text-[10px] uppercase tracking-widest">-{signal.impact}</span>
                                    <span>
                                      <span className="font-semibold">{signal.label}</span>
                                      <span className="block text-stone-white/50">{signal.note}</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-stone-black/30 border border-stone-border border-dashed rounded-2xl h-full flex flex-col justify-center items-center text-center space-y-4 p-12">
                          <Zap className="w-16 h-16 text-acid-lime opacity-10" />
                          <p className="text-xs font-mono opacity-20 uppercase tracking-widest">Ready for Local Inference</p>
                          <p className="text-sm text-stone-white/40 max-w-md">
                            Press the local snapshot button to generate a browser-side verdict and scoring breakdown.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
