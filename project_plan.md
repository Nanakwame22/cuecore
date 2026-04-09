# CueCore — AI-Powered Trading Intelligence Platform

## 1. Project Description
CueCore is an institutional-grade AI trading intelligence platform that analyzes real-time market data and generates structured, high-confidence trade cues (BUY, SELL, HOLD). It targets professional traders, quant analysts, and institutional desks who need signal clarity, not noise. The design language is dark, data-dense, and precision-focused — inspired by Palantir and Datadog.

**Target Users:** Professional traders, quant analysts, hedge fund operators, institutional desks  
**Core Value:** Replace manual signal hunting with AI-generated, confidence-scored trade cues backed by multi-factor analysis

---

## 2. Page Structure
- `/` — Marketing Landing Page (hero, features, how it works, pricing, CTA)
- `/dashboard` — Intelligence Dashboard (live cue feed, market overview, watchlist)
- `/cues` — Trade Cues Explorer (filterable list of all active/historical cues)
- `/cue/:id` — Cue Detail View (full breakdown: indicators, sentiment, risk/reward)
- `/analytics` — Portfolio Analytics (performance tracking, win rate, drawdown)
- `/pricing` — Pricing & Plans

---

## 3. Core Features
- [ ] Marketing landing page with hero, features, social proof, pricing
- [ ] Intelligence Dashboard with live trade cue feed
- [ ] Trade cue cards (BUY/SELL/HOLD with confidence score, asset, timeframe)
- [ ] Cue detail view with multi-factor breakdown (technicals, volume, sentiment, R/R)
- [ ] Market overview panel (top movers, sector heatmap)
- [ ] Watchlist management
- [ ] Filtering and sorting of cues by asset class, confidence, timeframe
- [ ] Analytics page with performance metrics
- [ ] Pricing page with plan tiers

---

## 4. Data Model Design
(No Supabase connected — using mock data for all phases)

### Trade Cue
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique cue ID |
| asset | string | Ticker symbol (e.g. BTC, AAPL) |
| direction | BUY/SELL/HOLD | Trade direction |
| confidence | number (0-100) | AI confidence score |
| timeframe | string | 1H, 4H, 1D, 1W |
| entry | number | Suggested entry price |
| target | number | Price target |
| stopLoss | number | Stop loss level |
| riskReward | number | R/R ratio |
| indicators | object | RSI, MACD, Volume, Sentiment scores |
| timestamp | datetime | When cue was generated |
| status | active/expired/hit | Cue status |

---

## 5. Backend / Third-party Integration Plan
- Supabase: Not needed for Phase 1-3 (mock data). Future: user auth, saved watchlists, cue history
- Shopify: Not applicable
- Stripe: Future phase — subscription billing for Pro/Enterprise tiers
- Others: Future — real-time market data API (e.g. Polygon.io, Alpaca)

---

## 6. Development Phase Plan

### Phase 1: Marketing Landing Page
- Goal: Build the public-facing landing page that communicates CueCore's value proposition
- Deliverable: Full landing page with hero, features, how-it-works, stats, pricing, CTA sections

### Phase 2: Intelligence Dashboard
- Goal: Build the main app dashboard with live cue feed, market overview, and watchlist
- Deliverable: `/dashboard` page with mock data, cue cards, market panels

### Phase 3: Trade Cue Detail & Cues Explorer
- Goal: Build the cue detail view and filterable cues list
- Deliverable: `/cues` and `/cue/:id` pages with full breakdown UI

### Phase 4: Analytics Page
- Goal: Build performance analytics with charts and metrics
- Deliverable: `/analytics` page with win rate, P&L curve, drawdown stats
