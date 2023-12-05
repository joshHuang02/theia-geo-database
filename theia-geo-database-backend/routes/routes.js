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

/* 
    This route is for uploading a geoJSON feature collection.
    The feature collection is validated using the geojson-validation library.
    The feature collection without feature details is then saved to the database and returned in the response.

    Example query: http://localhost:3000/post/geoJSON
*/
router.post('/post/geoJSON', bodyParser.json(), async (req, res) => {
    const data = await geoJson.postCollection(req.body);
    res.status(data[0]).json(data[1]);
});

/* 
    This route is for uploading a KML feature collection.
    KML is parsed as text in request body.
    The KML is then converted to geoJSON using the togeojson library, KML is validated at this step.
    The geoJSON is then saved to the database and returned in the response.

    Example query: http://localhost:3000/post/kml
*/
router.post('/post/kml', bodyParser.text(), async (req, res) => {
    const kmlToGeoJson = await kmlConverter.convertToGeoJSON(req.body);
    if (kmlToGeoJson[0] != 200) res.status(kmlToGeoJson[0]).json(kmlToGeoJson[1]);

    const data = await geoJson.postCollection(kmlToGeoJson[1]);
    res.status(data[0]).json(data[1]);
});

/*
    This route is for getting a geoJSON feature collection by ID.
    The feature collection is retrieved from the database as geoJSON and returned in the response.

    Example query: http://localhost:3000/getOne/featureCollection/5f9b3b7b9c9b8c2b3c8b3b3b
*/
router.get('/getOne/featureCollection/:id', async (req, res) => {
    const data = await geoJson.getCollectionById(req);
    res.status(data[0]).json(data[1]);
});

/*
    This route is for getting a KML feature collection by ID.
    The feature collection is retrieved from the database as geoJSON and converted to KML using the tokml library.
    The KML is then returned in the response.

    Example query: http://localhost:3000/getOne/kmlCollection/5f9b3b7b9c9b8c2b3c8b3b3b
*/
router.get('/getOne/kmlCollection/:id', async (req, res) => {
    const data = await geoJson.getCollectionById(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

/*
    This route is for getting a geoJSON feature by ID and does not have a KML equivalent since individual features cannot be converted to KML.
    The feature is retrieved from the database as geoJSON and returned in the response.

    Example query: http://localhost:3000/getOne/feature/5f9b3b7b9c9b8c2b3c8b3b3b
*/
router.get('/getOne/feature/:id', async (req, res) => {
    const data = await geoJson.getFeatureById(req);
    res.status(data[0]).json(data[1]);
});

/*
    This route is for getting all feature collections as geoJSON and does not have a kml equivalent since array of collections cannot be converted to KML.
    The route can be queried to include features in the response by setting parameter "includeFeatures" to "true".
    The feature collections array is retrieved from the database as geoJSON and returned in the response.
    This route should be used for debugging purposes only.

    Example query: http://localhost:3000/featureCollections?includeFeatures=true
*/
router.get('/featureCollections', async (req, res) => {
    const data = await geoJson.getAllCollections(req);
    res.status(data[0]).json(data[1]);
});

/*
    This route is for getting all features as geoJSON.
    The features are retrieved from the database as geoJSON and returned in the response.

    Example query: http://localhost:3000/features
*/
router.get('/features', async (req, res) => {
    const data = await geoJson.getAllFeatures();
    res.status(data[0]).json(data[1]);
});

// Get all features in KML file
/*
    This route is for getting all features as KML.
    The features are retrieved from the database as geoJSON and converted to KML using the tokml library.
    The KML is then returned in the response.

    Example query: http://localhost:3000/features/kml
*/
router.get('/features/kml', async (req, res) => {
    const data = await geoJson.getAllFeatures();
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

// Get geoJSON features within polygon
/*
    This route is for getting all features within a polygon as geoJSON.
    The features within the polygon are retrieved from the database as geoJSON and returned in the response.

    Example query: http://localhost:3000/getFeaturesWithinPolygon
    Example body: {
    "coordinates": [[
        [ -116.9156922714257,33.00283000223396],
        [-116.8902399997034,33.00172878565257],
        [-116.8908543579805,33.01513716478932],
        [-116.9148893692876,33.0162159254125],
        [-116.9156922714257,33.00283000223396]]]
    }
*/
router.get('/getFeaturesWithinPolygon', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWitinPolygon(req);
    res.status(data[0]).json(data[1]);
});

/* 
    This route does the same thing as "getFeaturesWithinPolygon", but converts the results to KML using the tokml library.
*/
router.get('/getFeaturesWithinPolygon/kml', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWitinPolygon(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

/*
    This route is for getting all features within a circle as geoJSON.
    The features within the circle are retrieved from the database as geoJSON and returned in the response.

    Example query: http://localhost:3000/getFeaturesWithinCircle
    Example body: {
    "center": [-116.90771795879387, 33.012529527466185],
    "radius": 0.5
    }
*/
router.get('/getFeaturesWithinCircle', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWithinCircle(req);
    res.status(data[0]).json(data[1]);
});

/*
    This route does the same thing as "getFeaturesWithinCircle", but converts the results to KML using the tokml library.
*/
router.get('/getFeaturesWithinCircle/kml', bodyParser.json(), async (req, res) => {
    const data = await geoJson.getFeaturesWithinCircle(req);
    if (data[0] != 200) res.status(data[0]).json(data[1]);

    const geoJsonToKml = await kmlConverter.convertToKML(data[1]);
    res.status(geoJsonToKml[0]).send(geoJsonToKml[1]);
});

/*
    Update collection by ID Method
    Will not implement this route due to the way features and featureCollections are stored separately in the database, as well as the fact that collections are only uploaded as a whole document and usually does not require updating collection details.
    Instead, delete the old collection and upload a new one.
*/
router.patch('/updateCollection/:id', bodyParser.json(), async (req, res) => {
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

/*
    This route is for updating a feature by ID.
    The feature is retrieved from the database and updated with the request body.
    The updated feature is then saved to the database and returned in the response.
    This route is only for debugging, as individual features are not meant to be updated.

    Example query: http://localhost:3000/updateFeature/5f9b3b7b9c9b8c2b3c8b3b3b
    Example body: {
    "type": "Feature",
    "properties": {
        "name": "New Feature"
    },
    "geometry": {...}
    }
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

/*
    This route is for deleting a feature collection by ID.
    The feature collection is retrieved from the database and deleted.
    The features in the collection are also deleted from the database.
    The deleted feature collection is returned in the response.

    Example query: http://localhost:3000/deleteFeatureCollection/5f9b3b7b9c9b8c2b3c8b3b3b
*/
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

/*
    This route is for deleting a feature by ID.
    The feature is retrieved from the database and deleted.
    The deleted feature is returned in the response.
    This route is only for debugging, as individual features are not meant to be deleted.

    Example query: http://localhost:3000/deleteFeature/5f9b3b7b9c9b8c2b3c8b3b3b
*/
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

/*
    This route is for deleting all feature collections and features.
    All feature collections and features are deleted from the database.
    This route is mostly for debugging purposes.

    Example query: http://localhost:3000/deleteAll
*/
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