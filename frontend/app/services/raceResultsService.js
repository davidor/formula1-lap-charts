(function () {

    angular
        .module('f1_angular.services')
        .factory('RaceResultsService', RaceResultsService);

    /* @ngInject */
    function RaceResultsService($http, BASE_URL) {
        return {
            getRaceResults: getRaceResults,
            getRacesWithData: getRacesWithData
        };

        function getRaceResults(season, round) {
            return $http({method: 'GET', url: BASE_URL + season + '/' + round});
        }

        function getRacesWithData() {
            return $http({method: 'GET', url: BASE_URL + 'races'});
        }
    }
    RaceResultsService.$inject = ['$http', 'BASE_URL'];

})();
