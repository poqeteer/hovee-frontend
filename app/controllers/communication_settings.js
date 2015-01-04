/**
 * Created by lancemock on 9/19/14.
 */
var CommunicationSettings = Ember.Controller.extend({
  needs: ['application', 'login', 'member'],

  isProduct: false,
  isRide: false,
  isInvite: false,

  reason: '',

  actions: {
    submit: function() {
      window.open("mailto:support@hovee.com?&subject=Communications Settings&body=:Stop: " +
        (this.get('isProduct') ? "ProductUpdates " : "") +
        (this.get('isRide') ? "RideSuggestions " : "") +
        (this.get('isInvite') ? "InvitationsAlerts " : "") + ":Reason: " + this.get('reason'), "_self");
      this.transitionToRoute('login');
    }
  }

});

export default CommunicationSettings;