const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

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
  featureIds: {
    type: [ObjectId],
    required: true
  }
});

module.exports = mongoose.model('FeatureCollection', featureCollectionSchema);
