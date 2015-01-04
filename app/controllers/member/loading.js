var MemberLoadingController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'currentMember', 'member']

});

export default MemberLoadingController;
