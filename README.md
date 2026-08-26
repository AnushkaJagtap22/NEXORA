# RecoverX — Autonomous AI Revenue Recovery Agent

RecoverX is a bounded autonomous revenue recovery agent designed for merchants. Built for the **Razorpay Buildathon (AI Revenue Recovery track)**, RecoverX detects revenue at risk, predicts recovery probabilities using machine learning, evaluates intervention expected values, enforces deterministic financial policy safety checks, executes interventions via Razorpay Test Mode APIs, maintains immutable audit trails, and provides a real-time fintech command center frontend.

---

## System Architecture

```text
React Frontend (Vite + Tailwind CSS + Recharts)
                      │
                      ▼
        Node.js + Express API Backend
         │                      │
         ▼                      ▼
  MongoDB Database      Python ML Service (FastAPI)
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
           AI Recovery Agent
                    │
                    ▼
          Deterministic Policy Engine
          ┌─────────┴─────────┐
          │                   │
        ALLOW               BLOCK
          │                   │
          ▼                   ▼
    Razorpay APIs       Human Review
          │
          ▼
   Razorpay Webhook ──► Event Processor ──► MongoDB Audit Log
```

---

## Core Features & System Capabilities

1. **Revenue Command Center**: Real-time KPI dashboard displaying Revenue at Risk, Revenue Recovered, Recovery Rate, Net Recovery Revenue, Recovery Funnel, and Intervention breakdown.
2. **Synthetic Dataset**: 10,000 realistic transaction records with realistic correlations across payment methods, failure reasons, customer lifetime values, historical success/failure ratio, and checkout attempts.
3. **ML Prediction Engine**: Trained classifier evaluating recovery probabilities with held-out test split metrics (Precision, Recall, F1, ROC-AUC, Confusion Matrix).
4. **Deterministic Policy Engine**: Bounded financial safety layer enforcing max automatic amount limits (₹10,000), retry caps, discount limits, customer contact cooldowns, and human review thresholds.
5. **Expected Recovery Value ($EV$) Optimization**: Evaluates 6 candidate interventions ($EV = P_{recovery} \times Amount - Cost - Discount$) to maximize merchant financial recovery.
6. **Razorpay Test Mode Integration**: Orders, Payments, Payment Links, Cancel Links with graceful API failure simulation mode.
7. **Webhook Verification & Idempotency**: HMAC SHA256 signature verification with duplicate event protection via MongoDB WebhookEvent store.
8. **Immutable Audit Trail & Timeline UI**: Verifiable log of every agent action, policy check, Razorpay reference, and step-by-step transaction recovery timeline.

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (running on `mongodb://127.0.0.1:27017` or using standard local URI)

---

### 1. Python ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt

# Generate synthetic dataset (10,000 records)
python data/generate_dataset.py

# Train recovery prediction model
python training/train_model.py

# Start FastAPI ML Service
uvicorn app.main:app --port 8000 --reload
```

---

### 2. Express Backend API Setup
```bash
cd backend
npm install

# Seed MongoDB with initial transactions & policies
node ../scripts/seed-data.js

# Start Express Backend Server
npm start
```

---

### 3. React Frontend Setup
```bash
cd frontend
npm install

# Start Vite Development Server
npm run dev
```

Open `http://localhost:3000` in your browser to access the **RecoverX Revenue Command Center**.

---

## REST API Endpoints

- `GET  /api/dashboard`: Summary revenue telemetry & real-time metrics
- `GET  /api/transactions`: Searchable & filterable transaction list
- `GET  /api/transactions/:id`: Transaction details & timeline
- `POST /api/recovery/:id/approve`: Merchant manual approval for blocked actions
- `POST /api/recovery/:id/reject`: Merchant manual rejection
- `GET  /api/policies` & `PUT /api/policies`: Get/update merchant policy rules
- `GET  /api/audit`: Immutable audit trail records
- `POST /api/simulation/run`: Execute batch recovery simulation
- `POST /api/webhooks/razorpay`: Razorpay webhook listener with signature verification
