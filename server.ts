import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Ollama Configuration
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// Global State
let monitorLogs: any[] = [];
let monitorRunning = false;
let monitorCredentials: any = {};
let monitorTimeout: NodeJS.Timeout | null = null;

// Helper: Analyze with Ollama (local model)
async function analyzeWithOllama(sender: string, subject: string, body: string) {
    const prompt = `You are a cybersecurity expert. Analyze this email for phishing:

Sender: ${sender}
Subject: ${subject}
Body: ${body}

Reply ONLY with JSON (no other text):
{
  "verdict": "YES" or "NO",
  "risk": "HIGH" or "MEDIUM" or "LOW",
  "reason": "one sentence why",
  "signs": ["sign1", "sign2"]
}`;

    try {
        console.log("Sending to Ollama at http://localhost:11434/api/generate with model: gpt-oss:120b-cloud");
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-oss:120b-cloud',
                prompt: prompt,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ollama Response Status:", response.status, response.statusText);
            console.error("Ollama Response Body:", errorText);
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Ollama raw response:", data.response);
        
        // Extract JSON from response
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
                console.error("Attempted to parse:", jsonMatch[0]);
            }
        }
        
        // If no JSON found, create safe default response
        console.warn("No valid JSON found in response, using safe default");
        return {
            verdict: "NO",
            risk: "LOW",
            reason: "Analysis completed with fallback (invalid model response format)",
            signs: []
        };
    } catch (error) {
        console.error("Ollama Error:", error);
        return {
            verdict: "NO",
            risk: "LOW",
            reason: "Local AI analysis failed, assuming safe.",
            signs: []
        };
    }
}

// Helper: Send Warning Email
async function sendWarningEmail(toEmail: string, origSender: string, origSubject: string, risk: string, reason: string) {
    try {
        if (!monitorCredentials.email || !monitorCredentials.password) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: monitorCredentials.email,
                pass: monitorCredentials.password
            }
        });

        const mailOptions = {
            from: monitorCredentials.email,
            to: toEmail,
            subject: "⚠️ PHISHING ALERT — Suspicious Email Detected",
            text: `
PhishGuard AI detected a phishing email in your inbox.

Original Sender: ${origSender}
Original Subject: ${origSubject}
Risk Level: ${risk}
Reason: ${reason}

⚠️ DO NOT click any links in that email.
⚠️ DO NOT reply to that email.
⚠️ DO NOT provide any personal information.

Detected at: ${new Date().toLocaleString()}
— PhishGuard AI
`
        };

        await transporter.sendMail(mailOptions);
        console.log("Warning email sent to", toEmail);
    } catch (error) {
        console.error("Warning email failed:", error);
    }
}

// Helper: Run Monitor
async function runMonitor() {
    if (!monitorRunning) return;

    console.log("Starting monitor check...");
    const imap = new Imap({
        user: monitorCredentials.email,
        password: monitorCredentials.password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    });

    function openInbox(cb: any) {
        imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', () => {
        openInbox((err: any, box: any) => {
            if (err) {
                console.error("IMAP Error:", err);
                monitorLogs.push({
                    time: new Date().toLocaleTimeString(),
                    sender: "SYSTEM",
                    subject: "IMAP Error: " + err.message,
                    verdict: "ERROR",
                    risk: "—",
                    reason: ""
                });
                imap.end();
                return;
            }

            imap.search(['UNSEEN'], (err: any, results: any) => {
                if (err) {
                    console.error("Search Error:", err);
                    imap.end();
                    return;
                }

                if (!results || results.length === 0) {
                    console.log("No new emails.");
                    imap.end();
                    return;
                }

                const f = imap.fetch(results, { bodies: '' });
                f.on('message', (msg: any, seqno: any) => {
                    msg.on('body', (stream: any, info: any) => {
                        simpleParser(stream, async (err: any, parsed: any) => {
                            if (err) return;
                            
                            const sender = parsed.from?.text || "Unknown Sender";
                            const subject = parsed.subject || "(No Subject)";
                            const body = parsed.text || parsed.html?.replace(/<[^>]+>/g, '') || "";
                            
                            const result = await analyzeWithOllama(sender, subject, body.substring(0, 3000));
                            
                            const logEntry = {
                                time: new Date().toLocaleTimeString(),
                                sender: sender.substring(0, 40),
                                subject: subject.substring(0, 50),
                                verdict: result.verdict,
                                risk: result.risk,
                                reason: result.reason
                            };
                            
                            monitorLogs.push(logEntry);
                            if (monitorLogs.length > 50) monitorLogs.shift();
                            
                            if (result.verdict === 'YES') {
                                await sendWarningEmail(monitorCredentials.email, sender, subject, result.risk, result.reason);
                            }
                        });
                    });
                });

                f.once('error', (err: any) => {
                    console.error('Fetch error:', err);
                });

                f.once('end', () => {
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });
    });

    imap.once('error', (err: any) => {
        console.error("IMAP Connection Error:", err);
        monitorLogs.push({
            time: new Date().toLocaleTimeString(),
            sender: "SYSTEM",
            subject: "Connection Error: " + err.message,
            verdict: "ERROR",
            risk: "—",
            reason: ""
        });
    });

    imap.once('end', () => {
        console.log('IMAP connection ended.');
        if (monitorRunning) {
            const interval = (monitorCredentials.interval || 5) * 60 * 1000;
            monitorTimeout = setTimeout(runMonitor, interval);
        }
    });

    imap.connect();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/analyze', async (req, res) => {
    const { sender, subject, body } = req.body;
    if (!sender || !subject || !body) {
        return res.status(400).json({ detail: "Please fill in all fields" });
    }

    try {
        const result = await analyzeWithOllama(sender, subject, body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ detail: "AI analysis failed: " + error.message });
    }
});

app.post('/api/monitor/start', async (req, res) => {
    const { email, password, interval } = req.body;
    let responseSent = false;
    
    // Test connection
    const imap = new Imap({
        user: email,
        password: password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
        imap.end();
        if (!responseSent) {
            responseSent = true;
            monitorCredentials = { email, password, interval };
            monitorRunning = true;
            runMonitor();
            res.json({ status: "started" });
        }
    });

    imap.once('error', (err: any) => {
        if (!responseSent) {
            responseSent = true;
            res.status(401).json({ detail: "Login failed. Check Gmail address and App Password." });
        }
    });

    imap.connect();
});

app.post('/api/monitor/stop', (req, res) => {
    monitorRunning = false;
    if (monitorTimeout) clearTimeout(monitorTimeout);
    res.json({ status: "stopped" });
});

app.get('/api/monitor/logs', (req, res) => {
    res.json({ logs: monitorLogs.slice(-20) });
});

app.post('/api/send-warning', async (req, res) => {
    const { sender, subject, risk, reason } = req.body;
    try {
        await sendWarningEmail(monitorCredentials.email, sender, subject, risk, reason);
        res.json({ status: "sent" });
    } catch (error: any) {
        res.status(500).json({ detail: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});
