/**
 * @fileOverview Middleware for converting KML to GeoJSON and vice versa.
 * @module kml
 * @requires xmldom
 * @requires tokml
 * @requires @mapbox/togeojson
 * @requires geojson-validation
 * 
 * https://github.com/mapbox
**/
const gjv = require("geojson-validation");

var tokml = require('tokml'),
	toGeoJson = require('@mapbox/togeojson'),
    // node doesn't have xml parsing or a dom. use xmldom
    DOMParser = require('xmldom').DOMParser;

/**
 * Converts a KML string to GeoJSON.
 * @param {string} kmlString - The KML string to convert.
 * @returns {[number, object|string]} - An array containing the HTTP status code and the converted GeoJSON object or error message.
 */
convertToGeoJSON = (kmlString) => {
	try {
		var kml = new DOMParser().parseFromString(kmlString);
		return [200, toGeoJson.kml(kml)];
	} catch(error) {
		return [500, error.message];
	}	
}

/**
 * Converts a GeoJSON object to KML.
 * @param {Object} geoJson - The GeoJSON object to convert.
 * @returns {[number, string]} - An array containing the HTTP status code and the converted KML string or error message.
 */
convertToKML = (geoJson) => {
	try {
		return [200, tokml(geoJson)];
	} catch(error) {
		return [500, error.message];
	}
}

module.exports = {convertToGeoJSON, convertToKML};