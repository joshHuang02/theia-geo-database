const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Feature'],
    required: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'],
      required: true
    },
    coordinates: {}
  },
  properties: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model('Feature', featureSchema);
