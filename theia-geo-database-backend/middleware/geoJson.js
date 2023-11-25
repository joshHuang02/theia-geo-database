const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const FeatureCollection = require('../models/featureCollection');
const Feature = require('../models/feature');

post = async (req, res) => {
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
}

getCollectionById = async (req, res) => {
	try{
		if (!ObjectId.isValid(req.params.id)) return (400, "Invalid feature collection ID.");//res.status(400).send("Invalid feature collection ID.");

        const collection = await FeatureCollection.findById(req.params.id);
		if (!collection) res.status(404).send("Feature collection not found.");

        const features = await GetFeaturesByCollectionId(req.params.id);
        collection.features = features;
        
        res.json(collection);
    } catch(error){
        res.status(500).json({message: error.message});
    }
}

getFeatureById = async (req, res) => {
	try{
		if (!ObjectId.isValid(req.params.id)) res.status(400).send("Invalid feature ID.");

        const data = await Feature.findById(req.params.id);
		if (!data) res.status(404).send("Feature not found.");

        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
module.exports = {post, getCollectionById};