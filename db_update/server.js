var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/config');
var db = require('./lib/db');

var app = express();

mongoose.connect(config.dbUri, config.dbOptions);

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.put('/seasons', function (req, res) {
    db.updateSeasons(function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults', function(req, res) {
    db.updateAllRaceResults(function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults/:season', function (req, res) {
    db.updateRaceResultsFromSeason(req.params.season, function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults/:season/:round', function (req, res) {
    db.updateRaceResult(req.params.season, req.params.round, function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.listen(config.port, config.ipAddress);