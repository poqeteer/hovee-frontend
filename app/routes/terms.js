import BaseRoute from 'appkit/routes/base';

var TermsRoute = Ember.Route.extend(BaseRoute, {

  afterModel: function(member) {
    this.controllerFor('login').set('isOnBoardingProfile', true);
  }
});

export default TermsRoute;
