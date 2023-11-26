const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');

post = async (req) => {
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

getCollectionById = async (req, res) => {
	try{
		if (!ObjectId.isValid(req.params.id)) return [400, "Invalid feature collection ID."];

        const collection = await FeatureCollection.findById(req.params.id);
		if (!collection) return [404, "Feature collection not found."];

		const features = [];
		try {
			for (const featureId of collection.featureIds) {
				features.push(await Feature.findById(featureId));
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

getFeatureById = async (req, res) => {
	try{
		if (!ObjectId.isValid(req.params.id)) return [400, "Invalid feature ID"];

        const data = await Feature.findById(req.params.id);
		if (!data) return [400, "Feature not found."];

        res.json(data)
    }
    catch(error){
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

module.exports = {post, getCollectionById};