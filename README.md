# PhishGuard AI — Forensic Phishing Intelligence

PhishGuard AI is a high-performance, local-first phishing detection suite. It combines the power of local Large Language Models (via Ollama) with deterministic heuristic analysis to provide a comprehensive defense against modern email-based threats.

##  Core Capabilities

### 1. Manual Forensic Deconstruction
Directly analyze suspicious email headers and bodies. Our local `gpt-oss` model performs deep linguistic analysis to identify social engineering tactics, coercive language, and authoritative impersonation.
- **Verdict Engine**: Real-time classification (SAFE vs PHISHING).
- **Risk Assessment**: Immediate tiering (LOW, MEDIUM, HIGH).
- **Signal Tracking**: Itemized list of detected threat indicators.

### 2. Live Inbox Surveillance
Establish an encrypted bridge to your Gmail inbox. PhishGuard AI monitors unread correspondence in the background without sending any data to the cloud.
- **Auto-Monitoring**: Polling-based scan of unread messages.
- **Active Response**: Automatically sends warning alerts to your inbox when a threat is identified.
- **Security Logs**: A real-time audit trail of all scanned emails and their verdicts.

### 3. Weighted Security Scoring
The Intelligence Dashboard features a weighted scoring engine that converts complex model outputs into a single, readable metric (0-100).
- **Impact Analysis**: See exactly which factors (Urgent Language, Financial Triggers, Credential Bait) are driving the risk score.
- **Local Heuristics**: Secondary browser-side verification for offline reliability.

## Setup & Deployment

### Prerequisites
- **Node.js** (v18+)
- **Ollama** installed and running

### Step 1: Initialize Local AI
1. Download Ollama from [ollama.ai](https://ollama.ai).
2. Pull the forensic model:
   ```bash
   ollama pull gpt-oss:120b-cloud
   ```
3. Ensure the server is active:
   ```bash
   ollama serve
   ```

### Step 2: Configure Gmail Access (Optional)
To enable the **Live Monitor**, you must generate a Google App Password:
1. Navigate to [myaccount.google.com](https://myaccount.google.com) > Security.
2. Enable **2-Step Verification**.
3. Search for **"App Passwords"** and generate one for PhishGuard.
4. Use this 16-character token in the "Live Monitor" tab.

### Step 3: Launch Application
```bash
# Install dependencies
npm install

# Start development environment (Frontend + Backend)
npm run dev
```
Dashboard available at: `http://localhost:3000`

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion.
- **Backend**: Node.js, Express, TSX.
- **Inference**: Ollama (gpt-oss:120b-cloud).
- **Protocols**: IMAP (Surveillance) & SMTP (Alerts).

## Privacy & Security
- **Zero Cloud Footprint**: All AI inference happens on your local hardware.
- **Ephemeral Credentials**: App Passwords are used solely for session handshakes and are never persisted to a database.
- **Data Sovereignty**: Analyzed email content is processed in-memory and discarded.

---
Developed by [Jagadesh](https://github.com/Jagadesh-1811)
