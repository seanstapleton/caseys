(function() {
    var app = angular.module('caseysnewbuffalo');

    app.controller('LoginController', ['$scope', '$http', '$window', function($scope, $http, $window) {

      $scope.login = function() {
          $http.post('/backendServices/login',{
              email: $scope.email,
              password: $scope.password,
          }).then(function(res) {
              if(res.data.success) {
                  $window.location = '/admin/events';
              } else {
                  $scope.loginError = true;
                  $scope.loginStatus.internalServerError = true;
              }
          });
      }
      $scope.signupStatus = {
          internalServerError: false
      }

    }]);

}());
