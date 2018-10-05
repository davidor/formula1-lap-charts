(function () {

    angular
        .module('f1_angular', [
            'f1_angular.directives',
            'f1_angular.controllers',
            'f1_angular.services',
            'ngRoute'])
        .config(configRoutes);

    function configRoutes($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'app/views/lapchart.html',
                controller: 'LapChartCtrl',
                controllerAs: 'lapChart'
            });
    }

})();
