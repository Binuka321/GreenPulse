// ============================================================
// GREENPULSE BACKEND
// MQTT + MongoDB + REST API
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");
const axios = require("axios");

// MongoDB model
const SensorReading = require("./models/SensorReading");
const WateringLog = require("./models/WateringLog");

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = process.env.PORT || 5000;

const MQTT_HOST = process.env.MQTT_HOST || "mqtt://127.0.0.1";
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const MQTT_TOPIC =
  process.env.MQTT_TOPIC || "greenpulse/sensors";

const MONGODB_URI = process.env.MONGODB_URI;

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});


// ============================================================
// EXPRESS
// ============================================================

const app = express();

app.use(cors());
app.use(express.json());

// ============================================================
// LATEST SENSOR DATA
// ============================================================

let latestSensorData = null;

let mqttConnected = false;
let mongoConnected = false;

// ============================================================
// MONGODB CONNECTION
// ============================================================

async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing from .env");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);

    mongoConnected = true;

    console.log();
    console.log("=================================");
    console.log("       MONGODB CONNECTED");
    console.log("=================================");
    console.log("Database: greenpulse");
    console.log();

  } catch (error) {
    mongoConnected = false;

    console.error();
    console.error("❌ MongoDB connection failed");
    console.error("---------------------------------");
    console.error(error.message);
    console.error("---------------------------------");
  }
}

// ============================================================
// MQTT CONNECTION
// ============================================================

const mqttUrl = `${MQTT_HOST}:${MQTT_PORT}`;

console.log("=================================");
console.log("       GREENPULSE BACKEND");
console.log("=================================");
console.log("MQTT Server:", MQTT_HOST);
console.log("MQTT Port:", MQTT_PORT);
console.log("MQTT Topic:", MQTT_TOPIC);
console.log();

const mqttClient = mqtt.connect(mqttUrl, {
  clientId: `greenpulse-backend-${Date.now()}`,
  clean: true,
  connectTimeout: 10000,
  keepalive: 30,
  reconnectPeriod: 5000
});

// ============================================================
// MQTT CONNECT
// ============================================================

mqttClient.on("connect", () => {
  mqttConnected = true;

  console.log();
  console.log("=================================");
  console.log("        MQTT CONNECTED");
  console.log("=================================");

  mqttClient.subscribe(MQTT_TOPIC, (error) => {
    if (error) {
      console.error("❌ MQTT subscription failed:");
      console.error(error.message);
      return;
    }

    console.log("Subscribed to:", MQTT_TOPIC);
    console.log("Waiting for ESP32 sensor data...");
    console.log();
  });
});

// ============================================================
// MQTT RECONNECT
// ============================================================

mqttClient.on("reconnect", () => {
  console.log("Attempting MQTT reconnect...");
});

// ============================================================
// MQTT CLOSE
// ============================================================

mqttClient.on("close", () => {
  mqttConnected = false;

  console.log("MQTT connection closed");
});

// ============================================================
// MQTT OFFLINE
// ============================================================

mqttClient.on("offline", () => {
  mqttConnected = false;

  console.log("MQTT client offline");
});

// ============================================================
// MQTT ERROR
// ============================================================

mqttClient.on("error", (error) => {
  console.error("❌ MQTT Error:", error.message);
});

// ============================================================
// MQTT MESSAGE
// ============================================================

mqttClient.on("message", async (topic, message) => {

  console.log();
  console.log("=================================");
  console.log("       SENSOR DATA RECEIVED");
  console.log("=================================");

  console.log("Topic:", topic);

  const rawMessage = message.toString();

  console.log("Raw MQTT Message:");
  console.log(rawMessage);

  // ----------------------------------------------------------
  // Parse JSON
  // ----------------------------------------------------------

  let sensorData;

  try {
    sensorData = JSON.parse(rawMessage);
  } catch (error) {

    console.error();
    console.error("❌ Invalid MQTT JSON data");
    console.error("Error:", error.message);
    console.error("Message:", rawMessage);

    return;
  }

  // ----------------------------------------------------------
  // Validate basic fields
  // ----------------------------------------------------------

  if (!sensorData.deviceId) {
    console.error("❌ Missing deviceId");
    return;
  }

  // ----------------------------------------------------------
  // 1. Generate AI Alert & Prediction FIRST (so variables exist)
  // ----------------------------------------------------------
  let predictedHoursValue = null;
  let aiQuoteText = "System operating normally.";

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=6.9271&lon=79.8612&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherSummary = `${weatherResponse.data.weather[0].description}, ${weatherResponse.data.main.temp}°C`;

    const prompt = `
    Indoor Plant Status: Soil Moisture ${sensorData.soilMoisture}%, Temp ${sensorData.temperature}°C. 
    Weather: ${weatherSummary}. 
    
    You are an AI plant care agent. Based on the soil moisture, estimate how many hours until the plant needs water (assume it needs water at 30%). 
    
    Respond ONLY with a valid JSON object in this exact format:
    {
      "quote": "A 1-sentence literature-style quote about the plant's health.",
      "hoursUntilWater": 12
    }
  `;

    const aiResponse = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(aiResponse.choices[0].message.content);

    aiQuoteText = aiData.quote;
    predictedHoursValue = aiData.hoursUntilWater;

    console.log("AI Quote:", aiQuoteText);
    console.log("Predicted hours until water:", predictedHoursValue);

    mqttClient.publish("greenpulse/alerts", JSON.stringify({ quote: aiQuoteText }));
  } catch (aiError) {
    console.error("❌ AI Generation failed:", aiError.message);
  }

  // ----------------------------------------------------------
  // 2. Store latest data in memory (now variables are available)
  // ----------------------------------------------------------

  latestSensorData = {
    deviceId: sensorData.deviceId,
    soilRaw: sensorData.soilRaw ?? null,
    soilMoisture: sensorData.soilMoisture ?? null,
    temperature: sensorData.temperature ?? null,
    humidity: sensorData.humidity ?? null,
    motion: sensorData.motion ?? false,
    plantStatus: sensorData.plantStatus ?? "UNKNOWN",
    predictedHours: predictedHoursValue,
    esp32Timestamp: sensorData.timestamp ?? null,
    receivedAt: new Date()
  };

  // ----------------------------------------------------------
  // Display parsed data
  // ----------------------------------------------------------

  console.log();
  console.log("Parsed Sensor Data");
  console.log("---------------------------------");
  console.log("Device ID:", latestSensorData.deviceId);
  console.log("Soil Raw:", latestSensorData.soilRaw);
  console.log("Soil Moisture:", latestSensorData.soilMoisture + "%");
  console.log("Temperature:", latestSensorData.temperature + " °C");
  console.log("Humidity:", latestSensorData.humidity + "%");
  console.log("Motion:", latestSensorData.motion);
  console.log("Plant Status:", latestSensorData.plantStatus);
  console.log("Predicted Hours:", latestSensorData.predictedHours);
  console.log("ESP32 Timestamp:", latestSensorData.esp32Timestamp);
  console.log("Received At:", latestSensorData.receivedAt.toISOString());
  console.log("---------------------------------");
  console.log("✓ Sensor data stored in memory");

  // ----------------------------------------------------------
  // Save to MongoDB
  // ----------------------------------------------------------

  if (!mongoConnected) {
    console.log("⚠ MongoDB is not connected. Data not saved.");
    return;
  }

  try {
    const reading = new SensorReading({
      deviceId: latestSensorData.deviceId,
      soilRaw: latestSensorData.soilRaw,
      soilMoisture: latestSensorData.soilMoisture,
      temperature: latestSensorData.temperature,
      humidity: latestSensorData.humidity,
      motion: latestSensorData.motion,
      plantStatus: latestSensorData.plantStatus,
      predictedHours: latestSensorData.predictedHours,
      esp32Timestamp: latestSensorData.esp32Timestamp,
      receivedAt: latestSensorData.receivedAt
    });

    await reading.save();
    console.log("✓ Sensor data stored in MongoDB");

  } catch (error) {
    console.error();
    console.error("❌ MongoDB save failed:");
    console.error(error.message);
  }

  console.log();
});

// ============================================================
// GET /
// ============================================================

app.get("/", (req, res) => {

  res.json({
    system: "GreenPulse Backend",
    version: "1.0.0",

    status: "running",

    mqtt: {
      connected: mqttConnected,
      broker: mqttUrl,
      topic: MQTT_TOPIC
    },

    mongodb: {
      connected: mongoConnected,
      database: "greenpulse"
    },

    latestSensorData
  });

});

// ============================================================
// GET LATEST SENSOR DATA
// ============================================================

app.get("/api/sensors/latest", (req, res) => {

  if (!latestSensorData) {

    return res.status(404).json({
      success: false,
      message: "No sensor data received yet"
    });

  }

  res.json({
    success: true,
    data: latestSensorData
  });

});

// ============================================================
// GET SENSOR HISTORY
// ============================================================

app.get("/api/sensors/history", async (req, res) => {

  try {

    let limit =
      parseInt(req.query.limit) || 100;

    // Prevent excessive database queries
    if (limit > 1000) {
      limit = 1000;
    }

    if (limit < 1) {
      limit = 1;
    }

    const readings = await SensorReading
      .find()
      .sort({
        receivedAt: -1
      })
      .limit(limit);

    res.json({
      success: true,
      count: readings.length,
      data: readings
    });

  } catch (error) {

    console.error(
      "History API error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve sensor history"
    });

  }

});

// ============================================================
// GET MQTT STATUS
// ============================================================

app.get("/api/mqtt/status", (req, res) => {

  res.json({
    success: true,

    connected: mqttConnected,

    broker: mqttUrl,

    topic: MQTT_TOPIC
  });

});

// ============================================================
// GET DATABASE STATUS
// ============================================================

app.get("/api/database/status", (req, res) => {

  res.json({
    success: true,

    connected: mongoConnected,

    database: "greenpulse",

    state: mongoose.connection.readyState
  });

});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {

  res.json({
    success: true,

    backend: "online",

    mqtt: mqttConnected
      ? "connected"
      : "disconnected",

    mongodb: mongoConnected
      ? "connected"
      : "disconnected",

    timestamp: new Date().toISOString()
  });

});

// ============================================================
// WATERING LOGS
// ============================================================

app.get("/api/watering", async (req, res) => {
  try {
    const logs = await WateringLog.find().sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

app.post("/api/watering", async (req, res) => {
  try {
    const newLog = new WateringLog();
    await newLog.save();
    res.json({ success: true, data: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save log" });
  }
});

// ============================================================
// AI CHATBOT (User Interaction Bonus)
// ============================================================

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!latestSensorData) {
      return res.status(400).json({ 
        success: false, 
        message: "No sensor data available yet. Please inject a payload from Node-RED." 
      });
    }

    const prompt = `
      You are GreenPulse, a helpful AI plant care assistant. 
      Current Plant Status: Soil Moisture ${latestSensorData.soilMoisture}%, Temperature ${latestSensorData.temperature}°C, Humidity ${latestSensorData.humidity}%.
      The user asks: "${question}"
      Answer briefly (1-2 sentences) and directly based on the live plant status.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ 
      success: true, 
      answer: aiResponse.choices[0].message.content 
    });

  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({ success: false, message: "AI failed to respond." });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log();

  // Connect MongoDB
  connectMongoDB();

});