(function() {
    var app = angular.module('caseysnewbuffalo');

    app.controller('RegistrationController', ['$scope', '$http', function($scope, $http) {

      $scope.signup = function() {
          $http.post('/backendServices/register',{
              email: $scope.email,
              password: $scope.password,
          }).then(function(res) {
              if(res.data.success) {
                  $window.location = 'admin/dash';
              } else {
                  $scope.signupError = true;
                  $scope.signupStatus.internalServerError = true;
              }
          });
      }
      $scope.signupStatus = {
          internalServerError: false
      }




    }]);

}());
