import BaseRoute from 'appkit/routes/base';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var RegistrantRoute = Ember.Route.extend(BaseRoute, {
   model: function(params) {
     return Ember.$.ajax({
       type: 'GET',
       url: Ember.ENV.APIHOST + '/registrants/' + params.registrantKey + '/' + decodeURIComponent(params.email) + '/validate'
     });
     //return this.store.find('registrant', params.registrantKey);
   },

  actions: {

    error: function(reason, transition) {
      if (reason.status === 503) {
        window.location.assign('#/maintenance');
      } else {
        Ember.Logger.error('authenticated.js :: ' + reason.status);
        Ember.Logger.error('authenticated.js :: ' + reason.responseText);
        this.controllerFor('application').transitionToRoute('registrants.reg_error');
      }
    }
  }
});

export default RegistrantRoute;
