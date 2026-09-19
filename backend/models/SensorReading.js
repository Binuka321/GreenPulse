const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true
    },

    soilRaw: {
      type: Number,
      required: true
    },

    soilMoisture: {
      type: Number,
      required: true
    },

    temperature: {
      type: Number,
      required: true
    },

    humidity: {
      type: Number,
      required: true
    },

    motion: {
      type: Boolean,
      required: true
    },

    plantStatus: {
      type: String,
      required: true
    },

    predictedHours: Number,

    esp32Timestamp: {
      type: Number,
      default: null
    },

    receivedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "SensorReading",
  sensorReadingSchema
);