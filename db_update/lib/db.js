var async = require('async');
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
            async.waterfall([
                function(callback){
                    deleteSeasons(callback);
                },
                function(callback) {
                    saveSeasons(seasons, callback);
                }
            ], function (err) {
                err ? callback(err) : callback(null);
            });
        }
    });
}

function deleteSeasons(callback) {
    Season.remove(function(err) {
        err ? callback(err) : callback(null);
    });
}

function saveSeasons(seasons, callback) {
    seasons.forEach(function(seasonInfo) {
        var season = new Season(seasonInfo);
        season.save(function(err) {
            if (err) {
                callback(err);
            }
        });
    });
    callback(null);
}

function updateAllRaceResults(callback) {
    var startYear, endYear;
    async.waterfall([
        // find start year
        function(callback) {
            Season.findOne().sort('year').exec(function(err, season) {
                startYear = season.year;
                callback(err);
            });
        },
        // find end year
        function(callback) {
            Season.findOne().sort('-year').exec(function(err, season) {
                endYear = season.year;
                callback(err);
            });
        },
        // update the races between the start and the end year
        function (callback) {
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
    ], function (err) {
        callback(err);
    });
}

function updateRaceResultsFromSeason(season, callback) {
    Season.findOne({year: season}).exec(function(err, seasonInfo) {
        var round = 1;
        async.whilst(
            function () { return round <= seasonInfo.rounds.length },
            function (callback) {
                updateRaceResult(season, round, function() {
                    ++round;
                    // We need to avoid making too many consecutive calls to the Ergast service
                    setTimeout(function() { callback(null); }, 5000);
                });
            },
            function (err) {
                callback(err);
            }
        );
    });
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
            deleteRaceResult(season, round, callback);
            var raceResult = new RaceResult(raceResultForChart);
            raceResult.season = season;
            raceResult.round = round;
            raceResult.save(function(err) {
                err ? callback(err) : callback(null);
            });
        }
    });
}

function deleteRaceResult(season, round, callback) {
    RaceResult.find({season: season, round: round}).remove(function(err) {
        if (err) {
            callback(err);
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
