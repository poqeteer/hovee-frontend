import AuthenticatedRoute from 'appkit/routes/authenticated';
import RideMatchMixinRoute from 'appkit/mixins/ride_match_mixin_route';

var MemberRideMatchRoute = AuthenticatedRoute.extend(RideMatchMixinRoute, {
  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  member: null,

  model: function() {
    var member = this.modelFor('member');
    this.set('member', member);
    return this.store.findQuery('recommendation', { memberId: member.get('id') });
  },
  afterModel: function(recommendations) {
    var controller = this.controllerFor('member.ride_match');
    this.rideMatchAfterModelProcessing(controller, recommendations, this.get('member'));
  },

  actions: {
    willTransition: function() {
      this.controllerFor('member.ride_match').set('map', null);

      // The willTransition isn't firing in application so need to do it here...
      this.controllerFor('application').send('closeMobileMenu');
    }
  }

});

export default MemberRideMatchRoute;
