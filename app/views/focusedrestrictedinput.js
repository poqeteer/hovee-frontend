var FocusedRestrictedInput = Ember.TextField.extend({
  attributeBindings: ['maxlength'],

  // didInsertElement: function() {
  //   Ember.Logger.debug('inserted FocusedRestrictedInput');
  //   this.$().focus();
  // },

  keyPress : function (e) {
    if (e.keyCode === 60 || e.keyCode === 62) return false;
  }
});

export default FocusedRestrictedInput;
