(function () {

    angular
        .module('f1_angular.services')
        .factory('RaceResultsService', RaceResultsService);

    /* @ngInject */
    function RaceResultsService($http, data_dir) {
        return {
            getRaceResults: getRaceResults,
            getRacesWithData: getRacesWithData
        };

        function getRaceResults(season, round) {
            return $http.get(data_dir + '/results/' + season + "_" + round + '.json');
        }

        function getRacesWithData() {
            return $http.get(data_dir + '/seasons.json');
        }
    }
    RaceResultsService.$inject = ['$http', 'DATA_DIR'];

})();
