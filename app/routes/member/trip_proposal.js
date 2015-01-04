import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import RidesMixinRoute from 'appkit/mixins/rides_mixin_route';

var MemberTripProposalRoute = AuthenticatedRoute.extend(RidesMixinRoute, {

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  selectedDate: null,
  tripDate: null,
  tripId: null,

  model: function(params){
    this.set('selectedDate', params.date);
    this.set('tripDate', null);
    var tripId = parseInt(params.trip_id, 10);
    this.set('tripId', tripId);

    var member = this.modelFor('member');
    var memberId = member.get('id');

    var controller = this.controllerFor('member.trip_proposal');
    controller.set('showPickADay', Ember.isNone(params.date) || params.date < 1);
    if (controller.get('controllers.login.onDesktop')) {
      var dt = timezonejsDate();
      // if there is a trip, it could be in the past...
      if (tripId > 0) {
        var _this = this;
        Ember.$.ajax({
          type: 'GET',
          url: Ember.ENV.APIHOST + '/trips/' + params.trip_id,
          async: false
        }).then(function (data){
          if (Ember.isNone(data.trip.pickupTimestamp)) {
            dt = timezonejsDate(data.trip.returnTimestamp);
          } else {
            dt = timezonejsDate(data.trip.pickupTimestamp);
          }

          // Save it...
          _this.set('tripDate', dt);
        });
      }

      // We want to start on Monday, even if is past
      if (dt.getDay() > 1) {
        // - 1 because week starts on Sunday which is 0, so we always want to start at 1
        dt.setTime(dt.getTime() - (dt.getDay() - 1) * 24 * 60 * 60 * 1000);
      } else if (dt.getDay() < 1) {
        dt.setTime(dt.getTime() - 6 * 24 * 60 * 60 * 1000); // 0 is Sunday so 6 days in the past
      }
      dt.setHours(0, 0, 0);
      var et = timezonejsDate(dt.getTime() + (4 * 7) * 24 * 60 * 60 * 1000); // 4 weeks in the future.

      this.set('driveMode', undefined);
      // Is this a new trip or an existing trip?
      if (tripId <= 0) {
        return Ember.RSVP.hash({
          recommendation: this.store.find('recommendation', params.partner_id),
          memberTrips: this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime() - 1000) + '&endTime=' + et.getTime(), id: memberId}), //this.store.findQuery('trip', {from: 'members', id: memberId}),
//          memberSchedule: this.store.findQuery('weeklySchedule', {memberId: memberId}),
          partnerTrips: this.store.findQuery('trip', {from: 'members', id: params.partner_id, endPoint: 'scheduled-parent-trips'}),
          partnerSchedule: this.store.findQuery('weeklySchedule', {memberId: params.partner_id}),
          partner: this.store.find('member', params.partner_id)
        });
      } else {
        return Ember.RSVP.hash({
          memberTrips: this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime() - 1000) + '&endTime=' + et.getTime(), id: memberId}), //this.store.findQuery('trip', {from: 'members', id: memberId}),
          partnerTrips: this.store.findQuery('trip', {from: 'members', id: params.partner_id, endPoint: 'scheduled-parent-trips'}),
          partnerSchedule: this.store.findQuery('weeklySchedule', {memberId: params.partner_id}),
          partner: this.store.find('member', params.partner_id),
          trip: this.store.find('trip', params.trip_id),
          rin: this.store.findQuery('rinRequest', {tripId: params.trip_id})
        });
      }
    } else { // on mobile
      // Is this a new trip or an existing trip?
      if (tripId <= 0) {
        return Ember.RSVP.hash({
          recommendation:   this.store.find('recommendation', params.partner_id),
//          memberSchedule:   this.store.findQuery('weeklySchedule', {memberId: memberId}),
          partnerSchedule: this.store.findQuery('weeklySchedule', {memberId: params.partner_id}),
          partner:          this.store.find('member', params.partner_id)
        });
      } else {
        return Ember.RSVP.hash({
          partner:          this.store.find('member', params.partner_id),
          trip:             this.store.find('trip', params.trip_id),
          rin:              this.store.findQuery('rinRequest', {tripId: params.trip_id})
        });
      }
    }
  },

  afterModel: function(hash) {

    var member = this.modelFor('member');
    var controller = this.controllerFor('member.trip_proposal');
    controller.set('partner', hash.partner);
    controller.set('trip', hash.trip);

    var driverMode = null;
    var tripId = this.get('tripId');
    var tripMode = hash.trip ? hash.trip.get('oneWayStatus') : 0;
    if (tripId < 1) {
      if (tripId < -2) {
        if (tripId <= -20) {
          driverMode = 'passenger';
          tripMode = tripId + 20;
        } else if (tripId <= -10) {
          driverMode = 'driver';
          tripMode = tripId + 10;

        }
      }
    }

    switch (Math.abs(tripMode)) {
      case 0:
        controller.set('isRoundTrip', true);
        controller.set('isWorkTrip', false);
        //controller.set('isReturnTrip', false);
        controller.set('direction', 'out');
        break;
      case 1:
        controller.set('isRoundTrip', false);
        controller.set('isWorkTrip', true);
        //controller.set('isReturnTrip', false);
        controller.set('direction', 'out');
        break;
      case 2:
        controller.set('isRoundTrip', false);
        controller.set('isWorkTrip', false);
        //controller.set('isReturnTrip', true);
        controller.set('direction', 'in');
        break;
    }

    // Init controller by removing potentially old data...
    controller.set('tripNegotiationWeek', null);
    controller.set('tripNegotiationDay',  null);
    controller.set('selectedDate', '');
    controller.set('personalMessage', '');
    controller.set('rinMessages', null);
    controller.set('noteAttached', '');

    // Clear this vars to signal the controller it needs to reload data, else the last old page data will appear if called before
    // NOTE: These values are set if this is a trip in negotiation call in the reviewTrip function below
    controller.set('selectedPassengerHomeLocation', null);
    controller.set('selectedMemberHomeLocation', null);

    // Loadup the messages for the trip
    if (!Ember.isNone(hash.rin)) {
      var rinMsg = [];
      for (var r=0; r < hash.rin.get('length'); r++) {
        var msg = hash.rin.objectAt(r);
        if (!Ember.isNone(msg.get('personalMessage')) && msg.get('personalMessage').trim() !== '') {
          rinMsg.push(msg);
        }
      }
      controller.set('rinMessages', rinMsg.reverse());
    }

    // Add the partner name to the driver selection
    controller.set('driverOrRider', [
      {label: "You're Driving", value: 'driver', img: '//hovee001.s3.amazonaws.com/resources/car_icon.png'},
      {label: "Passenger",  value: 'passenger', img: '//hovee001.s3.amazonaws.com/resources/car_icon.png'}
    ]);

    // Add the partner name to the driver selection
    var dor = controller.get('driverOrRider');
    dor[1].label = hash.partner.get('firstName');

    var format = new TimeDateFormatting();

    // This should be mobile only...
    var selectedDate = (this.get('selectedDate') > 0 ? format.formatDateMonthDayYear(parseInt(this.get('selectedDate'), 10)) : null);

    // This is for mobile to adjust to the width and height of the screen...
    controller.set('hght', 'height: ' + (window.screen.height < 481 ? window.screen.height : window.screen.height - 80) + 'px; background-color: white;');
    if (window.screen.width < 360) {
      dor[0].img = '';
      dor[1].img = '';
    }

    var memberId = member.get('id');
    var trips = hash.memberTrips;
    var reviewTrip = hash.trip;
    var isReviewTrip = !Ember.isNone(reviewTrip);
    var reviewTripNotFound = isReviewTrip;
    var partnerTrips = hash.partnerTrips;
    var gw = new GroupWaypoints();

    var memberTripDateHash = [];
    var partnerTripDateHash = [];
    var partnerSchedule = null;
    var i;

    // Note: Trips will be null in the case of mobile...
    if (trips) {

      // This is only for the week calendar...
      var da = timezonejsDate(selectedDate);
      var selectedDay = this.store.createRecord('calendar_cell').setProperties(
        {bg: '#D1D7D9', date: da.date, statusCode: '', timestamp: 0});
      controller.set('selectedDay', selectedDay);
      this.ridesAfterModelProcessing(controller, member, trips);

      // FIXME: Assumes there is only one week schedule!!!
      partnerSchedule = hash.partnerSchedule.objectAt(0).get('dailySchedules');

      // Build a hash map of the current member trips and messages with the timestamp as the key
      for (i=0; i < trips.get('length'); i++) {
        var trip = trips.objectAt(i);
        var t = memberTripDateHash[trip.get('formattedMdYPickup')];
        if (Ember.isNone(t)) {
          memberTripDateHash[trip.get('formattedMdYPickup')] = {trips: [trip]};
        } else {
          // only save the parent
          if (trip.get('parentTripId') === 0) {
            t.trips.push(trip);
          }
        }
      }

      // Same for partner, trips only! Only used to signal that they are occupied.
      partnerTrips.forEach(function(trip) {
        partnerTripDateHash[trip.get('formattedMdYPickup')] = true;
      });
    }

    // Load up the parsed/grouped waypoints to controller...
    if (isReviewTrip) {
      controller.set('editing', false);
      controller.set('rideProposal', true);

      // Call to compute the times and other stuff to review the trip...
      gw.reviewTrip(controller, reviewTrip, memberId);

    } else {

      var date = selectedDate.substr(0, selectedDate.indexOf(','));
      var day = parseInt(date.substr(date.indexOf(' ')), 10);
      date += day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
      controller.set('personalMessage', "Let's drive together on " + date + '. What do you think?');
      controller.set('mHomeLocation', member.get('homeLocation'));
      controller.set('mWorkLocation', member.get('workLocation'));
      controller.set('pHomeLocation', hash.partner.get('homeLocation'));
      controller.set('pWorkLocation', hash.partner.get('workLocation'));

      controller.set('editing', true);
      controller.set('rideProposal', false);

      // Ok so we have a problem with the recommendation ids, all the ids, not being unique. So to combat that we force
      // Ember to reload the data from the server. This may not be a bad thing anyway since who knows what has changed
      // since the last time it was loaded. Unfortunately the likelihood is probably small, making this a waste...
//      if (hash.recommendation.get('runReload')) {

      // I know this is causing a double read the first time, but seems the flag doesn't work like I thought it would.

        // Force the reload of data via the model...
        hash.recommendation.reload().then(function(recommendation) {

          controller.set('currentRecommendation', recommendation);

          // Process the recommendation waypoints
          gw.groupWaypoints(controller, recommendation);

          // Note: These clears must happen after the waypoints are loaded else it will compute the old times
          controller.set('timePassengerHomeToPassengerWork', 0); // Order matters... This must come before homeDepartureTime else will not clear properly
          controller.set('homeDepartureTime', '');
          controller.set('workDepartureTime', '');

          if (Ember.isNone(driverMode)) {
            // Need to determine who is driving... I know it is kinda weird to be doing this here, but need waypoints because changing drivers causes time to be computed
            if (member.get('hasCar') && hash.partner.get('hasCar')) {
              controller.set('selectedDriverMode', recommendation.get('recDefaults.role'));
              controller.set('memberIsDriver', recommendation.get('recDefaults.role') === 'driver');
            } else if (member.get('hasCar')) {
              controller.set('memberIsDriver', true);
              controller.set('selectedDriverMode', 'driver');
            } else if (hash.partner.get('hasCar')) {
              controller.set('memberIsDriver', false);
              controller.set('selectedDriverMode', 'passenger');
            }
          } else {
            controller.set('memberIsDriver', driverMode === 'driver');
            controller.set('selectedDriverMode', driverMode);


// This shouldn't happen...
//          } else {
//            controller.transitionToRoute('member.rides', this.modelFor('member'));
//            new GenericModalDialog().modalDialog(
//              {
//                dialogTitle: 'Propose A Ride',
//                dialogImageUrl: '/assets/img/icon-car-blue.png',
//                dialogText: 'Neither of you has a car. Please select someone with a car. Returning to Ride Match.'
//              });
//            return;

          }

          // Setup the time intervals between destinations... This is/was done automatically, but we need to do it earlier now because of using the partner times below.
          // NOTE: The timing above of clearing the timePassengerHomeToPassengerWork and the driver set above. This all needs to be done after.
          controller.setTravelTimes();

          // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
          partnerSchedule = hash.partnerSchedule.objectAt(0).get('dailySchedules');
          for (i = 0; i < 7; i++) {
            if (partnerSchedule.objectAt(i).get('id') !== '-1') {
              controller.set('defaultHomeDepartureTime', controller.computePassengerHomePickupTimeChange(controller, partnerSchedule.objectAt(i).get('homeDepartureTime')));
              controller.set('defaultWorkDepartureTime', controller.computePassengerWorkPickupTimeChange(controller, partnerSchedule.objectAt(i).get('workDepartureTime')));
              break;
            }
          }

          // Again this should only be for the mobile case
          if (selectedDate) {
            // Only set the selected data after the waypoints are setup above
            controller.set('selectedDate', selectedDate);
          }

        });

//      } else { // First time through, just use the data we got...
//        hash.recommendation.set('runReload', true);
//
//        controller.set('currentRecommendation', hash.recommendation);
//
//        // Process the recommendation waypoints
//        gw.groupWaypoints(controller, hash.recommendation);
//      }

      // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
//      var memberSchedule = hash.memberSchedule.objectAt(0).get('dailySchedules');
//      for (i = 0; i < 6; i++) {
//        if (memberSchedule.objectAt(i).get('id') !== '-1') {
//          controller.set('defaultHomeDepartureTime', memberSchedule.objectAt(i).get('homeDepartureTime'));
//          controller.set('defaultWorkDepartureTime', memberSchedule.objectAt(i).get('workDepartureTime'));
//          break;
//        }
//      }

    }

    // Again trips will be null for mobile
    if (trips) {
      controller.set('selectedWeekIndex', -1);

      // The next bit is to produce the scheduling objects for 4 weeks
      // Create a for week calendar starting with this week back to the first of the week (Monday)
      var dt = this.get('tripDate'); // Get the tripDate if it exists
      if (Ember.isNone(dt)) {
        dt = timezonejsDate();
      }
      var td = timezonejsDate(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
      // We want to start on Monday, even if is past
      if (dt.getDay() > 1) {
        // - 1 because week starts on Sunday which is 0, so we always want to start at 1
        dt.setTime(dt.getTime() - (dt.getDay() - 1) * 24 * 60 * 60 * 1000);
      } else if (dt.getDay() < 1) {
        dt.setTime(dt.getTime() - 6 * 24 * 60 * 60 * 1000); // 0 is Sunday so 6 days in the past
      }
      var calendar = [];

      for (var tripWeek = 0; tripWeek < 4; tripWeek++) {
        var mon = this.store.createRecord('calendar_day').setProperties({id: 'Mon', day: 'Monday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var tue = this.store.createRecord('calendar_day').setProperties({id: 'Tue', day: 'Tuesday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var wed = this.store.createRecord('calendar_day').setProperties({id: 'Wed', day: 'Wednesday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var thu = this.store.createRecord('calendar_day').setProperties({id: 'Thu', day: 'Thursday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var fri = this.store.createRecord('calendar_day').setProperties({id: 'Fri', day: 'Friday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var sat = this.store.createRecord('calendar_day').setProperties({id: 'Sat', day: 'Saturday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var sun = this.store.createRecord('calendar_day').setProperties({id: 'Sun', day: 'Sunday', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false, inThePast: true, isToday: false, displayDate: '', dayNumber: ''});
        var calendarWeek =
        {displayDate: '',
          daysOfTheWeek: [mon, tue, wed, thu, fri, sat, sun]};
        calendar.push(calendarWeek);
        calendarWeek.displayDate = format.formatDateMonthDayYear(dt);
        for (var tripDay = 0; tripDay < 7; tripDay++) {
          // Get the date info to populate the text parts
          var calendarDay = calendarWeek.daysOfTheWeek[tripDay];
          calendarDay.set('displayDate', format.formatDateMonthDayYear(dt));
          calendarDay.set('dayNumber', dt.getDate());
          calendarDay.set('inThePast', timezonejsDate(calendarDay.get('displayDate')).getTime() < td);
          calendarDay.set('isToday', timezonejsDate(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() === td);

          // Set up the member trip status for this day...
          var status = "You are available to carpool";
          var data = memberTripDateHash[calendarDay.get('displayDate')];
          // Is there a trip already on this day?
          if (data) {
            calendarDay.set('memberTrips', data.trips);
            for (var d = 0; d < data.trips.length; d++) {
              if (data.trips[d].get('isRinStatusNew')) {
                status = "You are planning a ride with ";
                calendarDay.set('hasProposedTrip', true);
                calendarDay.set('memberIsAvailable', true);
                calendarDay.set('isInNegotiation', true);
                break;
              } else if (data.trips[d].get('isRinStatusAccepted') && !data.trips[d].get('isStatusCancelledOrDeclined')) {
                status = "You have a scheduled ride with ";
                calendarDay.set('hasProposedTrip', false);
                calendarDay.set('memberTrips', [data.trips[d]]);
                calendarDay.set('memberIsScheduled', true);
                calendarDay.set('memberIsAvailable', false);
                calendarDay.set('isInNegotiation', false);
                break;
              }
            }

            // Special case if we are coming with a trip id passed, then we need to load that day
            if (reviewTripNotFound && reviewTrip.get('formattedMdYPickup') === calendarDay.get('displayDate')) {
              reviewTripNotFound = false;
              if (reviewTrip.get('isStatusCancelledOrDeclined')) {
                status = "Cancelled trip";
                calendarDay.set('isInNegotiation', false);
                calendarDay.set('memberIsAvailable', true);
              } else if (reviewTrip.get('isRinStatusAccepted')) {
                calendarDay.set('memberIsScheduled', true);
                calendarDay.set('memberIsAvailable', false);
                status = "You have a scheduled ride with\n";
              } else if (!reviewTrip.get('isRinStatusDeclined')) {
                calendarDay.set('isInNegotiation', true);
                calendarDay.set('memberIsAvailable', true);
                status = "You are planning a ride with\n";
              } else {
                status = "You were planning a ride with\n";
              }

              // Ok these could actually be computed if we had date math functions... Which there probably are, but we'll brute force it for now.
              controller.set('tripNegotiationWeek', tripWeek);
              controller.set('tripNegotiationDay', tripDay);

              // pass in the week of this day (so that cal controls can show it by default)
              controller.set('selectedWeekIndex', tripWeek);

              // Already done in reviewTrip function
              //controller.set('selectedDate', calendarDay.get('displayDate'));
            }
          } else if (isReviewTrip) {
            // So if this is passed in trip, as of now, no other dates can be scheduled...
            status = '';
          } else {
            calendarDay.set('memberIsAvailable', !calendarDay.get('inThePast'));
          }
          calendarDay.set('memberStatus', status);

          // Set up the partner trip status for this day...
          data = partnerTripDateHash[calendarDay.get('displayDate')];
          calendarDay.set('partnerIsAvailable', !isReviewTrip && Ember.isNone(partnerTripDateHash[calendarDay.get('displayDate')]) && partnerSchedule.objectAt(tripDay).get('id') !== '-1' && !calendarDay.get('inThePast'));
          // calendarDay.set('partnerStatus', (calendarDay.get('partnerIsAvailable') ? '' : 'Not ') + 'Available to Carpool';
          if (calendarDay.get('partnerIsAvailable')) {
            calendarDay.set('partnerStatus', controller.get('partner.firstName') + ' is available to carpool');
          } else {
            calendarDay.set('partnerStatus', controller.get('partner.firstName') + " isn't available to carpool");
          }

          // Silly but to make thing easier in HandleBars...
          calendarDay.set('bothAreAvailable', calendarDay.get('memberIsAvailable') && calendarDay.get('partnerIsAvailable'));

          dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);                              // Add a day for the next round
        }
      }

      // This is wacky but we need to do this to get member name information after the fact. To do this we need to convert the js arrays to Ember arrays
      var c4w = Ember.ArrayProxy.create({content: Ember.A(calendar)});
      c4w.forEach(function (weeklySchedule) {
        var wsa = Ember.ArrayProxy.create({content: Ember.A(weeklySchedule.daysOfTheWeek)});
        wsa.forEach(function (daySchedule) {
          var notFirst = false;
          // Is this one a day that has a trip scheduled?
          if (!Ember.isNone(daySchedule.get('memberTrips')) && (daySchedule.get('isInNegotiation') || daySchedule.get('memberIsScheduled'))) {
            var memberTrips = daySchedule.get('memberTrips');
            memberTrips.forEach(function (trip) {
              if (!trip.get('isRinStatusDeclined') && !trip.get('isStatusCancelledOrDeclined')) {
                // Now lookup the member information...
                // Note: Because the look up takes a while they seem to be put on a separate thread and the vars are tracked so even though
                //       the references would normally be gone, Ember I guess keeps track. Neat trick. Maybe because these are promises?
                //       That is the main reason for converting to an Ember array.
                Ember.RSVP.hash({
                  owner: trip.get('owner'),
                  rider: trip.get('rider')
                }).
                  then(function (members) {
                    var status = '';
                    if (members.owner.get('id') === memberId) {
                      status = members.rider.get('fullName');
                    } else {
                      status = members.owner.get('fullName');
                    }

                    if (notFirst) {
                      status = '<br>' + status;
                    } else {
                      notFirst = true;
                    }

                    daySchedule.set('memberStatus', daySchedule.get('memberStatus') + status);
                  }).
                  catch(function (error) {
                    new GenericModalDialog().modalDialog(
                      {
                        dialogTitle: Em.I18n.translations.error.trip.detail.load.title,
                        dialogImageUrl: '/assets/img/icon-car-blue.png',
                        dialogImageTitle: Em.I18n.translations.error.trip.detail.load.id,
                        dialogText: Em.I18n.translations.error.trip.detail.load.message
                      });
                    Ember.Logger.debug("trip detail route: " + error.status + error.responseText);
                  });

              }
            });
          }
        });
      });

      controller.set('calendar', c4w);
    }
  },
  actions: {
    didTransition: function () {
      // This is for mobile specifically... Have to delay for the element to show up, then select the button.
      var controller = this.controllerFor('member.trip_proposal');
      if (!controller.get('controllers.login.onDesktop')) {
        setTimeout(function () {
          controller.watchSelectedDriverMode();
        }, 500);
      }
    }
  }
});

export default MemberTripProposalRoute;
