var fs = require('fs');
var program = require('commander');
var async = require('async');
var config = require('./config');
var Data = require('./data');

var data = new Data(config);

program
    .option('-s, --seasons', 'Update seasons info.')
    .option('-a, --all', 'Update all races')
    .option('-y, --year <year>', 'Update races of one year')
    .option('-r, --race <year-round>', 'Update one race')
    .parse(process.argv);

makeSureDataDirectoriesExist();

if (program.seasons) {
    data.updateSeasons(function(err) {
        print_output(err);
    });
}

if (program.all) {
    updateSeasonsAndAllResults(print_output);
}
else if (program.year) {
    updateSeasonsAndResultsOfYear(program.year, print_output);
}
else if (program.race) {
    var race = program.race.split('-');
    updateSeasonsAndRace(race[0], race[1], print_output);
}

function print_output(err) {
    err ? console.log(err) : console.log("OK");
}

function makeSureDataDirectoriesExist() {
    [config.dataPath, config.raceResultsPath].forEach(function(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    });
}

function updateSeasonsAndAllResults(callback) {
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            data.updateAllRaceResults(function(err) { callback(err); });
        }
    ], function (err) {
        callback(err);
    });
}

function updateSeasonsAndResultsOfYear(year, callback) {
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            data.updateRaceResultsFromSeason(year, function(err) { callback(err); });
        }
    ], function (err) {
        callback(err);
    });
}

function updateSeasonsAndRace(year, round, callback) {
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            data.updateRaceResult(year, round, function(err) { callback(err); });
        }
    ], function (err) {
        callback(err);
    });
}
