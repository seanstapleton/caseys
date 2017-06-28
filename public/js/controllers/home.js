(function() {
    var app = angular.module('caseysnewbuffalo');

    app.controller('HomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {

      $scope.userData = {
        isLoggedIn: false
      };

      $scope.pageData = {
        current: "login"
      }

      $scope.logout = function() {
        $http.get('/backendServices/logout')
          .then(function(res) {
            $window.location = "/admin";
          });
      }


    }]);

}());
