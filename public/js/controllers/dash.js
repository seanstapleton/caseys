(function() {
    var app = angular.module('theharpandfiddle');

    app.controller('DashController', ['$scope', '$http', '$window', function($scope, $http, $window) {

    $scope.eventData = {};

    $scope.checkStatus = function() {
      $http.get("/backendServices/isLoggedIn")
        .then(function(res) {
          console.log(res.data);
          if (!res.data.loggedIn)
            $window.location = "/admin";
          else
            $scope.loggedIn = true;
        });
    }

    $scope.checkStatus();

      $scope.loadEvents = function() {
        $http.get('/backendServices/getEvents')
          .then(function(res) {
            if (res.data) {
              $scope.events = res.data;
            }
          });
      }

      $scope.toggleEventUpload = function() {
        $scope.mode = "new";
        $(".overlay").toggleClass("show");
        $("#eventModal").toggleClass("show");
        $scope.evMessage = false;
      }

      $scope.collapseEvs = function() {
        $(".collapsable-ev").toggleClass("hide");
      }

      $scope.editEvent = function(id) {
        $scope.mode = "edit";
        var ev = $scope.events.filter(function(obj) {
          return obj._id == id;
        })[0];
        ev.start = new Date(ev.start);
        ev.end = new Date(ev.end);
        $scope.eventData = ev;
        $(".overlay").toggleClass("show");
        $("#eventModal").toggleClass("show");
        console.log(ev);
      }

      $scope.deleteEvent = function(id) {
        var ev = $scope.events.filter(function(obj) {
          return obj._id == id;
        })[0];
        if (confirm('Are you sure you want to DELETE "'+ev.title+'"?')) {
          var data = {id: id};
          $http.post('/backendServices/deleteEvent', data)
            .then(function(res) {
              if (res.data.success) {
                alert("Event deleted");
                $scope.loadEvents();
              } else {
                alert("An error occurred. Please try again later");
                console.log(res.data.err);
                $scope.loadEvents();
              }
            });
          }
      }

      $scope.uploadEvent = function() {
        var serv;
        if ($scope.mode == "new") serv = "addEvent";
        else if ($scope.mode == "edit") serv = "editEvent";
        var formData = $scope.eventData;
        $http.post('/backendServices/' + serv, formData)
          .then(function(res) {
            if (res.data.success) {
              var change = ($scope.mode == "new") ? "added" : "updated";
              $scope.evMessage = "Go on ya mad champ! Event successfully " + change + ".";
              $scope.loadEvents();
            } else {
              $scope.evMessage = "Bollocks, there's something wrong."
            }
          });
      }

      $scope.logout = function() {
        $http.get('/backendServices/logout')
          .then(function(res) {
            $window.location = "/admin";
          });
      }

      $scope.loadEvents();
    }]);

}());