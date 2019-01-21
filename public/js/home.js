(function(){
  $(document).ready(function() {
    AOS.init({
      duration: 1000
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
      if (!isMobile) {
        $(".menu-block .block-overlay").removeClass("show");
        $(this).find(".block-overlay").addClass("show");
      }
    });

    if (isMobile) {
      $(".block-overlay").css("background-color", "rgba(0,0,0,0.2)");
      $(".menu-block .block-overlay").addClass("show");
    }

    $(".map-overlay").click(function() {
      $(this).addClass("hide");
      $(this).removeClass("show");
    });

    $(".text-ad-close").click(function() {
      $(".text-ad").css("display", "none");
    });

    $("#show-360").click(function() {
      $("#overlay").toggleClass("show");
      $("#tour-360").toggleClass("show");
      $("body").toggleClass("noscroll");
      $("#tour-360 iframe").animateCss("zoomIn");
    });

    $(document).on('click','#events-more',function() {
      $("#overlay").toggleClass("show");
      $("#events-pu").toggleClass("show");
      $("body").toggleClass("noscroll");

      $.get('/backendServices/getEvents', function(data) {
        const response = data.events;
        for (var i = 0; i < response.length; i++) {
          response[i].start = new Date(response[i].start_time);
          response[i].end = new Date(response[i].end_time);
          delete response[i].start_time;
          delete response[i].end_time;
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
              events: response,
              eventRender: function(event, element) {
                if (event.name.toLowerCase().indexOf("notre dame") >= 0) {
                  element.css("background", "#3EA632");
                }
                if (event.background) {
                  element.css("background", event.background);
                }
                element.text(event.name);
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
      if (isMobile) {
        $('.offscreen-nav').toggleClass("onscreen");
        $('.offscreen-nav-wrapper').toggleClass("onscreen-wrapper");
      } else {
        $(".top-nav").animate({width: 'toggle'});
      }
    });

    $(".offscreen-nav a").click(function() {
      $("#menu").toggleClass("open");
      $('.offscreen-nav').toggleClass("onscreen");
      $('.offscreen-nav-wrapper').toggleClass("onscreen-wrapper");
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
        var captionText = (imgs[i].caption == null) ? "" : (imgs[i].caption.text.length > 100) ? imgs[i].caption.text.substring(0,100) + "..." : imgs[i].caption.text;
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

    $.get('/backendServices/upcomingEvents', function(data) {
      var evs = data.events;
      var length = (evs.length > 3) ? 4 : evs.length;
      for (var i = length-1; i >= 0; i--) {
        var date = moment(evs[i].start_time).format("MMMM Do @ h:mm a");
        const link = `https://facebook.com/events/${evs[i].id}`;
        var anchor = $('<a href='+link+'></a>');
        l = i;
        if (isMobile) l = 7;
        var div = $("<div class='ev-box' data-aos='fade-left' data-aos-delay="+(1400-l*200)+" data-aos-anchor-placement='center-bottom'></div>");
        if (evs[i].image) div.css("background-image", "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(" + evs[i].image + ")");
        div.append($("<h4></h4>").text(evs[i].name), $("<p></p>").text(date));
        anchor.append(div);
        if (i > 2) anchor.addClass("desktop-item");
        $("#featured-evs").append(anchor);
      }
      var div = $("<div id='events-more' class='ev-box' data-aos='fade-left' data-aos-delay='1400' data-aos-anchor-placement='center-bottom'></div>");
      div.css("background", "linear-gradient(rgba(25,25,25,0.8), rgba(25,25,25,0), rgba(25,25,25,0.8))");
      div.append($("<h4></h4>").text("See More"), $("<p></p>").text("View calendar"));
      $("#featured-evs").append(div);
      if (isMobile) $("#events-more div").attr("data-aos-delay", "0");

    });

    if (!isMobile) $("#location-map iframe, .map-overlay").height($("#contact-info").height());

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
      var panels = ["#tour-360","#food", "#beer", "#brunch", "#cocktails", "#carryout", "#desserts", "#wine", "#contact-form", "#job-form", "#events-pu", "#tendollarlunch"];
      for (var i = 0; i < panels.length; i++) {
        var p = $(panels[i]);
        p.removeClass("show");
      }
      $(".spinner").removeClass("show");
    });

    $("#job-form form").submit(function(e) {
      var appData = {
        first_name: $("#job_first_name").val(),
        last_name: $("#job_last_name").val(),
        email: $("#job_email").val(),
        phnum: $("#job_phone").val(),
        position: $("#job_position").val(),
        message: $("#job_message").val()
      }
      $.post("/backendServices/applyToWork", appData, function(res) {
        if (res.success) {
          swal({
            title: "Your application has been submitted",
            text: "Please print and fill out the application form below and email to caseysnb136@gmail.com. We will contact you soon. <br/><a style='color: #2F61DB' href='/img/caseys_application_for_employment.pdf' target='_blank'>Caseys's Job Application</a>",
            html: true,
            type: "success"
          }, function() {
            window.open("/img/caseys_application_for_employment.pdf", "_blank");
          });
        } else {
          swal({
            title: "Unfortunately, there was an error with our servers",
            text: "Please print & fill out the application form below and email to caseysnb136@gmail.com.<br/><a style='color: #2F61DB' href='/img/caseys_application_for_employment.pdf' target='_blank'>Caseys's Job Application</a>",
            html: true,
            type: "error"
          }, function() {
            window.open("/img/caseys_application_for_employment.pdf", "_blank");
          });
          console.log(res.err);
        }

        $("#overlay").toggleClass("show");
        $("body").toggleClass("noscroll");
        $("#job-form").removeClass("show");
      });

      return false;
    });

    $("#btn-oo").click(function() {
      $("#overlay").toggleClass("show");
      $("body").toggleClass("noscroll");
      $("#food").toggleClass("show");
    });

    $("#contact").click(function() {
      $("#menu").toggleClass("open");
      $('.offscreen-nav').toggleClass("onscreen");
      $('.offscreen-nav-wrapper').toggleClass("onscreen-wrapper");
      $("#overlay").toggleClass("show");
      $("#contact-form").toggleClass("show");
      $("body").toggleClass("noscroll");
    });

    $(".jobs-trigger").click(function() {
      if ($(this).hasClass("nav-item")) {
        $("#menu").toggleClass("open");
        $('.offscreen-nav').toggleClass("onscreen");
        $('.offscreen-nav-wrapper').toggleClass("onscreen-wrapper");
      }
      $("#overlay").toggleClass("show");
      $("#job-form").toggleClass("show");
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
        var currentMenu = "/img/menus/dinner.pdf";
        displayMenu(currentMenu,"dinnerMenu","#food");
      }
    });

    $(".brunchLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#brunch").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#brunch").find("canvas").length == 0) {
        var currentMenu = "/img/menus/brunch.pdf";
        displayMenu(currentMenu,"brunchMenu","#brunch");
      }
    });

    $(".beerLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#beer").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#beer").find("canvas").length == 0) {
        var currentMenu = "/img/menus/beer.pdf";
        displayMenu(currentMenu,"beerMenu","#beer");
      }
    });

    $(".wineLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#wine").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#wine").find("canvas").length == 0) {
        var currentMenu = "/img/menus/wine.pdf";
        displayMenu(currentMenu,"wineMenu","#wine");
      }
    });

    $(".cocktailsLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#cocktails").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#cocktails").find("canvas").length == 0) {
        var currentMenu = "/img/menus/cocktails.pdf";
        displayMenu(currentMenu,"cocktailsMenu","#cocktails");
      }
    });

    $(".carryoutLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#carryout").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#carryout").find("canvas").length == 0) {
        var currentMenu = "/img/menus/carryout.pdf";
        displayMenu(currentMenu,"carryoutMenu","#carryout");
      }
    });

    $(".dessertsLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#desserts").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#desserts").find("canvas").length == 0) {
        var currentMenu = "/img/menus/desserts.pdf";
        displayMenu(currentMenu,"dessertsMenu","#desserts");
      }
    });

    $(".tendollarlunchLink").click(function() {
      $("#overlay").toggleClass("show");
      $("#tendollarlunch").toggleClass("show");
      $("body").toggleClass("noscroll");
      $(".spinner").toggleClass("show");
      if ($("#tendollarlunch").find("canvas").length == 0) {
        var currentMenu = "/img/menus/tendollarlunch.pdf";
        displayMenu(currentMenu,"tendollarlunchMenu","#tendollarlunch");
      }
    });

    $("#contact-fullscreen").submit(function(e) {
      var formData = {
        name: $("#first_name").val() + " " + $("#last_name").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
        message: $("#message").val()
      }

      $.post("/backendServices/sendMessage", formData, function(data) {
        if (data.success) swal("Your message has been sent", "We will respond as soon as possible.", "success");
        else swal("There was an error with our servers", "Please call (269) 469-6400 or email caseysnb136@gmail.com", "error");

        $("#overlay").toggleClass("show");
        $("body").toggleClass("noscroll");
        $("#contact-form").removeClass("show");
      });

      return false;
    });

    Date.prototype.yyyymmdd = function() {
      var mm = this.getMonth() + 1; // getMonth() is zero-based
      var dd = this.getDate();

      return [this.getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
            ].join('-');
    };

    $("#reservation fieldset").css("height", $(".datepicker").height());

    var setUpReservations = function(str) {
      var d = moment(str);
      d.hours(11);
      d.minutes(59);
      var timeSelect = $("#reserve-time-block");
      var day = d.hours();
      var close = (day > 0 && day < 5) ? 21 : 22;
      var today = new moment();
      var time = (d.dayOfYear() == today.dayOfYear()) ? today.hours() : d.hours();
      $("#reserve-time-block").find("option").remove();
      if (d.minutes() < 30) {
        var am = (time < 12) ? "am" : "pm";
        var t = (time % 12 == 0) ? 12 : time % 12;
        timeSelect.append($("<option></option>").val("" + t + ":30" + am).text("" + t + ":30" + am));
      }
      for (var i = time + 1; i < close; i++) {
        var am = (i < 12) ? "am" : "pm";
        var t = (i % 12 == 0) ? 12 : i % 12;
        timeSelect.append($("<option></option>").val("" + t + ":00" + am).text("" + t + ":00" + am));
        timeSelect.append($("<option></option>").val("" + t + ":30" + am).text("" + t + ":30" + am));
      }
      if ($("#reserve-time-block option").length == 0) {
        timeSelect.append($("<option disabled selected></option>").val("null").text("No times available"));
      }
    }
    var today = new Date();
    $("#reserve-date-block").val(today.yyyymmdd());
    setUpReservations(today);

    $("#reserve-date-block").change(function() {
      var str = $(this).val()
      setUpReservations(str);
    });

    $("#reserve-table").submit(function(e) {
      var formData = {
        name: $("#res-name").val(),
        email: $("#res-email").val(),
        phnum: $("#res-phnum").val(),
        size: $("#res-size").val(),
        date: $("#reserve-date-block").val(),
        time: $("#reserve-time-block").val()
      }

      $.post("/backendServices/reserveTable", formData, function(data) {
        if (data.success) swal("Your request has been sent", "Please wait for an email confirmation or call (269) 469-6400", "success");
        else swal("There was an error with your request", "Please call (269) 469-6400", "error");
      });

      return false;
    });

    $("#reserve-table").submit(function(e) {
      var formData = {
        name: $("#res-name").val(),
        email: $("#res-email").val(),
        phnum: $("#res-phnum").val(),
        size: $("#res-size").val(),
        date: $("#reserve-date-block").val(),
        time: $("#reserve-time-block").val()
      }

      $.post("/backendServices/reserveTable", formData, function(data) {
        if (data.success) swal("Your request has been sent", "Please wait for an email confirmation or call (269) 469-6400", "success");
        else swal("There was an error with your request", "Please call (269) 469-6400", "error");
      });

      return false;
    });

    $("#sendMessage").submit(function(e) {
      var formData = {
        name: $("#contact-name").val(),
        email: $("#contact-email").val(),
        phnum: $("#contact-phnum").val(),
        message: $("#contact-msg").val()
      }

      $.post("/backendServices/sendMessage", formData, function(data) {
        if (data.success) swal("Your message has been sent", "We will respond as soon as possible.", "success");
        else swal("There was an error with our servers", "Please call (269) 469-6400 or email phil@caseysnewbuffalo.com", "error");
      });

      return false;
    });


  });
}());
