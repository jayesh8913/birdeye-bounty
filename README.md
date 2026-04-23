# Birdeye Alpha Terminal (v1.0.8)

A high-density technical terminal designed to identify early-stage liquidity momentum across Solana, Base, and Ethereum. This project was built to bridge the gap between raw on-chain data and actionable investment intelligence.

## 🚀 Overview

The **Alpha Terminal** isn't just a dashboard; it's a filtering engine. It aggregates real-time listing data from Birdeye V3 and applies a proprietary heuristic to score tokens based on **Liquidity Velocity** and **Trade Density**.

### Key Features
- **Super Feed Aggregator:** Real-time multi-chain scouting (SOL, BASE, ETH).
- **Signal Scoring (0-100):** Algorithmic ranking that prioritizes Volume-to-Liquidity ratios over generic price action.
- **LLM Reasoning Engine:** Integrated with Llama-3.3-70B (via Groq) to provide synchronous technical verdicts.
- **Security Heuristics:** Automated "High Trust" badges for tokens meeting specific holder distribution and trade volume thresholds.
- **One-Click Execution:** Direct deep-linking to Jupiter and Uniswap for immediate action.

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Data:** Birdeye V3 API
- **AI:** Groq Cloud (Llama-3.3-70B-Versatile)
- **Styling:** Tailwind CSS (Terminal Minimalist Theme)
- **Icons:** Lucide React

## ⚡️ Getting Started

1. **Clone & Install:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root:
   ```env
   BIRDEYE_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   ```

3. **Run Dev:**
   ```bash
   npm run dev
   ```

## 🧠 Logic & Strategy
The core engine uses a weighted scoring system:
- **40% Vol/Liq Ratio:** Detecting "Hidden" buy pressure.
- **30% Momentum:** Tracking 24h delta without falling for pump-and-dump spikes.
- **30% Density:** Measuring unique wallet participation to filter out bot-only wash trading.

---
*Built for the Birdeye Data Hackathon 2026. Designed for speed, precision, and alpha.*
