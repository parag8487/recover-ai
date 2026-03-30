# RecoverAI-Lite Backend
> Core Clinical API & Resource Provider

This backend service provides secure authentication and serves the Clinical Companion module for RecoverAI-Lite.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Real-time**: Socket.io
- **Storage**: JSON Memory Storage (Demo Mode)

## 🚀 API Endpoints
- `POST /api/auth/register`: Register new clinical users.
- `POST /api/auth/login`: Identity verification.
- `GET /api/auth/me`: Current session status.
- `STATIC /clinical_companion`: Serves the Clinical Companion frontend module.

## 🛠️ Setup
1. `npm install`
2. `npm start` (Runs on Port 5005)
