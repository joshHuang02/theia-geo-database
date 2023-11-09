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
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  properties: {
    type: Object,
    required: true
  }
});

const crsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['name'],
    required: true
  },
  properties: {
    name: {
      type: String,
      required: true
    }
  }
});

const featureCollectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FeatureCollection'],
    required: true
  },
  name: {
    type: String
  },
  crs: {
    type: crsSchema
  },
  features: {
    type: [featureSchema],
    required: true
  }
});

module.exports = mongoose.model('FeatureCollection', featureCollectionSchema);
