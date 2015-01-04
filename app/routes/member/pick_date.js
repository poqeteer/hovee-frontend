import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import CalendarMixinRoute from 'appkit/mixins/calendar_mixin_route';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberPickDateRoute = AuthenticatedRoute.extend(CalendarMixinRoute, {

  memberId: null,

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params){
    var member = this.modelFor('member');
    var memberId = member.get('id');
    this.set('memberId', memberId);
    this.controllerFor('member.calendar').set('memberId', member.get('id'));

    var dt = timezonejsDate();
    // We want to start on Monday, even if is past
    if (dt.getDay() > 1)  {
      // - 1 because week starts on Sunday which is 0, so we always want to start at 1
      dt.setTime(dt.getTime() - (dt.getDay()-1)*24*60*60*1000);
    } else if (dt.getDay() < 1) {
      dt.setTime(dt.getTime() - 6*24*60*60*1000); // 0 is Sunday so 6 days in the past
    }
    dt.setHours(0,0,0);
    var et = timezonejsDate(dt.getTime() + (4*7)*24*60*60*1000); // 4 weeks in the future.


    return Ember.RSVP.hash({
      recommendation:   this.store.find('recommendation', params.partner_id),
      trips:            this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime()-1000) + '&endTime=' + et.getTime(), id: memberId}), //this.store.findQuery('trip', {from: 'members', id: memberId}),
      memberSchedule:   this.store.findQuery('weeklySchedule', {memberId: memberId}),
      partnerTrips:     this.store.findQuery('trip', {from: 'members', id: params.partner_id, endPoint: 'scheduled-parent-trips'}),
      partnerSchedule:  this.store.findQuery('weeklySchedule', {memberId: params.partner_id}),
      partner:          this.store.find('member', params.partner_id)
    });
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.pick_date');

    controller.set('partner', hash.partner);

    var memberId = this.get('memberId');

    var trips = hash.trips;
    var dateHash = this.calendarAfterModelProcessing(controller,  memberId, trips);
    var partnerSchedule = hash.partnerSchedule.objectAt(0).get('dailySchedules');

    // Same for partner, trips only! Only used to signal that they are occupied.
    var partnerTripDateHash = [];
    hash.partnerTrips.forEach(function(trip) {
      partnerTripDateHash[trip.get('formattedMdYPickup')] = true;
    });

    var dt = this.get('monday');
    var td = this.get('today');
    var defaultStatus = "<span class='lessDim'>Both Available</span>";
    var calendar = [];
    var format = new TimeDateFormatting();
    for (var w = 0; w < 4; w++) {
      var calendarWeek =
      {displayDate:'',
        daysOfTheWeek: [
          {id: 'Monday',    time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Tuesday',   time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Wednesday', time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Thursday',  time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Friday',    time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Saturday',  time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false},
          {id: 'Sunday',    time: null, trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: '', memberTrips: null, hasProposedTrip: false, isInNegotiation: false, memberIsAvailable: true, memberIsScheduled: false, memberStatus: '', partnerIsAvailable: false, partnerStatus: '', bothAreAvailable: false}
        ]};
      calendar.push(calendarWeek);
      calendarWeek.displayDate = format.formatDateMonthDayYear(dt);
      for (var nextTripDate=0; nextTripDate < 7; nextTripDate++) {
        var calendarDay = calendarWeek.daysOfTheWeek[nextTripDate];
        calendarDay.time = dt.getTime();
        calendarDay.displayDate = format.formatDateDay(dt);

        calendarDay.inThePast = timezonejsDate(dt).getTime() < td;
        calendarDay.isToday = timezonejsDate(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() === td;

        this.processMemberDay(controller, dateHash[format.formatDateMonthDayYear(dt)], calendarDay);
        this.processPartnerDay(controller, partnerTripDateHash[format.formatDateMonthDayYear(dt)], calendarDay, partnerSchedule, nextTripDate);

        // Silly but to make thing easier in HandleBars...
        calendarDay.bothAreAvailable = calendarDay.memberIsAvailable && calendarDay.partnerIsAvailable;

        dt.setTime(dt.getTime() + 24*60*60*1000);                              // Add a day for the next round
      }
    }

    calendar.forEach(function(weeklySchedule){
      weeklySchedule.daysOfTheWeek.forEach(function(daySchedule){
        var notFirst = false;
        // Is this one a day that has a trip scheduled?
        if (!Ember.isNone(daySchedule.memberTrips) && (daySchedule.isInNegotiation || daySchedule.memberIsScheduled)) {
          daySchedule.memberTrips.forEach(function(trip){
            Ember.$.ajax({
              type: 'GET',
              url: Ember.ENV.APIHOST + '/members/' + trip.get('ownerId'),
              async: false
            }).then(function(response){
              var owner = response.member.firstName;
              var ownerId = response.member.id;
              Ember.$.ajax({
                type: 'GET',
                url: Ember.ENV.APIHOST + '/members/' + trip.get('riderId'),
                async: false
              }).then(function(response){
                var rider = response.member.firstName;
                var status = '';
                if (ownerId === memberId) {
                  status = rider;
                } else {
                  status = owner;
                }

                if (notFirst) {
                  status = '<br>' + status;
                } else {
                  notFirst = true;
                }

                daySchedule.memberStatus =  daySchedule.memberStatus.replace('with', 'with ' + status);
              }).fail(function(error){
                new GenericModalDialog().modalDialog(
                  {
                    dialogTitle: Em.I18n.translations.error.trip.detail.load.title,
                    dialogImageUrl: '/assets/img/icon-car-blue.png',
                    dialogImageTitle: Em.I18n.translations.error.trip.detail.load.id,
                    dialogText: Em.I18n.translations.error.trip.detail.load.message
                  });
                Ember.Logger.debug("trip detail route: " + error.status + error.responseText);
              });
            }).fail(function(error){
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.trip.detail.load.title,
                  dialogImageUrl: '/assets/img/icon-car-blue.png',
                  dialogImageTitle: Em.I18n.translations.error.trip.detail.load.id,
                  dialogText: Em.I18n.translations.error.trip.detail.load.message
                });
              Ember.Logger.debug("trip detail route: " + error.status + error.responseText);
            });
          });
        }
      });
    });

    controller.set('calendar', calendar);
  },

  processMemberDay: function(controller, data, calendarDay) {
    // Set up the member trip status for this day...
    var status = ""; //"You " + (calendarDay.inThePast ? "were" : "are") + " available to carpool";
    // Is there a trip already on this day?
    if (data) {
      calendarDay.trips = data.trips; //
      calendarDay.status = data.status;
      calendarDay.statusCode = data.statusCode;
      calendarDay.driving = data.driving;
      calendarDay.outboundStatusCode = data.outboundStatusCode;
      calendarDay.inboundStatusCode = data.inboundStatusCode;
      calendarDay.memberTrips = data.trips;

      for(var d = 0; d < data.trips.length; d++) {
        if (data.trips[d].get('isRinStatusNew')) {
//          status = "You " + (calendarDay.inThePast ? "were" : "are") + " planning with";
          calendarDay.hasProposedTrip = true;
          calendarDay.memberIsAvailable = true;
          calendarDay.isInNegotiation = true;
          break;
        } else if (data.trips[d].get('isRinStatusAccepted') && !data.trips[d].get('isStatusCancelledOrDeclined')) {
//          status = "You " + (calendarDay.inThePast ? "were" : "are") + " scheduled with";
          calendarDay.hasProposedTrip = false;
//          calendarDay.memberTrips = [data.trips[d]];
          calendarDay.memberIsScheduled = true;
          calendarDay.memberIsAvailable = false;
          calendarDay.isInNegotiation = false;
          break;
        }
      }
    } else {
      calendarDay.memberIsAvailable = !calendarDay.inThePast;
    }
//    calendarDay.memberStatus = "<span class='dim'>" + status + "</span>";
  },

  processPartnerDay: function(controller, data, calendarDay, partnerSchedule, tripDay) {
    // Set up the partner trip status for this day...
    calendarDay.partnerIsAvailable = Ember.isNone(data) && partnerSchedule.objectAt(tripDay).get('id') !== '-1' && !calendarDay.inThePast;
    // calendarDay.partnerStatus = (calendarDay.partnerIsAvailable ? '' : 'Not ') + 'Available to Carpool';
    if(!calendarDay.partnerIsAvail && !calendarDay.memberIsAvailableable){
      calendarDay.partnerStatus = "<span class='dim'>" + controller.get('partner.firstName') + " " + (calendarDay.inThePast ? "was" : "is") + "n't available</span>";
    }
  },


  actions: {
    didTransition: function() {
      var loginController = this.controllerFor('member.calendar').get('controllers.login');
      if (loginController.get('refresh')) {
        loginController.set('refresh', true);
        loginController.send('refreshOnce');
      }
    }
  }
});

export default MemberPickDateRoute;
