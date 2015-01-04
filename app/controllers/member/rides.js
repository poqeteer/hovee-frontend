/**
 * Created by lancemock on 11/10/14.
 */
import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';
import RideMatchMixinController from 'appkit/mixins/ride_match_mixin_controller';
import RidesMixinControllerActions from 'appkit/mixins/rides_mixin_controller_actions';

import Spinner from 'appkit/utils/spinner';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import timezonejs from 'appkit/utils/timezonejs_date';

var MemberRidesController = Ember.ObjectController.extend(TaglineMixinController, RideMatchMixinController, RidesMixinControllerActions, {
  needs: ['application', 'login', 'currentMember', 'member'],

  /*** For actions functions seek RidesMixinControllerActions ***/

  onRideMatch: true,

  member: null,
  cw: null,
  sched: null,
  trips: null,
  nextTrip: null, // for calendar processing

  // edit home location
  homeLocation: null,
  homeLocations: null,
  oldHomeLocation: null,

  // edit work location
  workLocation: null,
  workLocations: null,

  // Calender header
  sundaySelected: false,
  mondaySelected: false,
  tuesdaySelected: false,
  wednesdaySelected: false,
  thursdaySelected: false,
  fridaySelected: false,
  saturdaySelected: false,
  weekHeaderFlags: ['sundaySelected','mondaySelected','tuesdaySelected','wednesdaySelected','thursdaySelected','fridaySelected','saturdaySelected'],

  // Help dialog...
  ridesHelpDialogStyle: "font-size: 1.7em; font-weight: 400; width: 100%;",
  ridesHelpDialogText: ["TBD"],

  // Matches screen
  matchesListStyle: "124px",

  // "Display" flags
  showOptions: false,
  showMatches: false,
  showGoBackHeader: false,
  showTripList: false,

  // If no user input in showHelpSeconds seconds and no trips !!! Currently disabled... Need to disable popup on any action on a panel...
  showHelpSeconds: 3000,  // milliseconds, of course
  showMonthHelp: false,
  showOptionsHelp: false,
  showMatchesHelp: false,

  watchShowOptions: function() {
    // Set the global flag...
    this.set('controllers.application.showRidesBackToCalendar', this.get('showMatches'));
  }.observes('showMatches'),


  selectedWeek: null,
  selectedDate: null,
  selectedDay: null,

  showOld: false,

  passengersOrDrivers: 'Passengers',
  inviteCount: 0,

  homeDepartureTime: null,
  workDepartureTime: null,

  timeArray: [],
  init: function() {
    var ta = this.get('timeArray');
    for (var i = 3; i < 24; i++) {
      for (var j = 0; j < 60; j = j + 15) {
        var time = i%13 + ":" + (j < 10? '0' + j: j) + ' ' + (i < 12 ? 'AM' : 'PM');
        ta.push({id: i * 100 + j, label: time});
      }
    }
    this.set('controllers.application.rides_controller', this);

    // "Fix" the back button... Now if we are on the rides page, reset the flags and go to the calendar layout.
    // Note: back from the rides page is the loading page
    var controller = this;
    $(window).on('hashchange', function() {
      window.console.log(window.location.hash);
      if (window.location.hash.indexOf('loading') > -1) {
        controller.send('backToRidesCalendar');
        //window.location.hash = window.location.hash.substr(0, window.location.hash.indexOf('loading')) + 'rides'; doesn't stop from going back to loading page
      }
    });

    if (this.get('controllers.login.onDesktop')) {
      this.set('matchesListStyle', "134px");
    }
  },


  onLocalHost: function() {
    return window.location.href.indexOf('localhost') > -1;
  }.property('onLocalHost'),

  clearWeekFlags: function(controller) {
    var weekHeaders = controller.get('weekHeaderFlags');
    var week = controller.get('selectedWeek');
    for(var i = 0; i < 7; i++) {
      controller.set(weekHeaders[i], false);
      week.objectAt(i).set('selectedCell', false);
    }
  },

  tripModeStr: 'Round Trip',
  roundTrip: true,
  workTrip: false,
  homeTrip: false,

  tripMode: 0,
  watchTripMode: function() {
    var tripMode = this.get('tripMode');
    this.set('roundTrip', tripMode === 0);
    this.set('workTrip', tripMode === -1);
    this.set('homeTrip', tripMode === -2);
    var a = ['Round Trip', 'To Work Only', 'To Home Only'];
    this.set('tripModeStr', a[tripMode]);
  }.observes('tripMode'),

  driverMode: 'driver',
  isDriveMode: true,
  watchDriverMode: function() {
    this.set('isDriveMode', this.get('driverMode') === 'driver');
    this.set('passengersOrDrivers', this.get('driverMode') === 'driver' ? 'Passengers' : 'Drivers');
  }.observes('driverMode'),

  listMapMode: 'list',

  computeMapHeight: function(controller) {
    var h = window.innerHeight - 235;
    var w = "100%";
    var o = "";
    if (controller.get('controllers.login.onDesktop')) {
      o = "padding-top: 20px; margin: auto;";
      h = Math.floor(window.innerHeight - 200);
      if (h < 100) {h = 100;}
    }
    controller.set('mapStyle', "margin: 0 auto; width: " + w +  "; height: " + h + "px;" + o);
  },

  makeInfoMarkerArray: function(controller, map, infowindow, onDesktop, skip){
    var trips = controller.get('selectedDay.trips');
    var statusCode = controller.get('selectedDay.statusCode');
    // Ok... Now add all (or most) of the markers for the recommendations (see head note above)
    var markerArray = [];

    var makeMarker = function (url, rideStatus, statusColor, memberId, lat, long, firstName, lastName, photo, companyName) {
      var mapOptions = {
        position: new window.google.maps.LatLng(lat, long),
        map: map,
        icon: {url: url, scaledSize: url === '/assets/img/DRIVER.png' || url === '/assets/img/PASSENGER.png' ? new window.google.maps.Size(30, 30) : new window.google.maps.Size(26, 40)},
        title: firstName + ' ' + lastName
      };

      // If this is the third round, don't do the DROP animation, please...
      if (Ember.isNone(skip)) {
        mapOptions.animation =  window.google.maps.Animation.DROP;
      }
      var marker = new window.google.maps.Marker(mapOptions);

      // This forms the click event for the marker, which shows the bubble info window
      var bubble="One moment please...";
      if(!Ember.isNone(skip)) {

        bubble =
          '<div class="pull-left" style="z-index: 100;">' +
            '<a href="#/members/' + memberId + '/profile">' +
              '<img src="' + (Ember.isNone(photo) ? '//hovee001.s3.amazonaws.com/profile_images/default.jpg' : photo + '" onerror="this.onerror=null;this.src=\'//hovee001.s3.amazonaws.com/profile_images/default.jpg\';' ) + '" width="98px">' +
            '</a>' +
          '</div>' +
          '<div class="pull-left" style="padding-right: 10px; padding-left: 5px;">' +
            '<div style="color:black; font-size: 2em; font-weight: 500;line-height: 1em;">' +
              '<a href="#/members/' + memberId + '/profile">' + firstName +'<br>' + lastName + '</a><br>' +
              '<div style="color:#AAACB4; font-size: .6em; font-weight: 100; text-transform: uppercase; padding-top: 5px;">' + (Ember.isNone(companyName) ? '' : companyName)  + '</div>' +
            '</div>' +
            '<div style="font-size: 1.0em; font-weight: 900; text-transform: uppercase; color: ' + statusColor + '">' +
              rideStatus +
            '</div>' +
          '</div>';
      }
      controller.makeInfoWindowEvent(map, infowindow, bubble, marker, controller, memberId);

      markerArray.push(marker);
    };

    controller.get('filteredRecommendations').forEach(function (recommendation) {
//      makeMarker('//hovee001.s3.amazonaws.com/resources/maps/map-marker.png', '$departureTime', '#0080C0;',
      makeMarker(controller.get('driverMode') === 'passenger' ? '/assets/img/DRIVER.png' : '/assets/img/PASSENGER.png', '$departureTime', '#0080C0;',
                  recommendation.get('member.id'),
                  recommendation.get('member.homeLocation.latitude'), recommendation.get('member.homeLocation.longitude'),
                  recommendation.get('member.firstName'), recommendation.get('member.lastName'),
                  recommendation.get('member.profilePhotoUrl'), '$companyName');
    });

    if (trips) {
      var memberId = controller.get('currentMember.id');
      trips.forEach(function(trip) {
        var url = '//hovee001.s3.amazonaws.com/resources/maps/map-marker.png';
        var rideStatus = '$departureTime';
        var statusColor = '#0080C0;';
        if (trip.get('statusCode') === "0") {
          url = '//hovee001.s3.amazonaws.com/resources/maps/map-marker-RIN.png';
          rideStatus = 'Ride Pending';
          statusColor = '#F9941C';
        } else if (statusCode === "2") {
          url = '//hovee001.s3.amazonaws.com/resources/maps/map-marker-CONF.png';
          rideStatus = 'Ride Accepted';
          statusColor = '#18C03C';
        }
//        var url = controller.get('driveMode') === 'passenger' ? '/assets/img/DRIVER.png' : '/assets/img/PASSENGER.png';
//        var statusColor = '#000000';
        var isOwner = memberId === trip.get('owner.id');
        makeMarker(url, rideStatus, statusColor,
                  (isOwner ? trip.get('rider.id') : trip.get('owner.id')),
                  (isOwner ? trip.get('riderHomeLocation.latitude') : trip.get('memberHomeLocation.latitude')),
                  (isOwner ? trip.get('riderHomeLocation.longitude') : trip.get('memberHomeLocation.longitude')),
                  (isOwner ? trip.get('rider.firstName') : trip.get('owner.firstName')),
                  (isOwner ? trip.get('rider.lastName') : trip.get('owner.lastName')),
                  (isOwner ? trip.get('rider.profilePhotoUrl') : trip.get('owner.profilePhotoUrl')),
                  (isOwner ? trip.get('rider.company.name') : trip.get('owner.company.name')));
      });
    }

  },

  watchListMap: function() {
    var controller = this;
    var which = this.get('listMapMode');
    controller.set('displayMap', which === 'map');
    this.computeMapHeight(this);
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
          },1000);
        }
      }, 100);
    }

  }.observes('listMapMode'),

  filteredRecommendations: function() {
    if (Ember.isNone(this.get('recommendations'))) return null;

    var results = this.get('recommendations').filter(function(item, index, enumerable){
      return Ember.isNone(item.get('special'));
    });

    var controller = this;
    setTimeout(function(){
      controller.refreshMap(controller, true);
    }, 250);

    return results;
  }.property('recommendations'),

  resetOptionToggles: function(controller) {
    var id = 'drivel';
    if (controller.get('driverMode') === 'passenger') {
      id = 'ridel';
    }
    $('#' + id).addClass('active');
    id = 'roundl';
    if (controller.get('tripMode') === -1) {
      id = 'workl';
    } if (controller.get('tripMode') === -2) {
      id = 'homel';
    }
    $('#' + id).addClass('active');
  },

  filteredTrips: function() {
    if (this.get('showOld')) { return this.get('trips');}
    var today = new timezonejs();
    return this.get('trips').filter(function(item, indes, enmuerable){
      return item.get('pickupTimestamp') > today && !item.get('isStatusCancelledOrDeclined');
    });
  }.property('trips', 'showOld'),

  currentMember: function() {
    return this.get('controllers.member');
  }.property('controllers.member'),

  processRecommendation: function(controller, recommendation, trips) {
    var setDefault = function(recommendation){
      recommendation.set('homeDepartureTime', '7:00 AM');
      recommendation.set('workDepartureTime', '5:00 PM');
      recommendation.set('homeDepartureTimestamp', new Date('January 1, 1970 7:00 AM').getTime());
      recommendation.set('workDepartureTimestamp', new Date('January 1, 1970 5:00 PM').getTime());
    };

    recommendation.set('special', undefined);
    var memberId = recommendation.get('member.id');
    if (Ember.isNone(memberId)) {
      Ember.Logger.debug('no member id in ' + recommendation.get('id') + ' where memberId is ' + recommendation.get('memberId'));
      memberId = recommendation.get('memberId');
    }
    if (Ember.isNone(memberId)) {
      Ember.Logger.debug('===============> Something is really wrong with  ' + recommendation.get('id') + ' NO memberId ' + recommendation.get('memberId'));
      return;
    }
    if (trips) {
      for (var i = 0; i < trips.get('length'); i++) {
        var trip = trips.objectAt(i);
        if (trip.get('riderId') ===  memberId || trip.get('ownerId') === memberId) {
          recommendation.set('special', true);
          break;
        }
      }
    }

    controller.store.findQuery('weeklySchedule', {memberId: memberId}).
      then(function(schedule) {
        // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
        var memberSchedule = schedule.objectAt(0).get('dailySchedules');
        if (schedule.objectAt(0).get('id') !== '-1' && !Ember.isEmpty(memberSchedule.objectAt(0).get('homeDepartureTime')) && !Ember.isEmpty(memberSchedule.objectAt(0).get('workDepartureTime'))) {
          recommendation.set('homeDepartureTime', memberSchedule.objectAt(0).get('homeDepartureTime'));
          recommendation.set('workDepartureTime', memberSchedule.objectAt(0).get('workDepartureTime'));

          recommendation.set('homeDepartureTimestamp', new Date('January 1, 1970 ' + memberSchedule.objectAt(0).get('homeDepartureTime')).getTime());
          recommendation.set('workDepartureTimestamp', new Date('January 1, 1970 ' + memberSchedule.objectAt(0).get('workDepartureTime')).getTime());
        } else {
          setDefault(recommendation);
        }
      }).catch(function(){
        setDefault(recommendation);
      });
  }
});

export default MemberRidesController;