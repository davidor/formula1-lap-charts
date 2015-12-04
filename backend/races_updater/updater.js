var fs = require('fs');
var program = require('commander');
var async = require('async');
var config = require('../config/config');
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
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            data.updateAllRaceResults(function(err) { callback(err); });
        }
    ], function (err) {
        print_output(err);
    });
}
else if (program.year) {
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            data.updateRaceResultsFromSeason(program.year, function(err) { callback(err); });
        }
    ], function (err) {
        print_output(err);
    });
}
else if (program.race) {
    async.waterfall([
        function(callback) {
            data.updateSeasons(function(err) { callback(err); });
        },
        function (callback) {
            var race = program.race.split('-');
            data.updateRaceResult(race[0], race[1], function(err) {
                callback(err);
            });
        }
    ], function (err) {
        print_output(err);
    });
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
