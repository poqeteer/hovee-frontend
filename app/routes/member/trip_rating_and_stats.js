import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberTripRatingAndStatsRoute = AuthenticatedRoute.extend({

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params){
    return this.store.find('trip', params.trip_id );
  },

  setupController: function(controller, trip) {
    var driverId = trip.get('driverId');
    var member = this.modelFor('member');
    var ownerId = trip.get("ownerId");
    var riderId = trip.get("riderId");
    controller.set("partner", (member.id === ownerId ? trip.get("rider") : trip.get("owner")));
    controller.set('memberId', member.id);
    controller.set('tripId', trip.get('id'));
    controller.set('isRated', false);

    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/trips/' + trip.get('id') + '/ratings',
      async: false
    }).then(function(result) {
      if (result.ratings.length > 0) {
        for (var i=0; i < result.ratings.length; i++) {
          if (result.ratings[i].raterId === parseInt(member.get('id'),10)) {
            controller.set('isRated', true);
            controller.set('rating', result.ratings[i].score);
            break;
          }
        }
      }
    });

    Ember.RSVP.hash({
      riderHomeLocation: trip.get('riderHomeLocation'),
      riderWorkLocation: trip.get('riderWorkLocation'),
      memberHomeLocation: trip.get('memberHomeLocation'),
      memberWorkLocation: trip.get('memberWorkLocation')
    }).then(function(hash) {

      // NOTE: This assumes we are only getting the child trips!!!
      var isReturnTrip = Ember.isNone(trip.get('pickupTimestamp'));

      if (driverId === ownerId) {
        if (isReturnTrip){
          controller.set('waypoints', [{location: hash.riderWorkLocation.get('addressCityState')}, {location: hash.riderHomeLocation.get('addressCityState')}]);
          controller.set('from', hash.memberWorkLocation.get('addressCityState'));
          controller.set('to', hash.memberHomeLocation.get('addressCityState'));
        } else {
          controller.set('waypoints', [{location: hash.riderHomeLocation.get('addressCityState')}, {location: hash.riderWorkLocation.get('addressCityState')}]);
          controller.set('from', hash.memberHomeLocation.get('addressCityState'));
          controller.set('to', hash.memberWorkLocation.get('addressCityState'));
        }
      } else {
        if (isReturnTrip){
          controller.set('waypoints', [{location: hash.memberWorkLocation.get('addressCityState')}, {location: hash.memberHomeLocation.get('addressCityState')}]);
          controller.set('from', hash.riderWorkLocation.get('addressCityState'));
          controller.set('to', hash.riderHomeLocation.get('addressCityState'));
        } else {
          controller.set('waypoints', [{location: hash.memberHomeLocation.get('addressCityState')}, {location: hash.memberWorkLocation.get('addressCityState')}]);
          controller.set('from', hash.riderHomeLocation.get('addressCityState'));
          controller.set('to', hash.riderWorkLocation.get('addressCityState'));
        }
      }

    }).catch(function(error) {
//      controller.get('controllers.application').notify({message: 'Could not retrieve trip info. Please try again.'});
      Ember.Logger.debug('error getting location info ' + error.status);
    });

    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/trips/' + trip.get('id') + "/stats"
    }).then(function(tripStatsJson){
      var milesDriven = 0;
      var totalTime = 0;
      var carbs = 0;
      if(tripStatsJson.stats.length > 0) {
        var stats = tripStatsJson.stats[0];
        milesDriven = (stats.meters / 1609.34).toFixed(1);
        totalTime = stats.minutes;
        carbs = stats.carbs;
      }
      controller.set("milesDriven", milesDriven);
      controller.set("totalTime", totalTime);
      controller.set("carbs", carbs);
    }).
    fail(function(error){
      Ember.Logger.error("Unable to find trip stats, trip: " + trip.get('id'));
    });

    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/members/' + member.id + "/stats"
    }).then(function(memberStatsJson){
      var month = (new Date()).getMonth() + 1;
      var statsArray = memberStatsJson.stats;
      var length = statsArray.length;
      var stats;
      for (var i=0; i<length; i++) {
        if (statsArray[i].month === month) {
          stats = statsArray[i];
          break;
        }
      }
      if (stats) {
        controller.set("totalTrips", stats.numTrips);
        controller.set("tripsAsDriver", stats.numTripsDriven);
        controller.set("totalCarbsSaved", stats.carbs);
      } else {
        Ember.Logger.error("member stats JSON is bad for member " + member.id + ".  JSON is ", memberStatsJson);
      }
    }).
    fail(function(error){
      Ember.Logger.error("Unable to find member stats, member: " + member.id);
    });

  }
});

export default MemberTripRatingAndStatsRoute;
