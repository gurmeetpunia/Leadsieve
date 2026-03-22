# Leadsieve

Turn public noise into product intelligence.

## Quick Start

### Prerequisites

- Node.js 16+
- Python 3.9+

### Local Development

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start NLP engine (Terminal 1)
python nlp_engine.py

# Start backend server (Terminal 2)
node server.js

# Start frontend (Terminal 3)
cd client && npm run dev
```

Then visit `http://localhost:5173`

## Deployment

Deploy to **Vercel** (Frontend) and **Railway** (Backend + ML):

👉 **[See Full Deployment Guide](DEPLOYMENT.md)**

Quick summary:

- **Frontend**: Hosted on Vercel
- **Backend**: Node.js express server on Railway
- **ML Engine**: Python/Flask microservice on Railway
