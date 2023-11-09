const mongoose = require('mongoose');

const geoSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Feature'],
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point', 'LineString', 'Polygon'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    },
    properties: {
        type: Object
    }
}, {strict: false});

module.exports = mongoose.model('Geo', geoSchema);
