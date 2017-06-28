(function() {
    var app = angular.module('caseysnewbuffalo');

    app.controller('DashController', ['$scope', '$http', '$window', function($scope, $http, $window) {

    $scope.pageData.current = "events";

    $scope.eventData = {
      order: "start:true"
    };

    $scope.detEvOrder = function() {
      var idx = $scope.eventData.order.indexOf(":");
      return $scope.eventData.order.substring(0,idx);
    }

    $scope.detEvDir = function() {
      var idx = $scope.eventData.order.indexOf(":");
      return $scope.eventData.order.substring(idx+1) == 'true';
    }

    $scope.alert = function(str) {
      alert(str);
    }

    $scope.updatePreview = function() {
      $("#previewWindow").css("background-image", "url("+$scope.linkDrivePhoto($scope.imageEditData.current)+")")
    }

    $scope.addEvent = function() {
        var formData = {
          title: "Untitled (New)",
          start: $scope.events[0].start,
          end: $scope.events[0].end,
          description: "Type description here",
          allDay: false,
          url: "Type forwarding link here",
          img: "https://labs.xda-developers.com/static/img/default-avatar.png",
          featured: false,
          status: "edited"
        }
        $http.post('/backendServices/addEvent', formData)
          .then(function(res) {
            if (res.data.success) {
              $scope.loadEvents();
            } else {
              console.log("Error 500");
            }
          });
        $scope.loadEvents();
    }

    $scope.addItem = function() {
        var formData = {
          title: "Untitled",
          desc: "Type description here",
          price: "0.00",
          tags: ["appetizers"],
          availabilities: []
        }
        $http.post('/backendServices/addItem', formData)
          .then(function(res) {
            if (res.data.success) {
              $scope.loadItems();
            } else {
              console.log("Error 500");
            }
          });
    }

    $scope.checkStatus = function() {
      $http.get("/backendServices/isLoggedIn")
        .then(function(res) {
          console.log(res.data);
          if (!res.data.loggedIn)
            $window.location = "/admin";
          else
            $scope.userData.isLoggedIn = true;
        });
    }

    $scope.editImage = function(ev) {
      $(".overlay, .imageEditModal").addClass("show");
      $scope.imageEditData = {
        current: ev.img,
        ev: ev
      }
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

      $scope.displayMenu = function(src, pointer, location, opts) {
        console.log("trying to display menu", src, pointer, location, opts);
        PDFJS.getDocument(src).promise.then(function(pdf) {
          $scope.renderNewPage(pdf, 1, pointer, location, opts);
        });
      }

      $scope.renderNewPage = function(pdf, num, pointer, location, opts) {
        pdf.getPage(num).then(function(page) {
          var scale = 1.5;
          var viewport = page.getViewport(scale);

          var canvas = document.createElement("canvas");
          canvas.className += " menu-preview " + pointer;
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          page.render(renderContext).then(function() {
            $(location).append(canvas);
            num++;
            if (opts.numPages) {
              if (num <= opts.numPages) $scope.renderNewPage(pdf, num, pointer, location, opts);
            } else {
              if (num <= pdf.numPages) $scope.renderNewPage(pdf, num, pointer, location, opts);
            }
          });
        }, function(reason) {
          console.log("Error: " + reason);
        });
      }

      $scope.loadItems = function() {
        $http.get('/backendServices/getItems')
          .then(function(res) {
            if (res.data) {
              $scope.items = res.data;
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

      $scope.editEvent = function(ev) {
        var el = $("#edit-" + ev._id);
        var startel = $("#start-edit-" + ev._id);
        var endel = $("#end-edit-" + ev._id);
        if (ev.status != "edited") {
          ev.status = "edited";
          el.attr("data-status", "edited");


          startel.val(ev.start.substring(0,16));
          endel.val(ev.end.substring(0,16));
        } else if (ev.status == "edited") {
          ev.status = "saved";
          el.attr("data-status", "saved");

          ev.start = startel.val();
          ev.end = endel.val();

          var upEvent = {
            "_id": ev._id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            description: ev.description,
            url: ev.url,
            img: ev.img
          };

          $http.post('/backendServices/editEvent', upEvent)
            .then(function(res) {
              if (!res.data.success) {
                alert("Sorry, your change was unsuccessful.");
              }
            });
        }
      }

      $scope.editItem = function(item) {
        var el = $("#edit-" + item._id);
        if (item.status != "edited") {
          item.status = "edited";
          el.attr("data-status", "edited");
        } else if (item.status == "edited") {
          item.status = "saved";
          el.attr("data-status", "saved");

          var upItem = {
            "_id": item._id,
            title: item.title,
            desc: item.desc,
            price: item.price,
            tags: item.tags,
            availabilities: []
          };

          $http.post('/backendServices/editItem', upItem)
            .then(function(res) {
              if (!res.data.success) {
                alert("Sorry, your change was unsuccessful.");
              } else loadItems();
            });
        }
      }

      $scope.updateImage = function() {
        var upEvent = {
          "_id": $scope.imageEditData.ev._id,
          img: $scope.imageEditData.current
        };
        $scope.imageEditData.ev.img = $scope.imageEditData.current;
        $http.post('/backendServices/editEvent', upEvent)
          .then(function(res) {
            if (!res.data.success) {
              alert("Sorry, your change was unsuccessful.");
            }
          });
        $scope.clearImageData();
      }

      $scope.deleteEvent = function(ev) {

        swal({
          title: "Are you sure?",
          text: "You will not be able to recover this event!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
        },
        function(){
          $http.post('/backendServices/deleteEvent', ev)
            .then(function(res) {
              if (res.data.success) {
                swal("Deleted!", "Your event has been deleted.", "success");
                $scope.loadEvents();
              } else {
                swal("Error", "Unfortunately your event could not be deleted", "error");
                console.log(res.data.err);
                $scope.loadEvents();
              }
            });
          });
      };

      $scope.linkDrivePhoto = function(url) {
        if (url.indexOf("drive.google.com") > -1) {
          var tokens = url.split("/");
          return "https://www.drive.google.com/uc?id=" + tokens[tokens.indexOf("d")+1];
        } else if (url.indexOf("dropbox.com") > -1) {
          return url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
        } else {
          return url;
        }
      }

      $scope.clearImageData = function() {
        $(".overlay, .imageEditModal").removeClass("show");
        $scope.imageEditData = {};
      }

      $scope.uploadEvent = function() {
        var serv;
        if ($scope.mode == "new") serv = "addEvent";
        else if ($scope.mode == "edit") serv = "editEvent";
        $scope.eventData.start = new Date($scope.eventData.start.getTime());
        $scope.eventData.end = new Date($scope.eventData.end.getTime());
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

      $scope.updateFeatured = function(ev) {
        var upEvent = {
          "_id": ev._id,
          title: ev.title,
          start: new Date(ev.start),
          end: new Date(ev.end),
          description: ev.description,
          url: ev.url,
          img: ev.img
        };

        var el = $("#fav-" + ev._id);
        upEvent.featured = !(el.attr("data-checked") == "true");
        el.attr("data-checked", upEvent.featured);

        $http.post('/backendServices/editEvent', upEvent)
          .then(function(res) {
            if (!res.data.success) {
              alert("Sorry, your change was unsuccessful.");
            }
          });
      }

      $scope.loadEvents();
      $scope.loadItems();
    }]);

    app.filter('dateInMillis', function() {
      return function(dateString) {
        return Date.parse(dateString);
      };
    });

    app.filter('arrPrint', function() {
      return function(arr) {
        return arr.join(" ");
      };
    });

}());
