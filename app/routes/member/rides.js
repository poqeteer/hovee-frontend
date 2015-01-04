/**
 * Created by lancemock on 11/10/14.
 */
import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import RideMatchMixinRoute from 'appkit/mixins/ride_match_mixin_route';
import RidesMixinRoute from 'appkit/mixins/rides_mixin_route';

var MemberRidesRoute = AuthenticatedRoute.extend(RideMatchMixinRoute, RidesMixinRoute, {

  member: null,

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(){
    var member = this.modelFor('member');
    this.set('member', member);
    //this.controllerFor('member.calendar').set('memberId', member.get('id'));

    var timeDateUtil = new TimeDateFormatting();
    var dt = timezonejsDate();
    // We want to start on Monday, even if is past
    dt = timeDateUtil.findMonday(dt);
    dt.setTime(dt.getTime() - 24*60*60*1000); //Well... Sunday actually
    dt.setHours(1,1,1);
    var et = timezonejsDate(dt.getTime() + (4*7)*timeDateUtil.get('twentyFourHoursMS')); // 4 weeks in the future.
    var controller = this.controllerFor('member.rides');
    if (Ember.isNone(controller.get('recommendations'))) {
      return Ember.RSVP.hash({
        trips: this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime() - 1000) + '&endTime=' + et.getTime(), id: member.get('id')}), //{from: 'members', id: member.get('id'), endPoint: 'trips'}),
        sched: this.store.findQuery('weeklySchedule', {memberId: member.get('id')}),
        recommendations: this.store.findQuery('recommendation', { memberId: member.get('id') })
      });
    } else {
      return Ember.RSVP.hash({
        trips: this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime() - 1000) + '&endTime=' + et.getTime(), id: member.get('id')}), //{from: 'members', id: member.get('id'), endPoint: 'trips'}),
        sched: this.store.findQuery('weeklySchedule', {memberId: member.get('id')})
      });
    }
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.rides');
    
    controller.set('sched', hash.sched);
    controller.set('trips', hash.trips);
    controller.set('showTripList', hash.trips.get('length') > 0);

    var member = this.get('member');
    controller.set('homeLocations', this.store.findQuery('homeLocation', {memberId: member.get('id')}));

    controller.set('homeLocation', member.get('homeLocation'));
    controller.set('oldHomeLocation', member.get('homeLocation'));

    this.store.findQuery('workLocation', {memberId: member.get('id')}).
      then(function(locations) {
        controller.set('workLocations', locations);
      }).catch(function(){
        window.console.error('work locations lookup did not work');
      });
    Ember.RSVP.hash({
      location: member.get('workLocation')
    }).then (function (work){
      member.set('workLocation', work.location);
      controller.set('workLocation', member.get('workLocation'));
    });

    controller.set('member', this.get('member'));
    controller.set('listMapMode', 'list');

    this.ridesAfterModelProcessing(controller, member, hash.trips);

    if (!Ember.isNone(hash.recommendations)){
      if (!member.get('hasCar')) {
        controller.set('driverMode', 'passenger');
      }
      this.rideMatchAfterModelProcessing(controller, hash.recommendations, this.get('member'));
    } else {
      controller.computeMapHeight(controller);
      if (controller.get('showMatches')) {
        if (controller.get('controllers.application.beenToProfile')) {
          controller.set('controllers.application.beenToProfile', false);
          controller.send('goToRideMatch');
        } else {
          var recommendations = controller.get('recommendations');
          recommendations.forEach(function(recommendation){
            controller.processRecommendation(controller, recommendation, hash.trips);
          });
        }
      }
      Ember.run.schedule('afterRender', this, function () {
        controller.resetOptionToggles(controller);
      });
    }

    // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
    var schedule = hash.sched.objectAt(0).get('dailySchedules');
    for (var row = 0; row < 7; row++) {
      if (schedule.objectAt(row).get('id') !== '-1') {
        controller.set('homeDepartureTime', schedule.objectAt(row).get('homeDepartureTime'));
        controller.set('workDepartureTime', schedule.objectAt(row).get('workDepartureTime'));
        break;
      }
    }
    this.controllerFor('application').set('onRideMatch', true);

    var delay = controller.get('showHelpSeconds');
    Ember.run.schedule('afterRender', this, function () {
      setTimeout(function(){
        if (controller.get('showMonthHelp') && (Ember.isNone(controller.get('trips')) || controller.get('trips.length')=== 0)) {
          controller.send('openHelp');
        }
        controller.set('showMonthHelp', false);
      }, delay);
    });

  },

  actions: {
    willTransition: function() {
      // The willTransition isn't firing in application so need to do it here...
      this.controllerFor('application').send('closeMobileMenu');
      this.controllerFor('application').set('onRideMatch', false);
    }
  }
});

export default MemberRidesRoute;
