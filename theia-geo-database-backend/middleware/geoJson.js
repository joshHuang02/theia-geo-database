/**
 * Middleware functions for handling GeoJSON data in the backend.
 * Data only enters and exits the database through these functions, any conversion between GeoJSON and other formats is handled before and after the use of these functions.
 * @module geoJson
 */

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const gjv = require("geojson-validation");
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');

/**
 * Saves a feature collection in the database.
 *
 * @param {Object} geoJson - The GeoJSON object representing the feature collection.
 * @returns {Array} - An array containing the HTTP status code and the saved feature collection data.
 */
const postCollection = async (geoJson) => {
	if (!gjv.valid(geoJson)) return [400, "Invalid geoJSON."];

	const featureIds = [];
	await Promise.all(geoJson.features.map(async element => {
		const feature = new Feature({
			type: element.type,
			geometry: element.geometry,
			properties: element.properties
		});
		try {
			const featureData = await feature.save();
			featureIds.push(featureData._id);
		} catch (error) {
			return [400, error.message];
		}
	}));

	/**
	 * Represents a feature collection in GeoJSON format.
	 *
	 * @typedef {Object} FeatureCollection
	 * @property {string} type - The type of the GeoJSON object (e.g., "FeatureCollection").
	 * @property {string} name - The name of the feature collection.
	 * @property {Object} crs - The coordinate reference system of the feature collection.
	 * @property {Array<string>} featureIds - The IDs of the features in the collection.
	 */
	const featureCollection = new FeatureCollection({
		type: geoJson.type,
		name: geoJson.name,
		crs: geoJson.crs,
		featureIds: featureIds
	})
	
	try {
		featureCollection.markModified('features');
		const dataToSave = await featureCollection.save();
		return [200, dataToSave];
	}
	catch (error) {
		return [400, error.message];
	}
}

/**
 * Retrieves a feature collection by its ID.
 *
 * @param {Object} req - The request object containing the feature collection ID.
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature collection.
 */
const getCollectionById = async (req) => {
	try{
		if (!ObjectId.isValid(req.params.id)) return [400, "Invalid feature collection ID."];

        const collection = await FeatureCollection.findById(req.params.id);
		if (!collection) return [404, "Feature collection not found."];

		const features = [];
		try {
			for (const featureId of collection.featureIds) {
				features.push(await Feature.findById(featureId));
				// may want to add error message if feature not found, but that should never happen since features are never deleted separately from its feature collection
			}
        } catch(error) {
			return [500, error.message];
		}
        collection.features = features;
        
        return [200, collection];
    } catch(error){
		return [500, error.message];
    }
}

/**
 * Retrieves all feature collections.
 *
 * @param {Object} req - The request object.
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature collections.
 */
const getAllCollections = async (req) => {
	try {
        const featureCollections = await FeatureCollection.find();
		if (!featureCollections) return [404, "No feature collections found."];

		if (!req.query.includeFeatures || req.query.includeFeatures.toLowerCase() != "true") return [200, featureCollections];

		for (const featureCollection of featureCollections) {
			features = [];
			for (const featureId of featureCollection.featureIds) {
				features.push(await Feature.findById(featureId));
				// may want to add error message if feature not found, but that should never happen since features are never deleted separately from its feature collection
			}
			featureCollection.features = features;
		}
		return [200, featureCollections];

        // if (allFeatures.length == 0) { res.json({ message: "No features found" }) }

        
        //     res.json(newCollection);
    } catch (error) {
		return [500, error.message];
        // res.status(500).json({ message: error.message });
    }
}

/**
 * Retrieves a feature by its ID.
 *
 * @param {Object} req - The request object containing the feature ID.
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature.
 */
const getFeatureById = async (req) => {
	try{
		if (!ObjectId.isValid(req.params.id)) return [400, "Invalid feature ID"];

        const feature = await Feature.findById(req.params.id);
		if (!feature) return [404, "Feature not found."];

        return [200, feature]
    }
    catch(error){
		return [500, error.message];
    }
}

/**
 * Retrieves all features.
 *
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature collection.
 */
const getAllFeatures = async () => {
	try {
		const features = await Feature.find();

		var newCollection = new FeatureCollection({
            type: "FeatureCollection",
            name: "All Features",
            features: features
        });

		return [200, newCollection];
	} catch (error) {
		return [500, error.message];
	}
}

/**
 * Retrieves features within a circle.
 *
 * @param {Object} req - The request object containing the circle center and radius.
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature collection.
 */
const getFeaturesWithinCircle = async (req) => {
	try {
		const features = await Feature.find({
			geometry: {
				$geoWithin: {
					$centerSphere: [req.body.center, req.body.radius/6378.1]
				}
			}
		});

		// no error if no features found, simply do not display any features
		
		const featureCollection = new FeatureCollection({
			type: "FeatureCollection",
			name: "Within Circle",
			crs: {
				type: "name",
				properties: {
					name: "urn:ogc:def:crs:EPSG::4326"
				}
			},
			features: features
		});
		return [200, featureCollection];
	
	} catch (error) {
		return [500, error.message];
	}
}

/**
 * Retrieves features within a polygon.
 *
 * @param {Object} req - The request object containing the polygon coordinates.
 * @returns {Array} - An array containing the HTTP status code and the retrieved feature collection.
 */
const getFeaturesWithinPolygon = async (req) => {
	try {
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

		// no error if no features found, simply do not display any features
		
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
		return [200, featureCollection];
    } catch (error) {
		return [500, error.message];
    }
}

module.exports = {
	postCollection,
	getCollectionById,
	getFeatureById,
	getAllFeatures,
	getFeaturesWithinCircle,
	getFeaturesWithinPolygon,
	getAllCollections
};

// module.exports = {postCollection, getCollectionById, getFeatureById, getAllFeatures, getFeaturesWithinCircle,getFeaturesWitinPolygon, getAllCollections};