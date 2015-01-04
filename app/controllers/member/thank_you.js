var MemberThankYouController = Ember.ObjectController.extend(Ember.Evented, {
  needs: ['member','application','login']
});

export default MemberThankYouController;
