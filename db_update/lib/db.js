var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');
var config = require('./../config/config');
var ErgastData = require('./ergastData');
var ErgastToChartConverter = require('./ergastToChartConverter');

var ergastData = new ErgastData();
var ergastToChartConverter = new ErgastToChartConverter();

this.updateSeasons = updateSeasons;
this.updateAllRaceResults = updateAllRaceResults;
this.updateRaceResultsFromSeason = updateRaceResultsFromSeason;
this.updateRaceResult = updateRaceResult;

function updateSeasons(callback) {
    ergastData.getRacesWithData(function(err, seasons) {
        if (err) {
            callback(err);
        }
        else {
            fs.writeFile(config.seasonsInfoPath, toPrettyJson(seasons), function (err) {
                err ? callback(err) : callback(null);
            });
        }
    });
}

// seasons.json needs to be updated
function updateAllRaceResults(callback) {
    var seasonsInfo = JSON.parse(fs.readFileSync(config.seasonsInfoPath, 'utf8'));
    var sortedSeasonsInfo = _.sortBy(seasonsInfo, function(season) { return season.year; });
    var startYear = sortedSeasonsInfo[0].year;
    var endYear = sortedSeasonsInfo[sortedSeasonsInfo.length - 1].year;

    var year = startYear;
    async.whilst(
        function () { return year <= endYear },
        function (callback) {
            updateRaceResultsFromSeason(year, function(err) {
                ++year;
                callback(err);
            });
        },
        function (err) {
            callback(err);
        }
    );
}

// seasons.json needs to be updated
function updateRaceResultsFromSeason(season, callback) {
    var seasonsInfo = JSON.parse(fs.readFileSync(config.seasonsInfoPath, 'utf8'));
    var seasonInfo = _.find(seasonsInfo, function(seasonInfo) { return seasonInfo.year == season });

    var round = 1;
    async.whilst(
        function () { return round <= seasonInfo.rounds.length },
        function (callback) {
            updateRaceResult(season, round, function() {
                ++round;
                // We need to avoid making too many consecutive calls to Ergast
                setTimeout(function() { callback(null); }, 5000);
            });
        },
        function (err) {
            callback(err);
        }
    );
}

function updateRaceResult(season, round, callback) {
    async.waterfall([
        function(callback){
            getDataFromErgast(season, round, callback);
        },
        function(raceResults, laps, pitStops, drivers, callback) {
            convertDataFromErgastToChartFormat(raceResults, laps, pitStops, drivers, callback);
        }
    ], function (err, raceResultForChart) {
        if (err) {
            callback(err);
        }
        else {
            fs.writeFile(raceResultsPath(season, round), toPrettyJson(raceResultForChart), function (err) {
                err ? callback(err) : callback(null);
            });
        }
    });
}

function getDataFromErgast(season, round, callback) {
    ergastData.getData(season, round, function(err, raceResults, laps, pitStops, drivers) {
        err ? callback(err) : callback(null, raceResults, laps, pitStops, drivers);
    });
}

function convertDataFromErgastToChartFormat(raceResults, laps, pitStops, drivers, callback) {
    ergastToChartConverter.getChartDataFromErgastInfo(raceResults, laps, pitStops, drivers, function(err, chartData) {
        err ? callback(err) : callback(null, chartData);
    });
}

function raceResultsPath(season, round) {
    return config.raceResultsPath + season + "_" + round + ".json";
}

function toPrettyJson(json) {
    return JSON.stringify(json, null, 4);
}
