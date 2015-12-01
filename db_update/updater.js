var program = require('commander');
var config = require('./config/config');
var Data = require('./lib/data');

var data = new Data();

program
    .option('-s, --seasons', 'Update seasons info.')
    .option('-a, --all', 'Update all races')
    .option('-y, --year <year>', 'Update races of one year')
    .option('-r, --race <year-round>', 'Update one race')
    .parse(process.argv);

if (program.seasons) {
    data.updateSeasons(function(err) {
        err ? console.log("Error: " + err) : console.log("OK");
    });
}

if (program.all) {
    data.updateAllRaceResults(function(err) {
        err ? console.log(err) : console.log("OK");
    });
}
else if (program.year) {
    data.updateRaceResultsFromSeason(program.year, function(err) {
        err ? console.log(err) : console.log("OK");
    });
}
else if (program.race) {
    var race = program.race.split('-');
    data.updateRaceResult(race[0], race[1], function(err) {
        err ? console.log(err) : console.log("OK");
    });
}
