var TagController = Ember.ObjectController.extend({
  needs: ['application', 'currentMember', 'member'],

  isLabel: true,
  actions: {
    labelClick: function() {
      this.set('isLabel', false);
    },
    saveTag: function() {
      window.alert('save');
    }
  }
});

export default TagController;
