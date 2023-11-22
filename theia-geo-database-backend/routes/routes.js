const express = require('express');
// const Model = require('../models/model');
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');
const bodyParser = require('body-parser');
const featureCollection = require('../models/featureCollection');

const router = express.Router()

module.exports = router;

// Post Method
router.post('/post/geoJSON', bodyParser.json(), async (req, res) => {
    const featureIds = [];
    await Promise.all(req.body.features.map(async element => {
        const feature = new Feature({
            type: element.type,
            geometry: element.geometry,
            properties: element.properties
        });
        try {
            const featureData = await feature.save();
            featureIds.push(featureData._id);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }));

    const featureCollection = new FeatureCollection({
        type: req.body.type,
        name: req.body.name,
        crs: req.body.crs,
        featureIds: featureIds
    })
    
    try {
        featureCollection.markModified('features');
        const dataToSave = await featureCollection.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Get collection by ID Method
router.get('/getOne/featureCollection/:id', async (req, res) => {
    try{
        const data = await featureCollection.findById(req.params.id);
        const features = await GetFeaturesByCollectionId(req.params.id);
        data.features = features;
        
        res.json(data);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

// Get feature by ID Method
router.get('/getOne/feature/:id', async (req, res) => {
    try{
        const data = await Feature.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
});

// Get features within polygon
router.get('/getWithinPolygon', bodyParser.json(), async (req, res) => {
    try {
        // const data = await FeatureCollection.find({'features.geometry': {type: "Point"}});
        const features = await Feature.find({
            geometry: {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: req.body.coordinates,
                    }
                }
            }
        });
        const featureCollection = new FeatureCollection({
            type: "FeatureCollection",
            name: "Within Polygon",
            crs: {
                type: "name",
                properties: {
                    name: "urn:ogc:def:crs:EPSG::4326"
                }
            },
            features: features
        });
        res.json(featureCollection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all feature collections
router.get('/featureCollections', async (req, res) => {
    try {
        const featureCollections = await FeatureCollection.find();
        var allFeatures = [];
        featureCollections.forEach(featureCollection => {
            featureCollection.featureIds.forEach(featureId => {
                const feature = Feature.findById(featureId);
                allFeatures.push(feature);
            });
        });

        if (allFeatures.length == 0) { res.json({ message: "No features found" }) }

        var newCollection = new FeatureCollection({
            type: "FeatureCollection",
            name: "All Features",
            crs: featureCollections[0].crs,
            features: allFeatures
        });
            res.json(newCollection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all features
router.get('/features', async (req, res) => {
    try {
        const features = await Feature.find();
        res.json(features);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Update collection by ID Method
router.patch('/update/:id', bodyParser.json(), async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await featureCollection.findByIdAndUpdate(
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

// Find all features of a collection
GetFeaturesByCollectionId = async (id) => {
    try {
        const featureCollection = await FeatureCollection.findById(id);
        var features = [];
        for (const featureId of featureCollection.featureIds) {
            // const feature = await Feature.findById(featureId);
            features.push(await Feature.findById(featureId));
        }
        return features;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}