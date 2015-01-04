import RideMatchMixinController from 'appkit/mixins/ride_match_mixin_controller';
import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';

var MemberRideMatchController = Ember.ArrayController.extend(RideMatchMixinController, TaglineMixinController, {
  needs: ['application', 'currentMember', 'member', 'login'],

  onRideMatch: true,

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  }.property('controllers.currentMember.member'),

  actions: {
    profile: function(id) {
      this.transitionToRoute('member.profile', id);
    }
  }

});

export default MemberRideMatchController;
