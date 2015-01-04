import MapDialog from 'appkit/utils/map_dialog';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import MarkerWithLabel from 'appkit/utils/markerwithlabel';
import Spinner from 'appkit/utils/spinner';

var RideMatchMixinController = Ember.Mixin.create({
  needs: ['application'],

  /* vars */
  version: 'unknown',

  sortProperties: ['matchScore'],
  sortAscending: true,

  hasntInteracted: true,

  rideTypes: [{name: "Drivers and Passengers", value: 'either'}, {name: 'Drivers Only', value: 'driver'}, {name: 'Passengers Only', value: 'passenger'}],
  rideType: {value: 'either'},
  listeningPrefOptions: null,

  sortOrder: [{name: "Compatibility", value: "matchScore", asc: false}, {name: "Miles", value: "recDefaults.deflectMeters", asc: true},
              {name: "Home Departure Time", value: "homeDepartureTimestamp", asc: true}, {name: "Work Departure Time", value: "workDepartureTimestamp", asc: true}],
  selectedSort: null,

  // Called from application controller dispatchAlert. The "Map the Ride" link below has a onclick event which triggers this call.
  mapTheRide: function(controller, id) {
    // Have to look through the recommendations for the id to get the necessary info to do the dialog
    var recommendation = controller.get('filteredRecommendations').findBy('id', id);
    controller.send('showRoute', recommendation.get('member'), recommendation.get('recDefaults.role'));
  },

  init: function() {
    this.get('controllers.application').set('ride_match_controller', this);

//    if (this.get('controllers.login.onDesktop')) {
//      this.set('rideType', null);
//    }
    var view = this;

    var resizeHandler = function() {
      if (view.get('maxSuperMap')) {
        view.computeMapHeight(view);
      }
    };

    this.set('resizeHandler', resizeHandler);
    $(window).bind('resize', this.get('resizeHandler'));
  },

  willDestroy: function() {
    this.set('map', null);
    $(window).unbind('resize', this.get('resizeHandler'));
  },

  recommendations: null,
  filteredRecommendations: function() {
    if (Ember.isNone(this.get('recommendations'))) return null;
    var listeningPrefOptions = this.get('listeningPrefOptions');
    if (Ember.isNone(listeningPrefOptions)) return this.get('recommendations');

    var rideType = this.get('rideType.value');
    var eitherRideType =  rideType === 'either';
    var driver = rideType === 'driver';
    var passenger = rideType === 'passenger';

    var results = this.get('recommendations').filter(function(item, index, enumerable){
      for (var i = 0; i < listeningPrefOptions.length; i++) {
        if (Ember.isNone(item.get('member.listeningPrefs')) || Ember.isNone(item.get('member.listeningPrefs')[0]) ||
          (!Ember.isNone(item.get('member.listeningPrefs')[0]) && item.get('member.listeningPrefs')[0].optionId === listeningPrefOptions[i].id)) {
          if (listeningPrefOptions[i].checked && (eitherRideType || (item.get('member.hasCar') && driver) || (!item.get('member.hasCar') && passenger))) return true;
        }
      }

      return false;
    });

    var controller = this;
    setTimeout(function(){
      controller.refreshMap(controller, true);
    }, 250);

    if (!Ember.isNone(this.get('selectedSort'))) {
      return Em.ArrayProxy.createWithMixins(
        Ember.SortableMixin, { content: results, sortProperties: [this.get('selectedSort.value')], sortAscending: this.get('selectedSort.asc')}
      );
    }

    return results;
  }.property('selectedSort', 'rideType', 'recommendations'),

  mapPartnerId: null,

  goToTD: function(controller) {
    controller.transitionToRoute('member.trip_proposal', controller.get('currentMember.id'), controller.get('mapPartnerId'), 0, 0);
  },

  rideTypeValue: 'either',
  watchRideTypeValue: function () {
      this.set('rideType', {value: this.get('rideTypeValue')});
  }.observes('rideTypeValue'),

  rideContent: [
    {label: '', value: 'either', img: '/assets/img/DANDP.png'},
    {label: '', value: 'driver', img: '/assets/img/DRIVER.png'},
    {label: '', value: 'passenger', img: '/assets/img/PASSENGER.png'}
  ],


  //-----------------------------
  // start BAM stuff
  //-----------------------------

  displayMap: false,
  map: null,
  markerArray: null,
  mapStyle: null,
  maxSuperMap: true,
  mapCenter: null,

  computeMapHeight: function(controller) {
    var h = window.innerHeight - 165;
    if (controller.get('controllers.login.onDesktop')) {
      h = Math.floor(window.innerHeight * 0.4);
    if (h > 400) {h = 400;} else if (h < 100) {h = 100;}
    }
    controller.set('mapStyle', "width: 100%; height: " + h + "px;"); //border: 1px #aaaaaa solid;
  },

  // NOTE: This function is called a total of 3 times the first time the page is rendered!!!
  // First to simple display the current member's location and display the map. So we don't have a blank box for too long.
  // Second time to start the display of the markers... Unfortunately there may note enough info load yet to do them all.
  // Third time is a charm... Hopefully 10 seconds is long enough to get all the info for all the markers.
  refreshMap: function(controller, skip) {
    if (!controller.get('displayMap')) return;
    var map = null;
    var infowindow = new window.google.maps.InfoWindow();
    var onDesktop = this.get('controllers.login.onDesktop');

    // See if we already have a map defined...
    if (!Ember.isNone(controller.get('map'))) {
      // wipe the old markers
      var ma = controller.get('markerArray');
      if (!Ember.isNone(ma)) {
        for (var i = 0; i < ma.length; i++) {
          ma[i].setMap(null);
        }
      }
      map = controller.get('map');
    } else {
      // If Ember hasn't loaded the homeLocation then we can't do anything... Hopefully it will be available the next round (see head note above)
      if (Ember.isNone(controller.get('currentMember.homeLocation.latitude')) || Ember.isNone(controller.get('currentMember.homeLocation.longitude'))) {
        return;
      }

      // Need to create the map object...
      var memberLocation = new window.google.maps.LatLng(controller.get('currentMember.homeLocation.latitude'), controller.get('currentMember.homeLocation.longitude'));
      var mapOptions = {
        center: memberLocation,
        zoom: 12,
        panControl:false,
        streetViewControl: false,
        zoomControl: onDesktop,
        mapTypeControl: false,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControlOptions: {style: window.google.maps.ZoomControlStyle.SMALL}
      };

      try {
        map = new window.google.maps.Map(document.getElementById("map_recommendations"), mapOptions);
      } catch(e) {
        return;
      }
      controller.set('map', map);

      // Add the size toggle and home buttons to the map...
      var buttonControlDiv = document.createElement('div');
      // Set CSS styles for the DIV containing the control
      // Setting padding to 5 px will offset the control
      // from the edge of the map
      buttonControlDiv.style.paddingBottom = '25px';
      buttonControlDiv.style.marginLeft = '-68px';

//      if (onDesktop) {
//        controller.mapToggleControl(buttonControlDiv, map, controller); // Add the map toggle button
//      }
      controller.mapHomeControl(buttonControlDiv, map, controller);   // Add the "home" button

      buttonControlDiv.index = 1;
      map.controls[window.google.maps.ControlPosition.BOTTOM_LEFT].push(buttonControlDiv);

      // Special case... We only want the legend on the desktop. Not enough room on the mobile.
//      if (onDesktop) {
//        // Create the DIV to hold the control and call the legend constructor passing in icons.
//        var legendControlDiv = controller.createLegend();
//
//        legendControlDiv.index = 1;
//        map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(legendControlDiv);
//      }

      // Limit the zoom level
      window.google.maps.event.addListener(map, 'zoom_changed', function () {
        if (map.getZoom() > 14) {
          map.setZoom(14);
        }
      });

      // Add the current member's marker
      var marker = new window.google.maps.Marker({
        position: memberLocation,
        map: map,
        title: "You"
      });

      this.makeInfoWindowEvent(map, infowindow, 'You <img src="' + controller.get('currentMember.profilePhotoUrl') + '" width="30px" height="30px">  ', marker);

      // Little bit of house keeping... Store the map center, which should be the current member's home and track the center as the map is resized.
      controller.set('mapCenter', map.getCenter());
      window.google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        window.google.maps.event.trigger(map, "resize");
        controller.set('mapCenter', center);
      });
    }

    controller.set('markerArray', controller.makeInfoMarkerArray(controller, map, infowindow, onDesktop, skip));
  },

  makeInfoMarkerArray: function(controller, map, infowindow, onDesktop, skip){
    // Ok... Now add all (or most) of the markers for the recommendations (see head note above)
    var markerArray = [], memberId = controller.get('currentMember.id');
    controller.get('filteredRecommendations').forEach(function (recommendation) {
      var url = recommendation.get('member.hasCar') ? '/assets/img/DRIVER.png' : '/assets/img/PASSENGER.png';
      var mapOptions = {
        position: new window.google.maps.LatLng(recommendation.get('member.homeLocation.latitude'), recommendation.get('member.homeLocation.longitude')),
        map: map,
        icon: {url: url, scaledSize: new window.google.maps.Size(30, 30)},
        title: recommendation.get('member.fullName')
      };

      // If this is the third round, don't do the DROP animation, please...
      if (Ember.isNone(skip)) {
        mapOptions.animation =  window.google.maps.Animation.DROP;
      }
      var marker = new window.google.maps.Marker(mapOptions);

      // This forms the click event for the marker, which shows the bubble info window
      var bubble="One moment please...";
      if(!Ember.isNone(skip)) {
        var photo = recommendation.get('member.profilePhotoUrl');
        var deflection = (Ember.isNone(recommendation.get('recDefaults.deflectMiles')) ? '0' : recommendation.get('recDefaults.deflectMiles')) + 'mi ';
        var pickADay = '<a href="#/members/' + memberId + (onDesktop ? '/trip_proposal/' + recommendation.get('member.id') + '/0/0' : '/pick_date/' + recommendation.get('member.id')) + '">Pick a Day</a>';
        var mapTheRide = (onDesktop ? '<a id="rm' + recommendation.get('id') + '" onclick="window.sendAlert(this);' : '<a href="#/members/' + memberId + '/map_the_ride/' + recommendation.get('member.id') + '/0' ) + '">Map the Ride</a>';

        bubble =
          '<div class="pull-left" style="padding-right: 5px; padding-bottom: 2px;">' +
            '<a href="#/members/' + recommendation.get('member.id') + '/profile">' +
              '<img src="' + (Ember.isNone(photo) ? '//hovee001.s3.amazonaws.com/profile_images/default.jpg' : photo + '" onerror="this.onerror=null;this.src=\'//hovee001.s3.amazonaws.com/profile_images/default.jpg\';' ) + '" width="68px" height="67px">' +
            '</a>' +
            '<br><div style="font-size: 0.8em; width: 68px; padding-top: 2px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + deflection + '$departureTime</div>' +
          '</div>' +
          '<div class="pull-left">' +
            '<div style="height: 67px;">' +
              '<span style="color:#167ECF; font-size: 1.3em; font-weight: 500"><a href="#/members/' + recommendation.get('member.id') + '/profile">' + recommendation.get('member.fullName') +'</a></span><br>' +
            '<div>$jobTitle<br>$companyName</div>' +
            '</div>' +
            '<div style="font-size: 1.0em; text-align: right; width: 100%;">' +
              '<span style="color:#167ECF;">' + mapTheRide + '<span style="color: black; font-weight: bold;">&nbsp;|&nbsp;</span>' + pickADay + '</span>' +
            '</div>' +
          '</div>';
      }
      controller.makeInfoWindowEvent(map, infowindow, bubble, marker, controller, recommendation.get('member.id'));

      markerArray.push(marker);
    });
  },

  // Used to create each and every marker event
  makeInfoWindowEvent: function (map, infowindow, contentString, marker, controller, memberId) {
    window.google.maps.event.addListener(marker, 'click', function() {
      if (!Ember.isNone(memberId)) {
        // Lookup recommendation by the member.id so we can get information to fill the content of the marker info popup
      var recommendation = controller.get('filteredRecommendations').findBy('member.id', memberId);

        var content = contentString;
        if (recommendation) {
          // Replace the company name which hopefully has been loaded by now...
          content = contentString.replace('$companyName', Ember.isNone(recommendation.get('member.company.name')) ? '' : recommendation.get('member.company.name'));

          // And the job title/headline
          content = content.replace('$jobTitle', Ember.isNone(recommendation.get('member.jobHeadline')) ? '' : recommendation.get('member.jobHeadline'));

          // And the home departure time
          var departureTime = recommendation.get('homeDepartureTime');
          content = content.replace('$departureTime', (Ember.isNone(departureTime) ? '' : '  ' + departureTime.substr(0, departureTime.length - 1)));
        }

        // Finally do the marker info popup
        infowindow.setContent(content);
        infowindow.open(map, marker);
      }
    });
  },

  // Creates the map toggle size button on the map
  mapToggleControl: function (controlDiv, map, controller) {
    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.className = "btn btn-default";
    controlUI.style.cursor = 'pointer';
    controlUI.title = 'Click to toggle map size';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    if (controller.get('controllers.login.onDesktop')) {
      controlText.innerHTML = '<span id="mapButton">' + (controller.get('maxSuperMap') ? '<i class="fa fa-toggle-up"></i> Smaller Map' : '<i class="fa fa-toggle-down"></i> Bigger Map') + '</span>';
    } else {
      controlText.innerHTML = '<span id="mapButton">' + (controller.get('maxSuperMap') ? '<i class="fa fa-toggle-up"></i>' : '<i class="fa fa-toggle-down"></i>') + '</span>';
    }
    controlUI.appendChild(controlText);

    window.google.maps.event.addDomListener(controlUI, 'click', function() {
      controller.send('showMap');
    });
  },

  // Creates the home button on the map
  mapHomeControl: function(controlDiv, map, controller) {
    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.className = "btn btn-default";
    controlUI.style.cursor = 'pointer';
    controlUI.title = 'Click to center on your home';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    if (controller.get('controllers.login.onDesktop')) {
      controlText.innerHTML = '<i class="fa fa-map-marker" style="color: red"></i> Home';
    } else {
      controlText.innerHTML = '<i class="fa fa-map-marker" style="color: red;"></i>';
    }
    controlUI.appendChild(controlText);

    window.google.maps.event.addDomListener(controlUI, 'click', function() {
      map.setCenter(controller.get('mapCenter'));
    });
  },

  // Create the legend to put on the map
  createLegend: function () {

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
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.style.textAlign = 'left';
    controlText.style.paddingTop = '10px';

    controlText.innerHTML += '<p><img src="/assets/img/DRIVER.png" width="20px" height="20px"> Has a car</p>';
    controlText.innerHTML += '<p><img src="/assets/img/PASSENGER.png" width="20px" height="20px"> Passenger</p>';
    controlUI.appendChild(controlText);

    return controlDiv;
  },

  // For mobile only...
  mapDoneOnce: false,
  switchView: function(controller, which) {
    controller.set('displayMap', which === 'map');
    if (which === 'map') {
      setTimeout(function(){
        controller.set('map', null);
        if (controller.get('controllers.application.BAMOnce')) {
          controller.refreshMap(controller, true);
        } else {
          controller.refreshMap(controller);
        }
        if (!controller.get('mapDoneOnce')) {
          controller.set('mapDoneOnce', true);
          // Ok, this is a kludge... Because we may or may not actually have the map when the data is being retrieved,
          // we have to do the call twice with a bit of a delay. Yuck I know.
          setTimeout(function(){
            controller.refreshMap(controller, true);
          },500);
        }
      }, 100);
    }
  },

  //-----------------------------
  // end BAM stuff
  //-----------------------------

  /* events */
  actions: {
    showRoute: function(partner, tripId) {

      var trip = partner;
      var isOwnerCurrentMember = true;
      if (tripId > 0) {
        isOwnerCurrentMember = trip.get('isOwnerCurrentMember');
        partner = isOwnerCurrentMember ? trip.get('rider') : trip.get('owner');
      }
      if(!this.get('controllers.login.onDesktop')) {
        var ctrl = this.controllerFor('member.map_the_ride');
        ctrl.set('selectedDate', this.get('selectedDate'));
        ctrl.set('tripMode', this.get('tripMode') + (this.get('driverMode') === 'driver' ? -10 : -20));
        this.transitionToRoute('member.map_the_ride', partner.get('id'), (tripId > 0 ? tripId  : (this.get('driverMode') === 'driver' ? -2 : -3)));
        return;
      }
      this.set('mapPartnerId', partner.get('id'));

      var memberIsDriver = this.get('driverMode') === 'driver';
      var tripMode = this.get('tripMode');
      var member = this.get('currentMember');

      var mapDialog = new MapDialog();
      var mapParams = mapDialog.generateMapDialog(member, partner, trip, tripId, tripMode, memberIsDriver);
      mapDialog.modalDialog(
        {
          dialogTitle: partner.get('firstName'),
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: (memberIsDriver ? 'You are' : partner.get('firstName') + ' is') +  ' the driver',
          from: mapParams.from,
          to: mapParams.to,
          waypoints: mapParams.waypoints,
          disableOptions: true,
          icons: mapParams.icons,
          controller: this
        });
    },

    // External call/event to refresh the map info
    refreshTheMap: function(skip) {
      this.refreshMap(this, skip);
    },

    showMap: function() {
      var show = !this.get('maxSuperMap');
      this.set('maxSuperMap', show);
      if (!show) {
        this.set('mapStyle', "width: 100%; height: 100px;");
        if (this.get('controllers.login.onDesktop')) {
          $('#mapButton').html('<i class="fa fa-toggle-down"> Bigger Map</i>');
        } else {
          $('#mapButton').html('<i class="fa fa-toggle-down"></i>');
        }
      } else {
        this.computeMapHeight(this);
        if (this.get('controllers.login.onDesktop')) {
          $('#mapButton').html('<i class="fa fa-toggle-up"> Smaller Map</i>');
        } else {
          $('#mapButton').html('<i class="fa fa-toggle-up"></i>');
        }
      }

      // Re-center the map to home...
      var controller = this;
      var map = controller.get('map');
      var center = controller.get('mapCenter');
      map.setCenter(center);

      // Then wait a tick... and move to home on resized map
      setTimeout(function(){
        center = map.getCenter();
        window.google.maps.event.trigger(map, "resize");
        controller.set('mapCenter', center);
        map.setCenter(center);
      }, 100);

    }

  }
});

export default RideMatchMixinController;