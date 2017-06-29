(function() {
    var app = angular.module('caseysnewbuffalo');

    app.controller('HomeController', ['$scope', '$http', '$window', function($scope, $http, $window) {

      $scope.userData = {
        isLoggedIn: false
      };

      $scope.pageData = {
        current: "login"
      }

      $scope.changePage = function(page) {
        $scope.pageData.current = page;
        if (page == 'photos') {
          $(document).ready(function() {
            $(".photo-container").css("height",1.25*$(".photo-container").width());
          });
        }
      }

      $scope.logout = function() {
        $http.get('/backendServices/logout')
          .then(function(res) {
            $window.location = "/admin";
          });
      }


    }]);

}());
