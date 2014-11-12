var express = require('express');
var app = express();
var async = require('async');
var apicache = require('apicache').middleware;
var ErgastData = require('./lib/ergastData');
var ErgastToChartConverter = require('./lib/ergastToChartConverter');
var config = require('./lib/config');

var CACHE_TIME_RACES_LIST = '1 hour';
var CACHE_TIME_RACE_RESULTS = '1 day';

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/raceresults/:season/:round', apicache(CACHE_TIME_RACE_RESULTS), function (req, res) {
    async.waterfall([
        function(callback){
            getDataFromErgast(req.params.season, req.params.round, callback);
        },
        function(raceResults, laps, pitStops, drivers, callback) {
            convertDataFromErgastToChartFormat(raceResults, laps, pitStops, drivers, callback);
        }
    ], function (err, chartData) {
        if (err) {
            res.send({});
        }
        else {
            res.send(chartData);
        }
    });
});

app.get('/raceresults/races', apicache(CACHE_TIME_RACES_LIST), function (req, res){
    new ErgastData()
        .getRacesWithData(function(err, races) {
            if (err) {
                res.send([]);
            }
            else {
                res.send(races);
            }
        });
});

app.listen(config.port, config.ipAddress);

function getDataFromErgast(season, round, callback) {
    new ErgastData()
        .getData(season, round, function(err, raceResults, laps, pitStops, drivers) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, raceResults, laps, pitStops, drivers);
            }
        });
}

function convertDataFromErgastToChartFormat(raceResults, laps, pitStops, drivers, callback) {
    new ErgastToChartConverter()
        .getChartDataFromErgastInfo(raceResults, laps, pitStops, drivers, function(err, chartData) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, chartData);
            }
        });
}