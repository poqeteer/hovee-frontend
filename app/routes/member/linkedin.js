import AuthenticatedRoute from 'appkit/routes/authenticated';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberLinkedinRoute = AuthenticatedRoute.extend({

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  model: function() {
    return this.modelFor('member');
  },

  afterModel: function(member) {
    var controller = this.controllerFor('member.linkedin');
    controller.set('memberLinkedInData', member.get('linkedInProfile.data'));
    controller.set('controllers.login.isOnBoardingProfile', true);

    var setTrack = function() {
      Ember.$.ajax({
        type: 'PUT',
        url: Ember.ENV.APIHOST + '/members/' + member.get('id') + '/tracking',
        data: '{"tracking":{ "fullyOnboarded": false, "onboardingPageId": 1 }}',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).fail(function(error){
        Ember.Logger.debug('linkedin track error ' + error.responseText);
      });
    };

    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/members/' + member.get('id') + '/tracking',
      async: false
    }).then(function(response){
      if (response.tracking.onboardingPageId === null || response.tracking.onboardingPageId === 0) {
        setTrack();
      } else if (response.tracking.onboardingPageId > 1) {
        controller.transitionToRoute('member.profile_main', member.get('id'), 'work');
      }
    }).fail(function(error){
      setTrack();
    });
  },

  actions: {

    willTransition: function(transition) {
      if (transition.router.activeTransition.targetName === 'login' && this.controllerFor('login').get('token')){
        transition.abort();
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Sorry...',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: 'Sorry but that page is no longer available.'
          });
      }
    }
  }

});

export default MemberLinkedinRoute;