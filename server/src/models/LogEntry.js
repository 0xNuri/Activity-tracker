const mongoose = require('mongoose');
const { Schema } = mongoose;

const requiredString = {
  type: String,
  required: true,
};

const requiredNumber = {
  type: Number,
  required: true,
};

const logEntrySchema = new Schema(
  {
    title: requiredString,
    description: String,
    comments: String,
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    image: String,
    placeId: String,
    placeName: String,
    state: String,
    latitude: { ...requiredNumber, min: -90, max: 90 },
    longitude: { ...requiredNumber, min: -180, max: 180 },
    visitDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogEntry', logEntrySchema);