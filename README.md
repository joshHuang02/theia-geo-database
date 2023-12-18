# theia-geo-database

This project is a result of the Hacking For Defense program collaboration between Carnegie Mellon University and the Department of Defense. Project Theia is a National Guard Bureau project to utilize military drones for domestic disaster response operations. As a part of this goal, Project Theia would like to be able to ingest geo-spatial data such as critical infrastructure, friendly forces, burn area, search area, and any other points of interest from any party, such as local fire departments, environmental agencies, local law enforcement etc. These data points are then overlaid on a live video feed from aerial assets and can be used to help with rescue operations.

This repository is a project for a MongoDB database to ingest and disseminate geo spatial data in various formats. The main purpose is to demo the capability to ingest geo-spatial data from different sources and store/pass to other sections of the Project Theia pipeline by the end of the year.

Current features include api routes to ingest and send KML and GeoJSON formats, and querying the database by location and view area.

## Setup and Run

This project can be setup and run in Unix and Windows systems.

1. Download or clone this project locally
2. Install latest versions [NodeJS](https://nodejs.org/en/download) and [MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/)
3. Optionally install [MongoDB Compass](https://www.mongodb.com/try/download/shell) for a GUI to debug the database with
4. Open a new terminal at `'theia-geo-database-backend`' directory
5. run `npm install`
6. run `npm start`
7. Server is now running, routes can be tested via Postman. Sample Postman collection is included in `'theia-geo-database-backend/test/postman'`

## Database Setup

The database is setup in 2 separate MongoDB collections.

### features

The features MongoDB collection contains one feature on a map per document. That means each individual point, line, or polygon is one document in this collection.

### featurecollections

The featurecollections MongoBD collection contains the data per KML or GeoJSON file. Each document represents one KML or GeoJSON file uploaded to the database. This information is retained instead of directly parsing individual location data points out of the file in case we need to distinguish between file senders and to allow for updating features by updating an entire featurecollection (updating a existing KML file with a new one to). Each featurecollection document contains a list of IDs for its features. The schema also allows for inserting feature documents directly into feature collections to be returned as a full KML or GeoJSON file.

This separation is done to retain feature collections while allowing mongoDB to query just the features in a separate collection. MongoDB's built in geo-spatial tools requires this setup to function, as it is very difficult to query lists of features within feature collections.

## Data Formats

All data is stored in the database as GeoJSON. KML and potential future supported formats are converted to GeoJSON before interacting with the database. They are also converted from GeoJSON upon retrieving from the database if needed. GeoJSON should be able to accommodate any geo-spatial data format that stores features as points, lines, and polygons. There also exists many existing packages that can do conversion between these formats.

## Middleware

The middleware directory contains useful code that sits in between the endpoints and the database. 

`'geoJson.js'` contains a series of functions that handle sending and receiving geoJSON data to and from the database. These are separated out to make interactions with the database more flexible. The routes can call them before or after doing conversions between data formats.

`'kml.js'` contains functions that will convert geo-spatial files between KML and GeoJSON. KML is a popular data format used by Google services, so this phase of the project will support database operation using KML. However, KML must be converted to and from GeoJSON to save data in the database.

## Future Development

As a product of a semester long course. The Carnegie Mellon University team will hand off this project as a "Minimum Viable Product" to Project Theia developers. This project can be be used as base code for further development, as reference, for demoing, or for nothing at all as far as the CMU team is concerned.
