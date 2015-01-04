import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberThankYouRoute = AuthenticatedRoute.extend({

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function() {
    var member = this.modelFor('member');
    return member.reload(true);
  }
});

export default MemberThankYouRoute;