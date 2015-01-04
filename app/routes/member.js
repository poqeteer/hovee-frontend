import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

import AuthenticatedRoute from 'appkit/routes/authenticated';

var MemberRoute = AuthenticatedRoute.extend({
  model: function(params) {

    // The following is a kludge because for some reason the find doesn't fire a prefilter so on refresh the find will
    // return a 401...


    /***
     * Blank on purpose....
     */

  },

  actions: {
    error: function (reason, transition) {
      if (reason.status === 503) {
        window.location.assign('#/maintenance');
      } else if (reason.status === 401) {
//        this.controllerFor('login').send('refreshToken');
        this.redirectToLogin(transition);
      } else {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.member.load.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.member.load.id,
            dialogText: Em.I18n.translations.error.member.load.message
          });
        Ember.Logger.error('authenticated.js :: ' + reason.message);
        Ember.Logger.error('authenticated.js :: ' + reason.stack);
      }
    }
  }
});

export default MemberRoute;
