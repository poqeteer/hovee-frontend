var IncompleteController = Ember.Controller.extend({
  needs: ['application', 'login', 'currentMember']
});

export default IncompleteController;
