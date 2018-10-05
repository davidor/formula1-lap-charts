(function () {

    angular
        .module('f1_angular.controllers')
        .controller('LapChartCtrl', LapChartCtrl);

    /* @ngInject */
    function LapChartCtrl(RaceResultsService) {
        var lapChartCtrl = this;
        lapChartCtrl.selectedRace = {};
        lapChartCtrl.racesWithData = [];
        lapChartCtrl.loading = true;

        lapChartCtrl.getSeasonsWithData = getSeasonsWithData;
        lapChartCtrl.getRoundsWithData = getRoundsWithData;
        lapChartCtrl.refreshChart = refreshChart;

        activate();

        function activate() {
            getRacesWithData()
                .then(
                    function() {
                        lapChartCtrl.selectedRace.season = getLastRaceSeason();
                        lapChartCtrl.selectedRace.round = getLastRaceRound();
                        updateSelectedRaceName();
                        updateSelectedRaceResults();
                    }
                );
        }

        function getRacesWithData() {
            return RaceResultsService
                .getRacesWithData()
                .then(
                    function(response) {
                        lapChartCtrl.racesWithData = response.data;
                    },
                    function() {
                    }
                );
        }

        function getSeasonsWithData() {
            var result = [];
            lapChartCtrl.racesWithData.forEach(function(season) {
                result.push(season.year);
            });
            return result.sort(function(a, b) {return b - a});
        }

        function getRoundsWithData(aSeason) {
            var result = [];
            lapChartCtrl.racesWithData.forEach(function(season) {
                if (season.year === aSeason) {
                    for (var i = 1; i <= season.rounds.length; ++i) {
                        result.push(i);
                    }
                }
            });
            return result;
        }

        function refreshChart() {
            updateSelectedRaceName();
            updateSelectedRaceResults();
        }

        function updateSelectedRaceName() {
            lapChartCtrl.racesWithData.forEach(function(season) {
                if (season.year === lapChartCtrl.selectedRace.season) {
                    season.rounds.forEach(function (round) {
                        if (round.round === lapChartCtrl.selectedRace.round) {
                            lapChartCtrl.selectedRace.name = round.name;
                        }
                    });
                }
            });
        }

        function updateSelectedRaceResults() {
            lapChartCtrl.loading = true;
            RaceResultsService
                .getRaceResults(lapChartCtrl.selectedRace.season, lapChartCtrl.selectedRace.round)
                .then(
                    function(response) {
                        lapChartCtrl.selectedRace.results = response.data;
                        lapChartCtrl.loading = false;
                    },
                    function() {
                        lapChartCtrl.loading = false;
                    }
                );
        }

        function getLastRaceSeason() {
            return lapChartCtrl.racesWithData.sort(function(a, b) {return b.year - a.year})[0].year;
        }

        function getLastRaceRound() {
            return lapChartCtrl.racesWithData.sort(function(a, b) {return b.year - a.year})[0].rounds.length;
        }
    }
    LapChartCtrl.$inject = ['RaceResultsService'];

})();
