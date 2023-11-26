const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');

postCollection = async (req) => {
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
			return [400, error.message];
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
		return [200, dataToSave];
	}
	catch (error) {
		return [400, error.message];
	}
}

getCollectionById = async (req) => {
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

getFeatureById = async (req) => {
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

GetFeaturesWitinPolygon = async (req) => {
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

// Find all features of a collection
GetFeaturesByCollectionId = async (id) => {
    try {
        const featureCollection = await FeatureCollection.findById(id);
        var features = [];
        for (const featureId of featureCollection.featureIds) {
            features.push(await Feature.findById(featureId));
        }
        return features;
    } catch (error) {
		return [500, error.message];
    }
}

module.exports = {postCollection, getCollectionById, getFeatureById};