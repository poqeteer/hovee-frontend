import BaseRoute from 'appkit/routes/base';

var LoginRoute = Ember.Route.extend(BaseRoute, {

  beforeModel: function() {
    // If the user is already logged in then jump to the home page
    var controller = this.controllerFor('login');
    if (controller.get('loggedIn')) {
      controller.send('transitionToHomePage', controller, controller.get('memberId'));
    }
  },

  setupController: function(controller, model) {
    controller.resetProperties();
  },

  actions: {
    didTransition: function() {
      // Used to signal to refresh the login page... This in an attempt to kill the connection to server.
//      this.controllerFor('login').send('refreshOnce');
    }
  }
});

export default LoginRoute;
