var express = require('express');
var config = require('./config/config');
var Data = require('./lib/data');

var data = new Data();
var app = express();

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.put('/seasons', function (req, res) {
    data.updateSeasons(function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults', function(req, res) {
    data.updateAllRaceResults(function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults/:season', function (req, res) {
    data.updateRaceResultsFromSeason(req.params.season, function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.put('/raceresults/:season/:round', function (req, res) {
    data.updateRaceResult(req.params.season, req.params.round, function(err) {
        err ? res.status(500).send(err) : res.status(204).send("OK");
    });
});

app.listen(config.port, config.ipAddress);
