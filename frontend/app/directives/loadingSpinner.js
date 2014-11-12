// This directive is based on this tutorial: http://ankursethi.in/2013/07/loading-spinners-with-angularjs-and-spin-js/
(function () {

    angular
        .module('f1_angular.directives')
        .directive('loadingSpinner', LoadingSpinner);

    function LoadingSpinner() {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {
                loading: '=loadingSpinner'
            },
            templateUrl: 'app/views/loadingSpinner.html',
            link: function() {
                var opts = {
                    lines: 10, // The number of lines to draw
                    length: 20, // The length of each line
                    width: 6, // The line thickness
                    radius: 15, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    direction: 1, // 1: clockwise, -1: counterclockwise
                    color: '#fff', // #rgb or #rrggbb or array of colors
                    speed: 1.5, // Rounds per second
                    trail: 60, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: '50%', // Top position relative to parent
                    left: '50%' // Left position relative to parent
                };
                var target = document.getElementById('my-loading-spinner-container');
                var spinner = new Spinner(opts).spin(target);
            }
        };
    }

})();
