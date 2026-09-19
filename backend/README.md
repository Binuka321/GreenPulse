# GreenPulse - Smart Agentic IoT Plant-Care System

GreenPulse is an advanced IoT-enabled plant monitoring and care system designed to help users maintain optimal indoor growing conditions. The system combines environmental sensors, secure cloud MQTT communication, an LLM-powered backend, and a modern React dashboard.

## Architecture & Tech Stack

* **Frontend:** React, Vite, Recharts, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Cloud NoSQL)
* **AI Integration:** Groq API for predictive watering forecasts and conversational plant care
* **IoT & Messaging:** MQTT protocol via HiveMQ Cloud / managed broker

## Key Features

* **Real-Time Sensor Monitoring:** Tracks soil moisture, ambient temperature, humidity, and motion.
* **Dynamic Health Scoring:** Automatically computes a plant health score and updates interface alerts based on live thresholds.
* **Predictive Watering Forecasts:** Uses AI to estimate hours until the next required watering event.
* **Weather Integration:** Compares internal metrics with external meteorological data.
* **Interactive AI Care Assistant:** Answers user queries using live sensor context.

## Project Structure

```text
GreenPulse/
├── backend/
│   ├── models/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
    └── package.json
```

## Setup and Installation

### Prerequisites
* Node.js installed on your machine
* MongoDB Atlas account or local MongoDB instance

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder with your configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
MQTT_BROKER_URL=mqtt://broker.hivemq.com
```
Start the backend server:
```bash
npm start
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```
Start the React development server:
```bash
npm run dev
```

### 3. Testing and Simulation
Publish JSON payloads to your MQTT topic (`greenpulse/sensors`) via Node-RED or an MQTT client to test real-time dashboard updates, automated health scoring, and AI insights.
```json
{
    "deviceId": "GreenPulse",
    "soilRaw": 3200,
    "soilMoisture": 30,
    "temperature": 28.5,
    "humidity": 85,
    "motion": true,
    "plantStatus": "WATER"
}
```