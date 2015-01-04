import BaseRoute from 'appkit/routes/base';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var AuthenticatedRoute = Ember.Route.extend(BaseRoute, {
  beforeModel: function(transition) {

    /***
     * Blank on purpose....
     */

  },

  redirectToLogin: function(transition) {
    var loginController = this.controllerFor('login');
    loginController.set('attemptedTransition', transition.intent.url);
    window.localStorage.attemptedTransition = transition.intent.url;
    this.transitionTo('login');
  },

  actions: {
    error: function(reason, transition) {
      if (reason.status === 503) {
        window.location.assign('#/maintenance');
      } else { //if (reason.status === 401) {
        this.controllerFor('login').send('refreshToken', true);
      }
      Ember.Logger.error('authenticated.js :: ' + reason.message);
      Ember.Logger.error('authenticated.js :: ' + reason.stack);
    }
  }
});

export default AuthenticatedRoute;
