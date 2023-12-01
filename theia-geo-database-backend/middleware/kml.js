/*
Uses a library foudn here: https://github.com/mapbox/togeojson
*/
const gjv = require("geojson-validation");

var tokml = require('tokml'),
	toGeoJson = require('@mapbox/togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

convertToGeoJSON = (kmlString) => {
	try {
		var kml = new DOMParser().parseFromString(kmlString);
		return [200, toGeoJson.kml(kml)];
	} catch(error) {
		return [500, error.message];
	}	
}

convertToKML = (geoJson) => {
	try {
		return [200, tokml(geoJson)];
	} catch(error) {
		return [500, error.message];
	}
}

module.exports = {convertToGeoJSON, convertToKML};