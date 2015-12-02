var path = require('path');

var config = {
    dbUri: "xxxxx",
    dbOptions: {"user": 'xxxxx', "pass": 'xxxxx'},
    ipAddress: "127.0.0.1",
    port: 8080,
    raceResultsPath: path.join(__dirname, '../data/results/'),
    seasonsInfoPath: path.join(__dirname, '../data/seasons.json')
};

module.exports = config;
