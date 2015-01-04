import AuthenticatedRoute from 'appkit/routes/authenticated';

var MaintenanceRoute = AuthenticatedRoute.extend({

  setupController: function(controller) {
    var loginController = controller.get('controllers.login');
    loginController.set('showFooter', false);
    loginController.set('displayMenu', false);
    loginController.set('isOnBoardingProfile', true);
  },

  actions: {

    willTransition: function(transition) {
      this.controllerFor('application').send('logout');
    }
  }

});

export default MaintenanceRoute;