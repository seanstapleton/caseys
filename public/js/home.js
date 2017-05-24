(function(){
  $(document).ready(function() {
    AOS.init({
      duration: 1000
    });

    $.fn.extend({
      animateCss: function (animationName) {
          var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
          this.addClass('animated ' + animationName).one(animationEnd, function() {
              $(this).removeClass('animated ' + animationName);
          });
      }
  });

    var isMobile = !window.matchMedia('(min-width: 960px)').matches;

    $(".menu-block").mouseover(function() {
      $(".menu-block .block-overlay").removeClass("show");
      $(this).find(".block-overlay").addClass("show");
    });

    $(".top-nav").sticky({topSpacing: 0});

    $(".map-overlay").click(function() {
      $(this).addClass("hide");
      $(this).removeClass("show");
    });

    $("#show-360").click(function() {
      $("#overlay").toggleClass("show");
      $("#tour-360").toggleClass("show");
      $("body").toggleClass("noscroll");
      $("#tour-360 iframe").animateCss("zoomIn");
    });

    $("#events-more").click(function() {
      $("#overlay").toggleClass("show");
      $("#events-pu").toggleClass("show");
      $("body").toggleClass("noscroll");

      $.get('/backendServices/getEvents', function(data) {
        console.log("data", data);
        for (var i = 0; i < data.length; i++) {
          data[i].start = new Date(data[i].start);
          data[i].end = new Date(data[i].end);
        }
        $('#events-calendar').fullCalendar({
              theme: true,
              header: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'month,agendaWeek,agendaDay'
              },
              editable: false,
              weekMode: 'liquid',
              url: '#',
              events: data,
              eventRender: function(event, element) {
                if (event.title.toLowerCase().indexOf("notre dame") >= 0) {
                  element.css("background", "#3EA632");
                }
                if (event.background) {
                  element.css("background", event.background);
                }
                element.text(event.title);
                element.tooltip({title: event.description});
                if (event.image) {
                  var image = $('<img>').attr("src",event.image);
                  var oe = element;
                  element = $('<div>')
                  element.append(oe).append(image);
                }
              },
              eventClick: function(event, jsEvent, view) {
                  window.location.href=event.url;
              }
          });
      });

    })

    $("#menu").click(function() {
      $(this).toggleClass("open");
      $('.offscreen-nav').toggleClass("onscreen");
      $('.offscreen-nav-wrapper').toggleClass("onscreen-wrapper");
    });

    $(".offscreen-nav a").click(function() {
      $("#menu").toggleClass("open");
      $('.offscreen-nav').toggleClass("onscreen");
    });

    $(document).scroll(function() {
      if ($(".map-overlay").hasClass("hide")) {
        $(".map-overlay").addClass("show");
        $(".map-overlay").removeClass("hide");
      }
    });

    $('.datepicker').datepicker({
        onSelect: function(dateText, inst) {
          $("input[name='dateval']").val(dateText);
        },
        minDate: 0
    });
    $("#time").selectmenu();
    $("#party").selectmenu();
    $("#time-desktop").selectmenu();
    $("#party-desktop").selectmenu();

    $("#reserve-btn").click(function() {
      var d = ($("input[name='dateval']").val().length > 0) ? new Date($("input[name='dateval']").val()).toISOString().substring(0,10) : new Date().toISOString().substring(0,10);
      var t = $("#time").val();
      var p = $("#party").val();
      window.open("https://www.yelp.com/reservations/the-harp-and-fiddle-park-ridge?date="+d+"&time="+t+"&covers="+p, "_blank");
    });

    $("#reserve-btn-desktop").click(function() {
      var d = ($("input[name='dateval']").val().length > 0) ? new Date($("input[name='dateval']").val()).toISOString().substring(0,10) : new Date().toISOString().substring(0,10);
      var t = $("#time-desktop").val();
      var p = $("#party-desktop").val();
      window.open("https://www.yelp.com/reservations/the-harp-and-fiddle-park-ridge?date="+d+"&time="+t+"&covers="+p, "_blank");
    });

    $.post('/backendServices/insta', function(data) {
      var imgs = data.data.slice(0,5);
      for (var i = 0; i < imgs.length; i++) {
        var div = $("<div id='guess' data-aos='fade-left' data-aos-delay='"+i*100+"' class='soc-box'></div>");
        var overlay = $("<div class='insta-overlay'></div>");
        overlay.attr("href", imgs[i].link);
        var likes = $("<p></p>").text(imgs[i].likes.count).addClass("insta-likes");
        var comments = $("<p></p>").text(imgs[i].comments.count).addClass("insta-comments");
        var captionText = (imgs[i].caption.text.length > 100) ? imgs[i].caption.text.substring(0,100) + "..." : imgs[i].caption.text;
        var caption = $("<p></p>").text(captionText).addClass("insta-caption");
        overlay.append(likes,comments,caption);
        div.css("background-image", "url(" + imgs[i].images.standard_resolution.url+")");
        div.append(overlay);
        $("#ig-links").append(div);
      }
      if (isMobile) {
        $("#ig-links").slick({
          autoplay: true,
          arrows: true,
          fade: true,
          speed: 1500
        });
      }
    });

    $("#ig-links").on('mouseover', 'div', function() {
      if (!isMobile) $(this).find(".insta-overlay").css("display", "block");
    });
    $("#ig-links").on('mouseout', 'div', function() {
      if (!isMobile) $(this).find(".insta-overlay").css("display", "none");
    });
    $("#ig-links").on('click', 'div.insta-overlay', function() {
      window.open($(this).attr("href"), "_blank");
    });

    $.get('/backendServices/featuredEvents', function(data) {
      var evs = data.events;
      var length = (evs.length > 6) ? 7 : evs.length;
      console.log(length);
      for (var i = length-1; i >= 0; i--) {
        var date = moment(evs[i].start).format("MMMM Do @ h:mm a");
        var anchor = $('<a href='+evs[i].url+'></a>');
        l = i;
        if (isMobile) l = 7;
        var div = $("<div class='ev-box' data-aos='fade-left' data-aos-delay="+(0)+" data-aos-anchor-placement='center-bottom'></div>");
        if (evs[i].img) div.css("background-image", "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(" + evs[i].img + ")");
        div.append($("<h4></h4>").text(evs[i].title), $("<p></p>").text(date));
        anchor.append(div);
        if (i < 4) anchor.addClass("desktop-item");
        $("#db-evs").append(anchor);
      }
      if (isMobile) $("#events-more div").attr("data-aos-delay", "0");

    });

    // $.get('/backendServices/getFBID', function(fbid) {
    //   $.get('https://graph.facebook.com/parkridgebar/photos?type=uploaded&&access_token=' + fbid, function(data) {
    //     var imgs = data.data.slice(0,3);
    //     console.log(imgs);
    //     for (var i = 0; i < imgs.length; i++) {
    //       var div = $("<div data-aos='zoom-in' class='soc-box'></div>");
    //       div.css("background-image", "url(" + imgs[i].source+")");
    //       $("#fb-links").append(div);
    //     }
    //   })
    // });

    $(".menu-box").click(function() {
      var pointer = $(this).attr("data-pt");
      $("#close").attr("data-pt",pointer);
      if ($("." + pointer)[0])
        $("."+pointer).toggleClass("show");
      else {
        displayMenu($(this).attr("href"), pointer);
      }
      $("#overlay").toggleClass("show");
      $("body").toggleClass("noscroll");
    });

    var displayMenu = function(src, pointer, location) {
      PDFJS.getDocument(src).promise.then(function(pdf) {
        renderNewPage(pdf, 1, pointer, location);
      });
    }

    var renderNewPage = function(pdf, num, pointer, location) {
      pdf.getPage(num).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);



        var canvas = document.createElement("canvas");
        canvas.className += " menu-page show " + pointer;
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
          if (num <= pdf.numPages) renderNewPage(pdf, num, pointer, location);
          $(".spinner").removeClass("show");
        });
      }, function(reason) {
        console.log("Error: " + reason);
      });
    }

    $("#close").click(function() {
      $("#overlay").toggleClass("show");
      $("body").toggleClass("noscroll");
      var panels = ["#tour-360","#food", "#drinks", "#cocktails", "#contact-form", "#events-pu"];
      for (var i = 0; i < panels.length; i++) {
        var p = $(panels[i]);
        if (p.hasClass("show")) p.toggleClass("show");
      }
      $(".spinner").removeClass("show");
    });

    $("#btn-oo").click(function() {
      $("#overlay").toggleClass("show");
      $("body").toggleClass("noscroll");
      $("#food").toggleClass("show");
    });

    $(function() {
      $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 2000);
            return false;
          }
        }
      });
    });

    $("#contact").click(function() {
      $("#overlay").toggleClass("show");
      $("#contact-form").toggleClass("show");
      $("body").toggleClass("noscroll");
    });

    $("#contact-topnav").click(function() {
      $("#overlay").toggleClass("show");
      $("#contact-form").toggleClass("show");
      $("body").toggleClass("noscroll");
    });

    $("#email-info").click(function() {
      $("#overlay").toggleClass("show");
      $("#contact-form").toggleClass("show");
      $("body").toggleClass("noscroll");
    });

    $(".foodLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#food").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#food").find("canvas").length == 0) {
        var currentMenu = $("#foodMenuSelector").find(":selected");
        displayMenu(currentMenu.val(),currentMenu.text(),"#food");
      }
    });

    $("#foodMenuSelector").change(function() {
      var currentMenu = $(this).find(":selected");

      $(".spinner").toggleClass("show");

      $("#food").find("canvas").each(function() {
        if (!$(this).hasClass(currentMenu.text()) && $(this).hasClass("show")) $(this).toggleClass("show");
      });

      var menuObj = $("#food").find("." + currentMenu.text());
      if (menuObj.length != 0 && !menuObj.hasClass("show")) {
        menuObj.toggleClass("show");
        $(".spinner").removeClass("show");
      } else if (menuObj.length == 0){
        displayMenu(currentMenu.val(),currentMenu.text(),"#food");
      }
    });

    $("#drinksMenuSelector").change(function() {
      var currentMenu = $(this).find(":selected");

      $(".spinner").toggleClass("show");

      $("#drinks").find("canvas").each(function() {
        if (!$(this).hasClass(currentMenu.text()) && $(this).hasClass("show")) $(this).toggleClass("show");
      });

      var menuObj = $("#drinks").find("." + currentMenu.text());
      if (menuObj.length != 0 && !menuObj.hasClass("show")) {
        menuObj.toggleClass("show");
        $(".spinner").removeClass("show");
      } else if (menuObj.length == 0){
        displayMenu(currentMenu.val(),currentMenu.text(),"#drinks");
      }
    });

    $(".drinksLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#drinks").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#drinks").find("canvas").length == 0) {
        var currentMenu = $("#drinksMenuSelector").find(":selected");
        displayMenu(currentMenu.val(),currentMenu.text(),"#drinks");
      }
    });

    $(".cocktailsLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#cocktails").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#cocktails").find("canvas").length == 0) {
        var currentMenu = $("#cocktailsMenuSelector").find(":selected");
        displayMenu(currentMenu.val(),currentMenu.text(),"#cocktails");
      }
    });



    $("#contact-form-submit").click(function() {
      var formData = {
        name: $("#name").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
        subject: $("#subject").val(),
        message: $("#message").val()
      }


      $.post("/backendServices/sendMessage", formData, function(data) {
        var response;
        var msg = {
          "success": "Your message was sent",
          "error": "please try sending an email to declan@theharpandfiddle.com instead!"
        }
        if (data.success) {
          response = "success";
          alert(reponse);
        }
        else {
          response = "error";
        }
        swal("success", "message", "success");
        $("#contact-inputs").toggleClass("hide");
        swal("success1", "message", "success");
        alert("test");
      });
    });

    $("#reservation fieldset").css("height", $(".datepicker").height());

  });
}());
