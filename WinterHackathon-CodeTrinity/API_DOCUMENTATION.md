# GreenPulse API Documentation
**Version:** 1.0.0
**Base URL:** `https://api.greenpulse.app/v1` (Mocked via `api.js` for Hackathon)

## Overview
This API allows external developers, government bodies, and verified partners to interact with the GreenPulse ecosystem. It supports offline-first capabilities via Firebase and includes AI-driven endpoints.

## Authentication
All requests require a Bearer Token in the header:
`Authorization: Bearer <firebase_id_token>`

## Endpoints

### 1. Reports (Citizen & Authority)

#### `GET /reports-list`
Fetch a paginated list of reports.
- **Parameters**: `lat`, `lng`, `radius`, `type`, `limit`, `page`
- **Response**:
```json
{
  "reports": [
    {
      "id": "rep_123",
      "type": "heat_hotspot",
      "location": { "lat": 12.97, "lng": 77.59 },
      "aiAnalysis": { "risk": "High", "confidence": 0.95 }
    }
  ]
}
```

#### `POST /reports-create`
Submit a new environmental report.
- **Body**:
```json
{
  "title": "Urban Heat Island",
  "description": "Lack of tree cover affecting temperature",
  "location": { "lat": 12.97, "lng": 77.59 },
  "imageUrl": "https://storage.googleapis.com/..."
}
```

### 2. AI Services (Gemini & Vision)

#### `POST /ai-analyze`
Trigger an on-demand analysis for an image or location.
- **Body**: `{ "imageUrl": "...", "reportType": "tree_loss" }`
- **Response**:
```json
{
  "speciesRecommendation": ["Neem", "Peepal"],
  "carbonOffsetPotential": "450 kg/year",
  "feasibilityScore": 88
}
```

### 3. Collaboration & Funding (CSR)

#### `POST /projects-fund`
Allocate CSR funds to an approved project.
- **Body**: `{ "projectId": "rep_123", "amount": 10000, "currency": "USD" }`
- **Response**: `{ "transactionId": "tx_999", "status": "processed" }`

## Error Handling
- **401 Unauthorized**: Invalid token
- **429 Too Many Requests**: Rate limit exceeded (Default: 100 req/min)
- **503 Service Unavailable**: Offline mode engaged (Client should cache)

## SDKs
- JavaScript/TypeScript: `npm install @greenpulse/sdk`
- Python: `pip install greenpulse-client`
