 Market Oracle

**AI-Powered Market Interpretation & Trend Analysis Platform**

Market Oracle is a full-stack web application that performs **automated technical market analysis** on major financial indices using real market data and AI-driven interpretation.
It is designed to convert raw indicators into **human-readable market insight**, not trading advice.

---

## 🚀 Features

* 📊 **Automated Market Analysis Pipeline**

  * Fetches historical OHLCV market data
  * Computes technical indicators (RSI, SMA, ATR)
  * Generates structured market summaries
  * Produces AI-based interpretation of signals

* 🧠 **AI Interpretation Layer**

  * Directional bias (Bullish / Bearish / Neutral)
  * Market regime classification
  * Volatility assessment
  * Risk factors & confidence blockers
  * Natural-language explanation for clarity

* 🎯 **Supported Indices**

  * S&P 500 (SPY)
  * NASDAQ-100 (QQQ)
  * Dow Jones Industrial Average (DJI)

* 🛡️ **Clean UX & Transparency**

  * Validation status for missing/unknown signals
  * Clear uncertainty assessment
  * Explicit disclaimer (non-advisory)

---

## 🧱 Architecture Overview

```
Frontend (React + Vite)
        ↓
Supabase Edge Functions
        ↓
Market Data Fetching
        ↓
Technical Indicator Computation
        ↓
Structured Market Summary
        ↓
AI Interpretation (LLM)
```

---

## 🛠️ Tech Stack

**Frontend**

* Vite
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

**Backend**

* Supabase Edge Functions (Deno)
* Market data pipeline (OHLCV)
* Indicator computation (RSI, SMA, ATR)

**AI**

* LLM-based interpretation via secure API
* Prompt-driven structured responses

---

## 📂 Project Structure

```
src/
 ├─ components/        # UI components
 ├─ pages/             # App pages
 ├─ lib/               # Analysis & utility logic
 ├─ integrations/      # Supabase client
 └─ main.tsx

supabase/
 ├─ functions/
 │   ├─ fetch-market-data
 │   ├─ compute-indicators
 │   ├─ generate-market-summary
 │   └─ analyze-market
 └─ config.toml
```

---

## ⚙️ Local Development

### Prerequisites

* Node.js (18+ recommended)
* npm

### Setup

```bash
git clone https://github.com/manassanjaymishra24/Market-Oracle.git
cd Market-Oracle
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Fill in required environment variables.

### Run locally

```bash
npm run dev
```

---

## 🌍 Deployment

Deployment is handled via **Lovable**.

1. Open the project on Lovable
2. Click **Share → Publish**
3. (Optional) Connect a custom domain via:

   ```
   Project → Settings → Domains
   ```

---

## 🔐 Environment Variables

This project uses environment variables for API keys and backend services.

* `.env` → **never committed**
* `.env.example` → template for setup

---

## ⚠️ Disclaimer

> **This project is for informational and educational purposes only.**
> It does **not** constitute financial or investment advice.
> AI outputs represent interpretations, not predictions.
> Human judgment is always final.

---
## 📸 Application Screenshots

### Dashboard Overview
![Dashboard](screenshots/dashboard.png)

### Market Outlook Summary
![Market Outlook](screenshots/market outlook.png)

### AI Market Analysis
![Analysis](screenshots/analysis.png)

### Technical Indicators
![Indicators](screenshots/indicators.png)

### Uncertainty-Aware Reasoning
![Uncertainty](screenshots/uncertainty.png)

## 🚧 Deployment Status

This project is not publicly deployed due to limited market coverage and external data constraints.
All core functionality, UI flows, and AI-driven analysis are demonstrated in the screenshots above.


## 👤 Author

**Manas Sanjay Mishra**
Engineering Student | Full-Stack Developer
GitHub: [https://github.com/manassanjaymishra24](https://github.com/manassanjaymishra24)

---

## ⭐ Why This Project Matters

Market Oracle demonstrates:

* End-to-end system design
* Data → logic → AI → UX pipeline
* Real-world use of AI beyond chatbots
* Clean separation of concerns
* Production-ready Git workflow




