const express = require('express');
// const Model = require('../models/model');
const FeatureCollection = require('../models/featureCollection');
const bodyParser = require('body-parser');

const router = express.Router()

module.exports = router;

// Post Method
router.post('/post/geoJSON', bodyParser.json(), async (req, res) => {
    const featureCollection = new FeatureCollection({
        type: req.body.type,
        name: req.body.name,
        crs: req.body.crs,
        features: req.body.features
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

// Get all feature collections
router.get('/featureCollections', async (req, res) => {
    try {
        const featureCollections = await FeatureCollection.find();
        res.json(featureCollections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await FeatureCollection.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


// router.post('/post', bodyParser.json(), async (req, res) => {
//     const data = new Model({
//         name: req.body.name,
//         age: req.body.age
//     })

//     try {
//         const dataToSave = await data.save();
//         res.status(200).json(dataToSave)
//     }
//     catch (error) {
//         res.status(400).json({message: error.message})
//     }
// })

// //Get all Method
// router.get('/getAll', async (req, res) => {
//     try{
//         const data = await Model.find();
//         res.json(data)
//     }
//     catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

// //Get by ID Method
// router.get('/getOne/:id', async (req, res) => {
//     try{
//         const data = await Model.findById(req.params.id);
//         res.json(data)
//     }
//     catch(error){
//         res.status(500).json({message: error.message})
//     }
// })

// //Update by ID Method
// router.patch('/update/:id', bodyParser.json(), async (req, res) => {
//     try {
//         const id = req.params.id;
//         const updatedData = req.body;
//         const options = { new: true };

//         const result = await Model.findByIdAndUpdate(
//             id, updatedData, options
//         )

//         res.send(result)
//     }
//     catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// })

// //Delete by ID Method
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         const data = await Model.findByIdAndDelete(id)
//         res.send(`Document with ${data.name} has been deleted..`)
//     }
//     catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// })