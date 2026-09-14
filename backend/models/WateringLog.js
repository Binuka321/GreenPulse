const mongoose = require("mongoose");

const wateringLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WateringLog", wateringLogSchema);