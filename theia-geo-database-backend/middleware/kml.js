/*
Uses a library foudn here: https://github.com/mapbox/togeojson
*/

const toGeoJSON = require('@mapbox/togeojson');

var tj = require('@mapbox/togeojson'),
    fs = require('fs'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

convertToGeoJSON = (kmlString) => {
	try {
		var kml = new DOMParser().parseFromString(kmlString);
		return [200, tj.kml(kml)];
	} catch(error) {
		return [500, error.message];
	}	
}

module.exports = {convertToGeoJSON};