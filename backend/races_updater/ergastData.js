var async = require('async');
var ErgastClient = require('ergast-client');

// This module gets from the Ergast service the information needed to draw the lap charts.
function ergastData() {

    var ergastData = this;
    var ergast = new ErgastClient();
    ergastData.getData = getData;
    ergastData.getRacesWithData = getRacesWithData;
    var START_YEAR_AVAILABLE_DATA = 2011; // The Ergast service only has lap info starting from 2011

    // Gets the data needed to draw a lap chart.
    function getData(season, round, callback) {
        async.parallel([
                function(callback) {
                    getErgastRaceResults(season, round, callback);
                },
                function(callback) {
                    getErgastLaps(season, round, callback);
                },
                function(callback) {
                    getErgastPitStops(season, round, callback);
                },
                function(callback) {
                    getErgastDrivers(season, callback);
                }
            ],
            function(err, results) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, results[0], results[1], results[2], results[3]);
                }
            });
    }

    // Gets the races for which we can draw a lap chart.
    // It is not possible to draw lap charts for races that took place before 2011,
    // because the lap information for those races is not available in the Ergast service.
    function getRacesWithData(callback) {
        async.waterfall([
            function(callback) {
                getErgastLastRace(callback);
            },
            function(lastRace, callback) {
                getRacesInRange(START_YEAR_AVAILABLE_DATA, lastRace, callback);
            }],
            function(err, results) {
                callback(err, results);
            });
    }

    // Gets the latest race available in the Ergast service.
    // Note: The results of a race can be uploaded before the detailed per lap information.
    // This function returns the latest race that has detailed per lap information available.
    function getErgastLastRace(callback) {
        ergast.getLastRace(function(err, race) {
            ergast.getLaps(race.season, race.round, function(err) {
                if (err) { // Lap information is not available, get previous race
                    if (race.round - 1 === 0) { // Get last race of previous year
                        ergast.getSeason(race.season - 1, function(err, season) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                ergast.getRace(race.season - 1, season.race.length, function(err, race) {
                                   callback(err, race);
                                });
                            }
                        });
                    }
                    else { // Get previous race of the same year
                        ergast.getRace(race.season, race.round - 1, function (err, race) {
                            callback(err, race);
                        });
                    }
                }
                else { // Lap information available
                    callback(null, race);
                }
            });
        });
    }

    // Gets the races starting from a given year until the last one.
    function getRacesInRange(year, lastRace, callback) {
        var result = [];
        async.whilst(
            function () { return year <= lastRace.season },
            function (callback) {
                ergast.getSeason(year, function (err, season) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        var yearInfo = { year: year, rounds: [] };
                        season.races.forEach(function(race) {
                            if (lastRace.season === year) {
                                if (race.round <= lastRace.round) {
                                    yearInfo.rounds.push({round: race.round, name: race.raceName});
                                }
                            }
                            else {
                                yearInfo.rounds.push({round: race.round, name: race.raceName});
                            }
                        });
                        result.push(yearInfo);
                        ++year;
                    }
                    callback();
                });
            },
            function (err) {
                callback(err, result);
            }
        );
    }

    // Gets the results of a specific race from the Ergast service.
    function getErgastRaceResults(season, round, callback) {
        ergast.getRaceResults(season, round, function(err, results) {
            callback(err, results);
        });
    }

    // Gets the lap information of a specific race from the Ergast service.
    function getErgastLaps(season, round, callback) {
        ergast.getLaps(season, round, function(err, laps) {
            callback(err, laps);
        });
    }

    // Gets the pit stops information of a specific race from the Ergast service.
    function getErgastPitStops(season, round, callback) {
        var morePitStops = true;
        var currentPitStop = 1;
        var pitStops = [];
        async.whilst(
            function () { return morePitStops; },
            function (callback) {
                ergast.getPitStop(season, round, currentPitStop, function (err, pitStop) {
                    if (err) {
                        morePitStops = false;
                    }
                    else {
                        ++currentPitStop;
                        pitStops.push(pitStop);
                    }
                    callback();
                });
            },
            function (err) {
                callback(err, pitStops);
            }
        );
    }

    // Gets the drivers that participated in a given F1 season from the Ergast service.
    function getErgastDrivers(season, callback) {
        ergast.getDrivers(season, function(err, drivers) {
            callback(err, drivers);
        });
    }

}

module.exports = ergastData;
