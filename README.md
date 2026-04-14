# PhishGuard AI — Phishing Email Detector

## What this app does
PhishGuard AI is an intelligent tool that uses local AI models (via Ollama) to identify phishing attempts in emails. It offers two powerful modes:

### Mode 1 — Manual Analysis
Copy any suspicious email you've received and paste its details (sender, subject, and body) into the analysis form. PhishGuard AI will evaluate the content and provide a verdict (SAFE or PHISHING), a risk level, and a list of identified phishing signs.

### Mode 2 — Auto Inbox Monitor
Connect your Gmail account directly to PhishGuard AI. The app will automatically check your unread emails every few minutes. If a phishing attempt is detected, it will:
1. Log the detection in the live dashboard.
2. Send an immediate warning email to your Gmail address, alerting you not to interact with the suspicious message.

## Setup Steps

### Step 1: Install Ollama
1. Download and install Ollama from [ollama.ai](https://ollama.ai)
2. Run: `ollama pull gpt-oss:120b-cloud` (or another model like `mistral`, `neural-chat`, `llama2`)
3. Start Ollama: `ollama serve`
4. This will run on `http://localhost:11434`

### Step 2: Get Gmail App Password (for Auto Monitor)
To allow PhishGuard AI to securely access your Gmail:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security**
3. Ensure **2-Step Verification** is turned ON
4. Search for **"App Passwords"**
5. Create a new app password (select "Mail" and "Other (Custom name)" like "PhishGuard")
6. Copy the 16-character password provided
7. Enter this password in the "Auto Inbox Monitor" section of the app

## Tech Stack
- **Frontend:** React (TypeScript) with Vite
- **Backend:** Node.js with Express and TypeScript
- **AI:** Ollama (Local LLM - gpt-oss:120b-cloud)
- **Email Protocols:** IMAP (for reading) and SMTP (for sending alerts)

## Install and Run

### Prerequisites
- Node.js (v18+)
- Ollama installed and running

### Steps
```bash
# Install dependencies
npm install


# Run the dev server
npm run dev
```
Open: http://localhost:3000


## Security Note
- Your Gmail App Password is used only for the current session and is not stored permanently for your safety.
- Ollama runs locally, so no data is sent to external servers.
- Model runs entirely on your machine - full privacy and control.

## Repository
GitHub: https://github.com/Jagadesh-1811/phisingguradai
