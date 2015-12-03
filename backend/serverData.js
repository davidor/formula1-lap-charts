var fs = require('fs');

function ServerData(config) {
    var data = this;
    data.seasonsInfo = [];
    data.raceResults = {};
    data.updateSeasonsInfo = updateSeasonsInfo;
    data.updateRaceResults = updateRaceResults;


    function updateSeasonsInfo() {
        fs.readFile(config.seasonsInfoPath, 'utf8', function (err, seasonsInfo) {
            if (!err) {
                data.seasonsInfo = JSON.parse(seasonsInfo);
            }
        });
    }

    function updateRaceResults() {
        fs.readdir(config.raceResultsPath, function(err, files) {
            if (!err) {
                var raceResultFiles = files.length;
                var readFiles = 0;
                var raceResults = {};
                if (!err) {
                    files.forEach(function (file) {
                        fs.readFile(config.raceResultsPath + file, 'utf8', function (err, race) {
                            if (!err) {
                                var season = file.split('_')[0];
                                var round = file.split('_')[1].split('.json')[0];
                                if (!raceResults[season]) {
                                    raceResults[season] = {};
                                }
                                raceResults[season][round] = JSON.parse(race);
                            }
                            ++readFiles;
                            if (readFiles == raceResultFiles) {
                                data.raceResults = raceResults;
                            }
                        });
                    });
                }
            }
        });
    }
}

module.exports = ServerData;