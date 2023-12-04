const express = require('express');
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const geoJson = require('../middleware/geoJson');
const kmlConverter = require('../middleware/kml');
const { ObjectId } = require('mongodb');

const router = express.Router()

module.exports = router;

// Post geoJSON Method
router.post('/post/geoJSON', bodyParser.json(), async (req, res) => {
    const data = await geoJson.postCollection(req.body);
    res.status(data[0]).json(data[1]);
});

// Post KML Method
// parsed as text, xml is validated during conversion to geoJSON
router.post('/post/kml', bodyParser.text(), async (req, res) => {
    const kmlToGeoJson = await kmlConverter.convertToGeoJSON(req.body);
    if (kmlToGeoJson[0] != 200) res.status(kmlToGeoJson[0]).json(kmlToGeoJson[1]);

    const data = await geoJson.postCollection(kmlToGeoJson[1]);
    res.status(data[0]).json(data[1]);
});

//Get geoJSON collection by ID Method
router.get('/getOne/featureCollection/:id', async (req, res) => {
    const data = await geoJson.getCollectionById(req);
    res.status(data[0]).json(data[1]);
});

// Get kml collection by ID Method
router.get('/getOne/kmlCollection/:id', async (req, res) => {
    const data = await geoJson.getCollectionById(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

// Get geoJSON feature by ID Method, does not have a kml equivalent
router.get('/getOne/feature/:id', async (req, res) => {
    const data = await geoJson.getFeatureById(req);
    res.status(data[0]).json(data[1]);
});

// Get all feature collections, does not have a kml equivalent
router.get('/featureCollections', async (req, res) => {
    const data = await geoJson.getAllCollections(req);
    res.status(data[0]).json(data[1]);
});

// Get all features
router.get('/features', async (req, res) => {
    const data = await geoJson.getAllFeatures();
    res.status(data[0]).json(data[1]);
});

// Get all features in KML file
router.get('/features/kml', async (req, res) => {
    const data = await geoJson.getAllFeatures();
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

// Get geoJSON features within polygon
router.get('/getFeaturesWithinPolygon', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWitinPolygon(req);
    res.status(data[0]).json(data[1]);
});

// Get KML features within polygon
router.get('/getFeaturesWithinPolygon/kml', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWitinPolygon(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

// Get geoJson features withing circle
router.get('/getFeaturesWithinCircle', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWithinCircle(req);
    res.status(data[0]).json(data[1]);
});

// Get KML features within circle
router.get('/getFeaturesWithinCircle/kml', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWithinCircle(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

//Update collection by ID Method
// Will not implement this route due to the way features and featureCollections are stored separately in the database, as well as the fact that collections are only uploaded as a whole document and usually does not require updating individual features.
// Instead, delete the old collection and upload a new one.
router.patch('/update/:id', bodyParser.json(), async (req, res) => {
    res.status(400).json({ message: "Delete the old collection and upload a new one" })
    // try {
    //     const id = req.params.id;
    //     const updatedData = req.body;
    //     const options = { new: true };

    //     const result = await FeatureCollection.findByIdAndUpdate(
    //         id, updatedData, options
    //     )

    //     res.send(result)
    // }
    // catch (error) {
    //     res.status(400).json({ message: error.message })
    // }
})

/* Update feature by ID Method
   This route is only for debugging, as individual features are not meant to be updated.
*/
router.patch('/updateFeature/:id', bodyParser.json(), async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) res.status(400).json({ message: "Invalid feature ID" })

        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Feature.findByIdAndUpdate(
            id, updatedData, options
        )

        if (!result) res.status(404).json({ message: "Feature not found" })

        res.send(result)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
});

//Delete feature collection by ID Method
router.delete('/deleteFeatureCollection/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) res.status(400).json({ message: "Invalid feature collection ID" });

        const featureCollection = await FeatureCollection.findById(id);
        if (!featureCollection) res.status(404).json({ message: "Feature collection not found" });

        featureCollection.featureIds.forEach(async feature => {
            await Feature.findByIdAndDelete(feature);
        });

        const data = await FeatureCollection.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Delete feature by ID Method
router.delete('/deleteFeature/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) res.status(400).json({ message: "Invalid feature ID" });

        var featureCollection = await FeatureCollection.findOne({ featureIds: id });
        featureCollection.featureIds = featureCollection.featureIds.filter(featureId => featureId != id);
        featureCollection.markModified('featureIds');
        await featureCollection.save();

        const data = await Feature.findByIdAndDelete(id)
        if (!data) res.status(404).json({ message: "Feature not found" });

        res.send('Feature deleted..')
    }
    catch (error) {
        res.status(500).json({ message: error.message })
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
        res.status(500).json({ message: error.message })
    }
})