import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import GetTraffic from 'appkit/utils/get_traffic';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import MarkerWithLabel from 'appkit/utils/markerwithlabel';

var MapDirections = Ember.Mixin.create({

  mapCanvas: null,
  directionsDisplay: null,
  directionsService: null,

  minZoomLevel: 14,

  stepDisplay: null,
  markerArray: [],

  icons: [],
  disableControls: null,
  delay: 100,
  nextAddress: 0,

  isMobile: false,

  traffic: [],
  weather: [],

  /**
   * Main call... This really should be all you need to call if you want the map generated for you.
   *
   * @param mapDiv          -- The pointer to the div tag/element on the DOC that will contain the map
   * @param icons           -- Array of marker icon objects ({url: string, title: string, address: string, type: 'h'|'w'})
   * @param start           -- Starting point address (street: string, city: string, state: string)
   * @param end             -- Ending point address (street: string, city: string, state: string)
   * @param waypoints       -- Array of waypoints in between start and end ({location: string, stopover: true})
   * @param disableControls -- Flag (true|false) to disable map options/controls (street view, map type, marker full address).
   *                           Should be true if this is a preview.
   * @param layers          -- List of layers to apply to map
   * @param weatherZips     -- Array of zip codes to place weather markers
   * @param weatherInfo     -- Array of weather info (Note: Has to be from Weather Underground)
   */
  initialize: function (mapDiv, icons, start, end, waypoints, disableControls, layers, weatherZips, weatherInfo) {

    this.set('markerArray', []);

    // Instantiate a directions service.
    var directionsService = new window.google.maps.DirectionsService();
    this.set('directionsService', directionsService);

    var minZoomLevel = this.get('minZoomLevel');

    var myOptions = {
      zoom: minZoomLevel,
      streetViewControl: !disableControls,
      mapTypeControl: !disableControls,
//      zoomControl: !disableControls,
      zoomControlOptions: {style: window.google.maps.ZoomControlStyle.SMALL,
                           position: window.google.maps.ControlPosition.LEFT_TOP},
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    };

    var mapCanvas = new window.google.maps.Map(mapDiv, myOptions);
    this.set('mapCanvas', mapCanvas);

    if (layers) {
      if (layers.indexOf('traffic') > -1) {
//        var getTraffic = new GetTraffic();
//        getTraffic.retrieve(this, 'traffic');
//        var format = new TimeDateFormatting();
//        var infowindow = new window.google.maps.InfoWindow();
//        var markerArray = this.get('markerArray');
//        this.get('traffic').forEach(function (incident) {
//          var mapOptions = {
//            position: new window.google.maps.LatLng(incident.lat, incident.lng),
//            map: mapCanvas,
//            icon: {url: incident.iconURL.replace('http:', ''), scaledSize: new window.google.maps.Size(30, 30)},
//            title: incident.shortDesc
//          };
//          var marker = new window.google.maps.Marker(mapOptions);
//          var startTime = timezonejsDate(incident.startTime);
//          var endTime = timezonejsDate(incident.endTime);
//          var info =
//            '<div style="width: 250px;">' +
//            incident.fullDesc +
//            '<br><br>' +
//            'Starting: ' + format.formatDateMonthDayYear(startTime) + ' ' + format.formatTime(startTime) + '<br>' +
//            'Ending: &nbsp;&nbsp;' + format.formatDateMonthDayYear(endTime) + ' ' + format.formatTime(endTime) + '<br>' +
//            '(all times are estimated)<br><br>' +
//            'Severity (scale 0 to 4, 4 being the worst): ' + incident.severity + '<br><br>' +
//            'Powered by <span style="color:#167ECF;"><a href="www.mapquest.com">MapQuest</a></span>' +
//            '</div>';
//          window.google.maps.event.addListener(marker, 'click', function () {
//            infowindow.setContent(info);
//            infowindow.open(mapCanvas, marker);
//          });
//
//          markerArray.push(marker);
//        });

        var trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(mapCanvas);
      }
      if (layers.indexOf('weather') > -1)
        var self = this;
        if (weatherZips) {
          this.set('weather', []);
          weatherZips.forEach(function (zip) {
            self.showWeather(mapCanvas, zip);
          });
        } else if (weatherInfo) {
          weatherInfo.forEach(function (info) {
            self.plotWeatherMarker(mapCanvas, info);
          });

      }
    }

    // Limit the zoom level
    window.google.maps.event.addListener(mapCanvas, 'zoom_changed', function() {
      if (mapCanvas.getZoom() > minZoomLevel) {
        mapCanvas.setZoom(minZoomLevel);
      }
    });

    // Create the DIV to hold the control and call the legend constructor passing in icons.
    var legendControlDiv = this.createLegend(icons);

    legendControlDiv.index = 1;
    mapCanvas.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(legendControlDiv);

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
      map: mapCanvas,
      suppressInfoWindows: disableControls,
      suppressMarkers : true
    };
    var directionsDisplay = new window.google.maps.DirectionsRenderer(rendererOptions);
    this.set('directionsDisplay', directionsDisplay);

    // Instantiate an info window to hold step text.
    var stepDisplay = new window.google.maps.InfoWindow();
    this.set('stepDisplay', stepDisplay);

    this.calcRoute (mapCanvas, directionsService, directionsDisplay, stepDisplay, icons, start, end, waypoints, disableControls);
  },

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // Okay so you didn't want to use the automatic map creation... The following routines can be
  // used to do it yourself, but it isn't going to be easy. You'll need to setup the map yourself
  // and set vars done above before using most of them.
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // Create the legend to put on the map
  createLegend: function (icons) {

    var controlDiv = document.createElement('div');
    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map.
    controlDiv.style.padding = '5px';

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '2px';
    controlUI.style.borderRadius = '5px';
    controlUI.style.cursor = 'text';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.textAlign = 'left';

    var isMobile = this.get('isMobile');
    if (isMobile) {
      controlText.style.paddingLeft = '3px';
      controlText.style.paddingRight = '3px';
    } else {
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlText.style.paddingTop = '9px';
    }

    var innerHTML = '', tmp = '';

    // Loop through the icons to add them to the legend
    for (var i=0; i < icons.length; i++) {
      if (isMobile) {
        tmp += '<td><img src="' + icons[i].url + '" width="15px" height="15px"> ' + icons[i].title + '</td>';
        if (i % 2 === 1) {
          innerHTML += '<tr>' + tmp + '</tr>';
          tmp = '';
        }
      } else {
        controlText.innerHTML += '<p><img src="' + icons[i].url + '" width="20px" height="20px"> ' + icons[i].title + '</p>';
      }
    }
    if (isMobile) {
      if (i % 2 === 1) {
        innerHTML += '<tr>' + tmp + '</tr>';
      }
      controlText.innerHTML = '<table border="0" style="font-size: 0.9em;">' + innerHTML + '</table>';
    }

    controlUI.appendChild(controlText);

    return controlDiv;
  },

  // Warning: This is a recursive function...
  // Compute the route to be laid out on the map... Note: This will plot the markers as well
  calcRoute: function (mapCanvas, directionsService, directionsDisplay, stepDisplay, icons, start, end, waypoints, disableControls) {

    var self = this;
    var wp = waypoints || [];
    var request = {
      origin: start,
      destination: end,
      waypoints: wp,
      optimizeWaypoints: false,
      travelMode: window.google.maps.DirectionsTravelMode.DRIVING
    };
    var delay = this.get('delay');

    setTimeout(function() {
      // Route the directions and pass the response to a function to create markers for each endpoint/waypoint.
      directionsService.route(request, function (response, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          self.showMarkers(stepDisplay, mapCanvas, response, icons, disableControls);
        } else {
          // If we are over the query limit, then we need to loop back here to do it again.
          if (status === window.google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            self.set('delay', ++delay);
            self.calcRoute(mapCanvas, directionsService, directionsDisplay, stepDisplay, icons, start, end, waypoints, disableControls);
          } else {
            Ember.Logger.debug(new Date().toTimeString() + ': GM cr : ' + status);

            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.map.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.map.id,
                dialogText: Em.I18n.translations.error.map.message
              });
          }
        }
      });
    }, delay);
  },

  // Plot the markers...
  showMarkers: function (stepDisplay, mapCanvas, directionResult, icons, disableControls) {
    // Used in plotAway...
    this.set('stepDisplay', stepDisplay);
    this.set('mapCanvas', mapCanvas);
    this.set('icons', icons);
    this.set('disableControls', disableControls);

    // For only the first and every last end point, place a marker, and add the text to the marker's info window.
    for (var j = 0; j < directionResult.routes[0].legs.length; j++) {
      var myRoute = directionResult.routes[0].legs[j];

      // I know looks kinda funny but we only want the first start point and the rest of end points
      if (j === 0) {
        this.plotMarker(j, myRoute.steps[0].start_point);
      }

      this.plotMarker(j+1, myRoute.steps[myRoute.steps.length - 1].end_point);
    }
  },

  plotMarker: function(nextAddress, position) {
    var icons = this.get('icons');
    var marker = new window.google.maps.Marker({
      position: position,
      map: this.get('mapCanvas'),
      icon: {url: icons[nextAddress].url, scaledSize: new window.google.maps.Size(30, 30)}
    });
    this.attachInstructionText(this.get('stepDisplay'), this.get('mapCanvas'), marker, this.get('disableControls') ? icons[nextAddress].title : icons[nextAddress].address);
    var markerArray = this.get('markerArray');
    markerArray.push({type: icons[nextAddress].type, marker: marker});
    this.set('markerArray', markerArray);
  },

  // Process the results from the geocode result
  processResult: function (result) {
    function seek(target, long) {
      try {
        if (long) {
          return $.grep(result.address_components, function(e) { return $.inArray(target, e.types) >= 0; })[0].long_name;
        }
        return $.grep(result.address_components, function(e) { return $.inArray(target, e.types) >= 0; })[0].short_name;
      } catch(e) {
        return '';
      }
    }

    var street = '';
    var city = '';
    var state = '';

    var street_number = seek('street_number');

    // Only allow complete addresses...
    if (!Ember.isNone(street_number) && street_number !== '') {
      street = seek('route');
      city = seek('locality', true);
      state = seek('administrative_area_level_1');
    }

    return street_number + ' ' + street + ', ' + city + ', ' + state;
  },

  showWeather: function(map, zip) {
    var self = this;
    $.ajax({
      dataType: 'jsonp',
      url: '//api.wunderground.com/api/a44da2f3bcadf3ae/forecast/geolookup/conditions/q/CA/' + zip.zip + '.json',
      async: false,
      success: function (result) {
        result.location.lat = zip.lat;
        result.location.lon = zip.lon;
        self.plotWeatherMarker(map, result);
        self.get('weather').push(result);
      }
    });
  },

  plotWeatherMarker: function(map, weather) {
    var iconUrl = '/assets/img/weather/' + weather.current_observation.icon + '.gif';
    var labelText = '<img src="' + iconUrl + '" width="25" height="25"> ' +
      weather.current_observation.temp_f + '&deg;F';

    var marker = new MarkerWithLabel({
      position: new window.google.maps.LatLng(weather.location.lat, weather.location.lon),
      draggable: true,
      map: map,
      labelContent: labelText,
      labelAnchor: new window.google.maps.Point(40, 60), // the label upper left corner is left and above the position
      labelClass: "weather-labels", // the CSS class for the label
      labelStyle: {opacity: 0.75},
      icon: {
        url: '/assets/img/DRIVER.png',
        // This marker is 1 pixels wide by 1 pixels tall.
        size: new window.google.maps.Size(1, 1),
        // The origin for this image is 0,0.
        origin: new window.google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole above the actual position.
        anchor: new window.google.maps.Point(0, 52)
      }
    });

    var infoWindow = new window.google.maps.InfoWindow({
      content:
        '<div class="row" style="margin: auto;">' +
          '<div class="pull-left" style="padding-right: 5px;">' +
            '<img src="' + iconUrl + '">' +
          '</div>' +
          '<div class="pull-left" style="padding-top: 10px;">' +
            '<span style="font-size: 1.2em; font-weight: 500;">' + weather.current_observation.temp_f + '&deg;F (' + weather.current_observation.temp_c + '&deg;C) ' + weather.current_observation.weather + '</span><br>' +
            '<span style="font-size: .9em; font-weight: 500;">Wind ' +  weather.current_observation.wind_mph + ' MPH' + (parseInt(weather.current_observation.wind_gust_mph, 10) > 0 ? ' gusting to ' + weather.current_observation.wind_gust_mph + ' MPH' : '') + //weather.current_observation.wind_string + '</span><br>' + //
          '</div>' +
        '</div>' +
        '<div class="row" style="margin: auto">Powered by <span style="color:#167ECF;"><a href="' + weather.current_observation.ob_url + '" target="_blank">Weather Underground</a></span></div>'
    });
    window.google.maps.event.addListener(marker, "click", function () { infoWindow.open(map, this); });
  },


  // Adds the titles to the markers
  attachInstructionText: function (stepDisplay, mapCanvas, marker, text) {
    window.google.maps.event.addListener(marker, 'click', function() {
      // Open an info window when the marker is clicked on, containing the text of the step.
      stepDisplay.setContent(text);
      stepDisplay.open(mapCanvas, marker);
    });
  },

  // Called on to zoom into the home markers
  zoomHome: function(controller) {
    var bounds = new window.google.maps.LatLngBounds();
    var markers = controller.get('markerArray');
    var map = controller.get('mapCanvas');
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].type === 'h') {
        bounds.extend(markers[i].marker.position);
      }
    }
    map.fitBounds(bounds);
  },

  // Called on to zoom into the all markers
  zoomFull: function(controller) {
    var bounds = new window.google.maps.LatLngBounds();
    var markers = controller.get('markerArray');
    var map = controller.get('mapCanvas');
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].marker.position);
    }
    map.fitBounds(bounds);
  },

  // Called on to zoom into the work markers
  zoomWork: function(controller) {
    var bounds = new window.google.maps.LatLngBounds();
    var markers = controller.get('markerArray');
    var map = controller.get('mapCanvas');
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].type === 'w') {
        bounds.extend(markers[i].marker.position);
      }
    }
    map.fitBounds(bounds);
  }

});

export default MapDirections;