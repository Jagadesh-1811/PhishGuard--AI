# PhishGuard AI — Phishing Email Detector

## What this app does
PhishGuard AI is an intelligent tool that uses Google Gemini AI to identify phishing attempts in emails. It offers two powerful modes:

### Mode 1 — Manual Analysis
Copy any suspicious email you've received and paste its details (sender, subject, and body) into the analysis form. PhishGuard AI will evaluate the content and provide a verdict (SAFE or PHISHING), a risk level, and a list of identified phishing signs.

### Mode 2 — Auto Inbox Monitor
Connect your Gmail account directly to PhishGuard AI. The app will automatically check your unread emails every few minutes. If a phishing attempt is detected, it will:
1.  Log the detection in the live dashboard.
2.  Send an immediate warning email to your Gmail address, alerting you not to interact with the suspicious message.

## Setup Steps

### Step 1: Get your Gemini API Key
1.  Go to [Google AI Studio](https://aistudio.google.com).
2.  Click on **"Get API Key"**.
3.  Copy your key.
4.  In this application's settings, add a secret named `GEMINI_API_KEY` with your key as the value.

### Step 2: Get Gmail App Password (for Auto Monitor)
To allow PhishGuard AI to securely access your Gmail without using your main password:
1.  Go to [myaccount.google.com](https://myaccount.google.com).
2.  Navigate to **Security**.
3.  Ensure **2-Step Verification** is turned ON.
4.  Search for **"App Passwords"**.
5.  Create a new app password (select "Mail" and "Other (Custom name)" like "PhishGuard").
6.  Copy the 16-character password provided.
7.  Enter this password in the "Auto Inbox Monitor" section of the app.

## Tech Stack
-   **Frontend:** Vanilla HTML, CSS, and JavaScript.
-   **Backend:** Node.js with Express and TypeScript.
-   **AI:** Google Gemini 1.5 Flash.
-   **Email Protocols:** IMAP (for reading) and SMTP (for sending alerts).

## Install and Run
```bash
npm install
npm run dev
```
Open: http://localhost:3000

## Security Note
Your Gmail App Password is used only for the current session and is not stored permanently in the application's environment variables for your safety.
