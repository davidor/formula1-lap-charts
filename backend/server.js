var express = require('express');
var CronJob = require('cron').CronJob;
var config = require('./config/config');
var ServerData = require('./serverData');

var app = express();
app.listen(config.port, config.ipAddress);

var data = new ServerData(config);
data.updateSeasonsInfo();
data.updateRaceResults();

new CronJob('* 30 * * * *', function() {
        data.updateSeasonsInfo();
        data.updateRaceResults();
    }, function () { }, true
);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/raceresults/:season/:round', function (req, res) {
    if (!data.raceResults[req.params.season]
          || !data.raceResults[req.params.season][req.params.round]) {
        res.send({});
    }
    else {
        res.send(data.raceResults[req.params.season][req.params.round]);
    }
});

app.get('/raceresults/races', function (req, res){
    res.send(data.seasonsInfo);
});
