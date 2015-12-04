var path = require('path');

var config = {
    ipAddress: "127.0.0.1",
    port: 8080,
    dataPath: path.join(__dirname, '../data/'),
    raceResultsPath: path.join(__dirname, '../data/results/'),
    seasonsInfoPath: path.join(__dirname, '../data/seasons.json')
};

module.exports = config;
