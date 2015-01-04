import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberTripDetailRoute = AuthenticatedRoute.extend({
  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(params){
    var controller = this.controllerFor('member.trip_proposal');
    controller.transitionToRoute('member.trip_proposal', params.partner_id, params.trip_id, 0);
  }
});

export default MemberTripDetailRoute;
