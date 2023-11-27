const express = require('express');
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');
const bodyParser = require('body-parser');
// const { ObjectId } = require('mongodb');
const geoJson = require('../middleware/geoJson');
// const featureCollection = require('../models/featureCollection');

const router = express.Router()

module.exports = router;

// Post geoJSON Method
router.post('/post/geoJSON', bodyParser.json(), async (req, res) => {
    const data = await geoJson.postCollection(req);
    res.status(data[0]).json(data[1]);
});

//Get geoJSON collection by ID Method
router.get('/getOne/featureCollection/:id', async (req, res) => {
    const data = await geoJson.getCollectionById(req);
    res.status(data[0]).json(data[1]);
});

// Get geoJSON feature by ID Method
router.get('/getOne/feature/:id', async (req, res) => {
    const data = await geoJson.getFeatureById(req);
    res.status(data[0]).json(data[1]);
});

// Get all feature collections
router.get('/featureCollections', async (req, res) => {
    const data = await geoJson.getAllCollections();
    res.status(data[0]).json(data[1]);
});

// Get all features
router.get('/features', async (req, res) => {
    const data = await geoJson.getAllFeatures();
    res.status(data[0]).json(data[1]);
});

// Get geoJSON features within polygon
router.get('/getFeaturesWithinPolygon', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWitinPolygon(req);
    res.status(data[0]).json(data[1]);
});

//Update collection by ID Method
router.patch('/update/:id', bodyParser.json(), async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await FeatureCollection.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const featureCollection = await FeatureCollection.findById(id);
        featureCollection.featureIds.forEach(async feature => {
            await Feature.findByIdAndDelete(feature);
        });
        const data = await FeatureCollection.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Delete all method
router.delete('/deleteAll', async (req, res) => {
    try {
        const deleteCollections = await FeatureCollection.deleteMany({})
        const deleteFeatures = await Feature.deleteMany({})
        res.send(`All documents deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})