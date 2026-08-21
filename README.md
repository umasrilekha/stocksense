# StockSense

## Inventory Decision Intelligence MVP

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

## Project Structure

```text
stocksense/
│
├── backend/
├── frontend/
├── data/
├── screenshots/
├── README.md
└── .gitignore
