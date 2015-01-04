var MsgActionButtonComponent = Ember.Component.extend({
  tagName           : 'button',
  attributeBindings : ['action', 'disabled'],
  classNames        : ['btn', 'btn-primary'],

  initialize: function() {
  },

  click: function(e) {
    this.sendAction(undefined, e.altKey && e.shiftKey);
  },

  didInsertElement: function() {
    this.initialize();
  }
});

export default MsgActionButtonComponent;

