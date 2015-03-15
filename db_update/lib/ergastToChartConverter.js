var Race = require('./domain/race');
var Driver = require('./domain/driver');
var _ = require('underscore');

// This module is responsible for converting the data retrieved from the Ergast service to the format
// expected by the library used for drawing the lap charts.
// The lap charts library expects a JSON with 4 fields:
//      lapcount: number of laps performed by the winner of the race.
//      laps: for each driver, contains his position on each lap and the laps where he did a pit stop,
//          had an accident, a mechanical failure, or was disqualified.
//      lapped: contains information about lapped drivers.
//      safety: laps where the safety car was used.
function ErgastToChartConverter() {

    var ergastToChartConverter = this;
    ergastToChartConverter.getChartDataFromErgastInfo = getChartDataFromErgastInfo;

    // Ergast statuses that represent an accident.
    var ACCIDENT_STATUSES = ['Accident', 'Collision', 'Spun off'];

    // Ergast statuses that represent a mechanical failure.
    var MECHANICAL_PROBLEMS_STATUSES =
            ['Clutch', 'Electrical', 'Engine', 'Gearbox', 'Hydraulics', 'Transmission', 'Suspension', 'Brakes',
                'Mechanical', 'Tyre', 'Puncture', 'Wheel', 'Heat shield fire', 'Oil leak', 'Water leak', 'Wheel nut',
                'Rear wing', 'Engine misfire', 'Vibrations', 'Alternator', 'Collision damage', 'Pneumatics',
                'Fuel system', 'Technical', 'Oil pressure', 'Drivetrain', 'Turbo', 'ERS', 'Power Unit',
                'Water pressure', 'Fuel pressure', 'Throttle', 'Steering', 'Electronics', 'Exhaust',
                'Retired', 'Withdrew', 'Power loss'];

    // Converts the data obtained from the Ergast service to the format expected by the library used for
    // drawing the lap charts.
    function getChartDataFromErgastInfo(ergastRaceResults, ergastLaps, ergastPitStops, ergastDrivers, callback) {
        callback(null, new Race(getLapCount(ergastRaceResults),
            getLaps(ergastRaceResults, ergastDrivers, ergastLaps, ergastPitStops),
            getLapped(),
            getSafety()));
    }

    // Constructs the 'lapcount' field of the JSON object needed by the library used for drawing the lap charts.
    function getLapCount(ergastRaceResults) {
        return ergastRaceResults.driverResults[0].laps;
    }

    // Constructs the 'laps' field of the JSON object needed by the library used for drawing the lap charts.
    function getLaps(ergastRaceResults, ergastDrivers, ergastLaps, ergastPitStops) {
        var laps = initializeLaps(ergastRaceResults);
        setInitialPositions(laps, ergastRaceResults);
        setLapsPlacing(laps, ergastLaps, ergastRaceResults);
        setLapsPitStops(laps, ergastPitStops);
        setAccidents(laps, ergastRaceResults);
        setMechanicalProblems(laps, ergastRaceResults);
        setDisqualifications(laps, ergastRaceResults);
        changeDriversIdsForNames(laps, ergastDrivers);
        return laps;
    }

    // Initializes the 'laps' field introducing all the drivers that participated in the race.
    function initializeLaps(ergastRaceResults) {
        var result = [];
        ergastRaceResults.driverResults.forEach(function(driverResult) {
            result.push(new Driver(driverResult.driver.driverId, [], []));
        });
        return result;
    }

    // Sets the initial position of each driver in the 'laps' field.
    function setInitialPositions(laps, ergastRaceResults) {
        ergastRaceResults.driverResults.forEach(function(driverResult) {
            var lapToModify = _.find(laps, function(lap) { return lap.name === driverResult.driver.driverId });
            lapToModify.placing.push(driverResult.grid);
        });
    }

    // Sets the position of each driver in each of the laps of the race in the 'laps' field.
    function setLapsPlacing(laps, ergastLaps, ergastRaceResults) {
        var lapsDoneByWinner = ergastRaceResults.driverResults[0].laps;
        ergastLaps.forEach(function(ergastLap) {

            // There are races where the number of laps officially counted is less than the number of laps done
            // by the winner of the race. This happened in the 4th year of 2014. The winner of the race did 56 laps
            // but only 54 were counted. This happened because the chequered flag was shown before it was supposed to,
            // so according to the rules the last 2 laps cannot be counted. The ergastLaps parameter contains all laps,
            // but we are only interested in the ones officially counted.
            if (ergastLap.number <= lapsDoneByWinner) {
                ergastLap.laps.forEach(function(ergastLapInfo) {
                    var lapToModify = _.find(laps, function(lap) { return lap.name === ergastLapInfo.driverId });
                    lapToModify.placing.push(ergastLapInfo.position);
                });
            }

        });
    }

    // Sets the pit stops information in the 'laps' field.
    function setLapsPitStops(laps, ergastPitStops) {
        ergastPitStops.forEach(function(ergastPitStop) {
            ergastPitStop.pitStops.forEach(function (ergastPitStopInfo) {
                var lapToModify = _.find(laps, function (lap) { return lap.name === ergastPitStopInfo.driverId });
                lapToModify.pitstops.push(ergastPitStopInfo.lap);
            });
        });
    }

    // Sets the accidents information in the 'laps' field.
    function setAccidents(laps, ergastRaceResults) {
        ergastRaceResults.driverResults.forEach(function(driverResult) {
            if (_.contains(ACCIDENT_STATUSES, driverResult.status)) {
                var lapToModify = _.find(laps, function (lap) { return lap.name === driverResult.driver.driverId });
                lapToModify.accident = [driverResult.laps];
            }
        });
    }

    // Sets the mechanical problems information in the 'laps' field.
    function setMechanicalProblems(laps, ergastRaceResults) {
        ergastRaceResults.driverResults.forEach(function(driverResult) {
            if (_.contains(MECHANICAL_PROBLEMS_STATUSES, driverResult.status)) {
                var lapToModify = _.find(laps, function (lap) { return lap.name === driverResult.driver.driverId });
                lapToModify.mechanical = [driverResult.laps];
            }
        });
    }

    // Sets the disqualifications in the 'laps' field.
    function setDisqualifications(laps, ergastRaceResults) {
        ergastRaceResults.driverResults.forEach(function(driverResult) {
            if (driverResult.status === 'Disqualified') {
                var lapToModify = _.find(laps, function (lap) { return lap.name === driverResult.driver.driverId });
                lapToModify.disqualified = [driverResult.laps];
            }
        });
    }

    // Changes the drivers IDs for their names in the 'laps' field.
    // Each driver is identified by an ID in the Ergast service. We need to replace this ID
    // with the name of the driver.
    function changeDriversIdsForNames(laps, ergastDrivers) {
        laps.forEach(function(lap) {
            var driver = _.find(ergastDrivers.drivers, function(driver) { return driver.driverId === lap.name });
            lap.name = driver.givenName + " " + driver.familyName;
        });
    }

    // Constructs the 'lapped' field of the JSON object needed by the library used for drawing the lap charts.
    function getLapped() {
        return []; // This information cannot be obtained from the Ergast service
    }

    // Constructs the 'safety' field of the JSON object needed by the library used for drawing the lap charts.
    function getSafety() {
        return []; // This information cannot be obtained from the Ergast service
    }

}

module.exports = ErgastToChartConverter;