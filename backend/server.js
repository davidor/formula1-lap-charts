var apicache = require('apicache').middleware;
var express = require('express');
var mongoose = require('mongoose');

var config = require('./config/config');
var Season = require('./models/season').Season;
var RaceResult = require('./models/raceResult').RaceResult;

var CACHE_TIME= '1 hour';

var app = express();
app.listen(config.port, config.ipAddress);

mongoose.connect(config.dbUri, config.dbOptions);

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/raceresults/:season/:round', apicache(CACHE_TIME), function (req, res) {
    RaceResult.findOne()
        .where('season').equals(req.params.season)
        .where('round').equals(req.params.round)
        .exec(function(err, raceResult) {
            err ? res.send([]) : res.send(raceResult);
        })
});

app.get('/raceresults/races', apicache(CACHE_TIME), function (req, res){
    Season.find(function(err, seasons) {
        err ? res.send([]) : res.send(seasons);
    });
});
