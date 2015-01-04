var UpcomingTripsController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'currentMember']
});

export default UpcomingTripsController;