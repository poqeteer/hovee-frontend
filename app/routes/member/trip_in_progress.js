import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberTripInProgressRoute = AuthenticatedRoute.extend({

  memberId: null,

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params){
    this.controllerFor('member.trip_in_progress').set('isNextTrip', params.flag === 'x');

    var member = this.modelFor('member');
    this.set('memberId', member.get('id'));
    this.set('tripId', params.trip_id);
    return this.store.find('trip', params.trip_id);
  },

  afterModel: function(trip) {
    var controller = this.controllerFor('member.trip_in_progress');
    var memberId = this.get('memberId');
    var isDriver = trip.get('driverId') === memberId;

    if (Ember.isNone(trip.get('inProgressStatus')) ? 0 : trip.get('inProgressStatus') > 0) {
      controller.set('isNextTrip', true);
    }

    controller.set('homeDepartureTime', '');
    controller.set('workDepartureTime', '');
    controller.set('timePassengerHomeToPassengerWork', 0);

    // Be careful messing with these flags. The control if the updates in base_trip fire!
    // Disable them so the times are automatically updated in the reviewTrip
    controller.set('inHomeDepartureTimeChange', false);
    controller.set('inWorkDepartureTimeChange', false);

    // Call to compute the times and other stuff to review the trip...
    new GroupWaypoints().reviewTrip(controller, trip, memberId);

    if (trip.get('inProgressStatus') > 0) {
      controller.readTIPActions(controller, trip);
    }

    controller.set('isDriver', isDriver);
    controller.set('isDriverTxt', isDriver ? 't' : 'f');
    controller.set('tripDate', trip.get('hasPickupTimestamp') ? trip.get('formattedMdPickup') : trip.get('formattedMdReturn'));
    controller.set('tripId', trip.get('id'));

    // NOTE: This assumes we are only getting the child trips!!!
    controller.set('isReturnTrip', Ember.isNone(trip.get('pickupTimestamp')));

    Ember.RSVP.hash({
      owner: trip.get('owner'),
      rider: trip.get('rider')
    }).then(function(members) {
      if (members.owner.get('id') === memberId) {
        controller.set('partner', members.rider);
      } else {
        controller.set('partner', members.owner);
      }
      if (isDriver) {
        controller.set('driverFirstName', 'Your');
        controller.set('passengerFirstName', controller.get('partner.firstName'));
      } else {
        controller.set('driverFirstName', controller.get('partner.firstName'));
        controller.set('passengerFirstName', 'Your');
      }
    }).catch(function(error) {
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: Em.I18n.translations.error.trip.in.progress.load.title,
          dialogImageUrl: '/assets/img/icon-car-blue.png',
          dialogImageTitle: Em.I18n.translations.error.trip.in.progress.load.id,
          dialogText: Em.I18n.translations.error.trip.in.progress.load.message
        });
      Ember.Logger.debug('TIP Error: ' + error.status + " - " + error.responseText);
    });
  },

  actions: {

    didTransition: function() {
      var controller = this.controllerFor('member.trip_in_progress');
      controller.set('pollingEnabled', true); //controller.get('isNextTrip'));
    },

    willTransition: function() {
      var controller = this.controllerFor('member.trip_in_progress');
      controller.set('pollingEnabled', false);
      controller.set('inHomeDepartureTimeChange', false);
      controller.set('inWorkDepartureTimeChange', false);

      // The willTransition isn't firing in application so need to do it here...
      this.controllerFor('application').send('closeMobileMenu');
    }
  }

});

export default MemberTripInProgressRoute;
