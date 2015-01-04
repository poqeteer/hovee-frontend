import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberLoadingRoute = AuthenticatedRoute.extend({

  actions: {
    didTransition: function() {
      var loginController = this.controllerFor('login');
      if (loginController.get('refresh')) {
        loginController.set('refresh', true);
        loginController.send('refreshOnce');
      } else {
        loginController.set('showFooter', true);
        var controller = this.controllerFor('login');
        var attemptedTransition = controller.get('attemptedTransition');
        // Go to the page the user intended if possible.
        if(attemptedTransition) {
          var currentLocation = window.location.href;
          var newLocation = currentLocation.substr(0, currentLocation.indexOf('#') + 1) + attemptedTransition;
          Ember.run.schedule('afterRender', this, function () {
            window.location.replace(newLocation);
          });
          //attemptedTransition.retry();
          controller.set('attemptedTransition', null);
          window.localStorage.removeItem('attemptedTransition');
        } else {
            controller.transitionToRoute('member.rides');
        }
      }
    }
  }
});

export default MemberLoadingRoute;
