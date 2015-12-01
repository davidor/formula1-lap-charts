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
        print_output(err);
    });
}

if (program.all) {
    data.updateAllRaceResults(function(err) {
        print_output(err);
    });
}
else if (program.year) {
    data.updateRaceResultsFromSeason(program.year, function(err) {
        print_output(err);
    });
}
else if (program.race) {
    var race = program.race.split('-');
    data.updateRaceResult(race[0], race[1], function(err) {
        print_output(err);
    });
}

function print_output(err) {
    err ? console.log(err) : console.log("OK");
}
