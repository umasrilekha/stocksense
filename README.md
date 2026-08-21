# StockSense

Inventory Decision Intelligence MVP

StockSense is an AI-assisted inventory decision system that helps businesses decide what action to take when inventory levels differ across locations.

## Problem

Businesses can have excess inventory at one location while another location faces a shortage.

This can lead to:
- Stockouts
- Excess inventory
- Unnecessary purchasing
- Higher inventory holding costs

## Solution

StockSense forecasts demand and compares four possible inventory actions:

- **BUY**
- **MOVE**
- **WAIT**
- **HOLD**

The system evaluates inventory risk, cost, and availability before recommending the best action.

## Core Flow

**Forecast → Risk → Compare → Recommend → Explain → Simulate**

## Features

- Demand forecasting
- Inventory risk detection
- Multi-location inventory analysis
- BUY / MOVE / WAIT / HOLD comparison
- Cost comparison
- What-if simulation
- Human approval workflow

## Tech Stack

- React
- FastAPI
- Python
- Pandas
- SQLite

## Running Locally

### Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Demo Scenario

The demo highlights a multi-location inventory imbalance between **Chennai** and **Bangalore** for **SKU-104**:
- **Chennai**: High 14-day forecasted demand (80 units) with low current stock (15 units) &rarr; Critical Stockout Shortage risk!
- **Bangalore**: High current inventory (160 units) with low local demand (30 units) &rarr; 130 excess units available.
- **StockSense Recommendation**: Recommends **MOVE** (transfer 65 units from Bangalore to Chennai), reducing lead time from 7 days (BUY) to 1.5 days (MOVE) and saving $632.50 in total operational cost.

## Limitations

- MVP uses sample data
- Forecasting depends on historical data
- Recommendations require human approval
- ERP integration is not included
