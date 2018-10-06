var path = require('path');

var config = {
    dataPath: path.join(__dirname, '../frontend/data/'),
    raceResultsPath: path.join(__dirname, '../frontend/data/results/'),
    seasonsInfoPath: path.join(__dirname, '../frontend/data/seasons.json')
};

module.exports = config;
